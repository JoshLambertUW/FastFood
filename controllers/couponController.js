var Coupon = require('../models/coupon');
var Restaurant = require('../models/restaurant');
var moment = require('moment');
 
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Coupons.
exports.coupon_list = function(req, res, next) {
  Coupon.find()
    .populate('restaurant', { sort: { 'date_added': -1 } })
    .exec(function (err, list_coupons) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('coupon_list', { title: 'Coupon List', coupon_list: list_coupons });
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
      res.render('', { title: 'Restaurant coupon:', coupon:  coupon});
    })

};

// Display Coupon create form on GET.
exports.coupon_create_get = function(req, res, next) {       
    Restaurant.find({},'name')
    .exec(function (err, restaurants) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('coupon_form', {title: 'Create Coupon', resturant_list:restaurants});
    });
    
};

// Handle Coupon create on POST.
exports.coupon_create_post = [

    body('restaurant', 'Restaurant must be specified').isLength({ min: 1 }).trim(),
    body('description', 'Description must be added').isLength({ min: 1 }).trim(),
    body('code').trim(),
    body('date_expires', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    body('mobile', 'Please check mobile requirement').isBoolean(),
    
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
            date_added: moment().format('MMMM Do, YYYY'),
            date_expires: req.body.date_expires,
            mobile: req.body.mobile,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Restaurant.find({},'name')
                .exec(function (err, restaurants) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('coupon_form', { title: 'Create Coupon', restaurant_list : restaurant, selected_restaurant : coupon.restaurant._id , errors: errors.array(), coupon:coupon });
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
exports.coupon_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Coupon delete GET');
};

// Handle Coupon delete on POST.
exports.coupon_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Coupon delete POST');
};

// Display Coupon update form on GET.
exports.coupon_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Coupon update GET');
};

// Handle coupon update on POST.
exports.coupon_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Coupon update POST');
};