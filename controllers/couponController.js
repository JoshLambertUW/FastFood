var Coupon = require('../models/coupon');
var Restaurant = require('../models/restaurant');
var moment = require('moment');
var consts = require('../consts.js');
var mongoose = require('mongoose');
 
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all Coupons.
exports.coupon_list = function(req, res, next) {
    res.render('coupon_list', { title: 'Coupon List', coupon_list: res.locals.list_coupons, pref: req.sortOption});
};

exports.coupon_array = function(req, res, next){
    var sortPref = 0;
    var pageType = req.path.split('/')[1];
    var searchQuery = {};
    var sortQuery = {};
    
    console.log(req.session.expiredPref);
    console.log(req.query.expired);
    
    if (!req.session.expiredPref && !req.query.expired) searchQuery['expired'] = {$in: [null, false]};
    
    else if (req.query.expired){
        req.session.expiredPref = req.query.expired;
    }
    
    if (req.query.sortBy){
        if (req.user){
            req.session.sortByPref = req.query.sortBy;
        }
        sortPref = req.query.sortBy;
    }
    
    else if (req.user && req.session.sortByPref){
        sortPref = req.session.sortByPref;
    }
    
    req.sortOption = sortPref;
    sortQuery[sortOptions[sortPref]] = sortOptionOrders[sortPref];
    
    if (pageType == 'profile'){
        searchQuery['user'] = req.user.id;
    }
    else if (pageType == 'restaurant'){
        searchQuery['restaurant'] = req.params.id;
    }
    
    Coupon.find(searchQuery)
      .sort(sortQuery)
      .populate('restaurant')
      .exec(function (err, list_coupons) {
          if (err) { return next(err) }
              res.locals.list_coupons = list_coupons;
              next();
          });
};

// Display detail page for a specific Coupon.
exports.coupon_detail = function(req, res, next) {
    Coupon.findById(req.params.id)
    .populate('restaurant')
    .exec(function (err, coupon) {
      if (err) { return next(err); }
      if (coupon==null) { // No results.
          var err = new Error('Coupon not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      var upVote = 'Upvote';
      var downVote = 'Downvote';
      if (req.user){
        if (coupon.upvoted(req.user.id)) upVote = 'Upvoted';
        else if (coupon.downvoted(req.user.id)) downVote = 'Downvoted';
      }
      
      res.render('coupon', { title: 'Coupon details', coupon: coupon, user: req.user, upVote: upVote, downVote: downVote});
    })
};

exports.vote_coupon = function(req, res, next){
    if (req.body.direction != 0 && req.body.direction != 1){
        return next();
    }
    else {
        Coupon.findById(req.params.id)
        .exec(function (err, coupon){
            if (err) { return next(err);}
            if (coupon == null){
                res.redirect('/coupons');
            }
            
            if (req.body.direction === 1){
                if (coupon.downvoted(req.userid)){
                    coupon.unvote(req.user.id, function(err){
                        if (err) { return next(err);}
                    });
                }               
                if (coupon.upvoted(req.user.id)){
                    coupon.unvote(req.user.id, function(err){
                        if (err) { return next(err);}
                        res.redirect('/coupon/' + req.params.id);
                    });
                }               
                else {
                    coupon.upvote(req.user.id, function(err){
                        if (err) { return next(err);}
                        res.redirect('/coupon/' + req.params.id);
                    });
                }
            }
            else {
                if (coupon.upvoted(req.userid)){
                    coupon.unvote(req.user.id, function(err){
                        if (err) { return next(err);}
                    });
                }
                if (coupon.downvoted(req.user.id)){
                    coupon.unvote(req.user.id, function(err){
                        if (err) { return next(err);}
                        res.redirect('/coupon/' + req.params.id);
                    });
                }
                else {
                    coupon.downvote(req.user.id, function(err){
                        if (err) { return next(err);}
                        res.redirect('/coupon/' + req.params.id);
                    });
                }
            }
        });
    }
};
    
// Display Coupon create form on GET.
exports.coupon_create_get = function(req, res, next) {    
    Restaurant.find({},'name',{ sort: { 'name': 1 } })
    .exec(function (err, restaurants) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('coupon_form', {title: 'Create a coupon', restaurant_list:restaurants});
    });
    
};

// Handle Coupon create on POST.
exports.coupon_create_post = [
    body('restaurant', 'Restaurant must be specified').isLength({ min: 1 }).trim(),
    body('description', 'Description must be added').isLength({ min: 1 }).trim(),
    body('code').trim(),
    body('date_expires', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('restaurant').trim().escape(),
    sanitizeBody('description').trim().escape(),
    sanitizeBody('code').trim().escape(),
    sanitizeBody('date_expires').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        const errors = validationResult(req);

        // Create a Coupon object with escaped and trimmed data.
        var coupon = new Coupon(
          { restaurant: req.body.restaurant,
            description: req.body.description,
            code: req.body.code,
            date_added: new Date(),
            date_expires: req.body.date_expires,
            mobile: req.body.mobile ? true : false,
            user: req.user,
         });

        coupon.upvote(req.user.id);
         
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Restaurant.find({},'name')
                .exec(function (err, restaurants) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('coupon_form', { title: 'Create a coupon', restaurant_list : restaurant, selected_restaurant : coupon.restaurant._id , errors: errors.array(), coupon:coupon });
            });
            return;
        }
        else {
            // Data from form is valid.
            coupon.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(coupon.url);
                });
        }
    }
];

// Display Coupon delete form on GET.
exports.coupon_delete_get = function(req, res, next) {
    Coupon.findById(req.params.id)
    .exec(function (err, coupon) {
      if (err) { return next(err); }
      if (coupon == null){
          res.redirect('/coupons');
      }
      // Successful, so render.
      res.render('coupon_delete', {title: 'Delete coupon', coupon: coupon});
    });
};

// Handle Coupon delete on POST.
exports.coupon_delete_post = function(req, res, next) {  
    Coupon.findById(req.params.id)
    .exec(function (err, results) {
      if (err) { return next(err); }
      if (req.user.id != results.user._id && !req.user.admin){
          return next({Code: 403, error:'Access denied'});
      }
      else {
        Coupon.findByIdAndRemove(req.params.id, function (err, results) {
            if (err) { return next(err); }
            res.redirect('/coupons');
        });
      }
    });
};

// Display Coupon update form on GET.
exports.coupon_update_get = function(req, res, next) {
    
    // Get restaurant for form
    async.parallel({
        coupon: function(callback) {
            Coupon.findById(req.params.id).populate('restaurant').exec(callback);
        },
        restaurants: function(callback){
            Restaurant.find(callback);
        },
    }, function(err, results) {
            if (err) { return next(err); }
            if (results.coupon==null) { // No results.
                var err = new Error('Coupon not found');
                err.status = 404;
                return next(err);
            }
            res.render('coupon_form', { title: 'Edit coupon', coupon: results.coupon, restaurant_list: results.restaurants });
        });
};

// Handle coupon update on POST.
exports.coupon_update_post = [
    // Validate fields.
    body('restaurant', 'Restaurant must be specified').isLength({ min: 1 }).trim(),
    body('description', 'Description must be added').isLength({ min: 1 }).trim(),
    body('code').trim(),
    body('date_expires', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('restaurant').trim().escape(),
    sanitizeBody('description').trim().escape(),
    sanitizeBody('code').trim().escape(),
    sanitizeBody('date_expires').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create a restaurant object with escaped/trimmed data and old id.
        var coupon = new Coupon(
          { restaurant: req.body.restaurant,
            description: req.body.description,
            code: req.body.code,
            date_added: new Date(),
            date_expires: req.body.date_expires,
            mobile: req.body.mobile ? true : false,
            _id:req.params.id,
            user: req.user.id,
          });

        if (!errors.isEmpty()) {
            return res.render('coupon_form', { title: 'Edit coupon', coupon: coupon, errors: errors.array()});
        }
        else {
            Coupon.findById(req.params.id).exec(function (err, results){
                if (err) { return next(err); }
                if (req.user.id != results.user._id && !req.user.admin){
                    return next({Code: 403, error:'Access denied'});
                } else {
                    Coupon.findByIdAndUpdate(req.params.id, coupon, {}, function (err,thecoupon) {
                    if (err) { return next(err); }
                        // Successful - redirect to detail page.
                    res.redirect(thecoupon.url);
                    });
                }
            });
        }
    }
];