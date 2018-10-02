var Restaurant = require('../models/restaurant');
var Coupon = require('../models/coupon');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {   
    async.parallel({
        RestaurantCount: function(callback) {
            Restaurant.countDocuments({}, callback);
        },
        CouponCount: function(callback) {
            Coupon.countDocuments({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Fast Food Home', error: err, data: results });
    });
};

// Display list of all restaurants
exports.restaurant_list = function(req, res, next) {
    Restaurant.find({}, 'name', {sort: { 'name': -1 }})
    .exec(function (err, list_restaurants) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('restaurant_list', { title: 'Restaurant List', restaurant_list: list_restaurants });
    });
};

// Display detail page for a specific restaurant.
exports.restaurant_detail = function(req, res, next) {

    async.parallel({
        restaurant: function(callback) {
            Restaurant.findById(req.params.id)
              .exec(callback);
        },
        coupon: function(callback) {

          Coupon.find({ 'restaurant': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.restaurant==null) {
            var err = new Error('Restaurant not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('restaurant_detail', { title: 'Details', restaurant: results.restaurant, coupons: results.coupon } );
    });

};


// Display restaurant create form on GET.
exports.restaurant_create_get = function(req, res, next) { 
    res.render('restaurant_form', { title: 'Add a restaurant' });
};

// Handle restaurant create on POST.
exports.restaurant_create_post = [

    // Validate input
    body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize field
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a restaurant object with escaped and trimmed data.
        var restaurant = new Restaurant(
          { name: req.body.name,
            mobile: req.body.mobile ? true : false,
          });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('restaurant_form', { title: 'Add a restaurant', restaurant: restaurant, errors: errors.array()});
        return;
        }
        else {
            Restaurant.findOne({ 'name': req.body.name })
                .exec( function(err, found_restaurant) {
                     if (err) { return next(err); }

                     if (found_restaurant) {
                         res.redirect(found_restaurant.url);
                     }
                     else {
                         restaurant.save(function (err) {
                           if (err) { return next(err); }
                           res.redirect(restaurant.url);
                         });

                     }

                 });
        }
    }
];

// Display restaurant delete form on GET.
exports.restaurant_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: restaurant delete GET');
};

// Handle restaurant delete on POST.
exports.restaurant_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: restaurant delete POST');
};

// Display restaurant update form on GET.
exports.restaurant_update_get = function(req, res, next) {

    // Get restaurant, authors and genres for form.
    async.parallel({
        restaurant: function(callback) {
            restaurant.findById(req.params.id).exec(callback);
        },
        //async for future expansion
    }, function(err, results) {
            if (err) { return next(err); }
            if (results.restaurant==null) { // No results.
                var err = new Error('Restaurant not found');
                err.status = 404;
                return next(err);
            }
            res.render('restaurant_form', { title: 'Edit restaurant', restaurant: results.restaurant });
        });
};

// Handle restaurant update on POST.
exports.restaurant_update_post = [
   
    // Validate fields.
    body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('mobile', 'Please check mobile requirement').isBoolean(),

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a restaurant object with escaped/trimmed data and old id.
        var restaurant = new Restaurant(
        {  name: req.body.name,
           mobile: req.body.mobile ? true : false,
        });

        if (!errors.isEmpty()) {

            res.render('restaurant_form', { title: 'Edit restaurant', restaurant: restaurant, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid. Update the record.
            restaurant.findByIdAndUpdate(req.params.id, restaurant, {}, function (err,therestaurant) {
                if (err) { return next(err); }
                   // Successful - redirect to restaurant detail page.
                   res.redirect(therestaurant.url);
                });
        }
    }
];