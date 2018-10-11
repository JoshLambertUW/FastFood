var Restaurant = require('../models/restaurant');
var Coupon = require('../models/coupon');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

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

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('site').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a restaurant object with escaped and trimmed data.
        var restaurant = new Restaurant(
          { name: req.body.name,
            site: req.body.site,
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
exports.restaurant_delete_get = function(req, res, next) {
    Restaurant.findById(req.params.id)
    .exec(function (err, restaurant) {
      if (err) { return next(err); }
      if (restaurant==null) { // No results.
          var err = new Error('Restaurant not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('restaurant_delete', { title: 'Delete restaurant', restaurant: restaurant});
    });
};

// Handle restaurant delete on POST.
exports.restaurant_delete_post = function(req, res, next) {
    async.parallel({
        restaurant: function(callback) {
          Restaurant.findById(req.body.restaurantid).exec(callback)
        },
        restaurant_coupons: function(callback) {
          Coupon.find({ 'restaurant': req.body.restaurantid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        else {
            for (var i = 0; i < results.restaurant_coupons.length ; i++){
                Coupon.findByIdAndRemove(results.restaurant_coupons[i]._id, function deleteCoupon(err) {
                if (err) { return next(err); }
                })
            }
            Restaurant.findByIdAndRemove(req.body.restaurantid, function deleteRestaurant(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/restaurants')
            })
        }
    });
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

    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('site').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a restaurant object with escaped/trimmed data and old id.
        var restaurant = new Restaurant(
        {  name: req.body.name,
           site: req.body.site,
           mobile: req.body.mobile ? true : false,
           _id:req.params.id
        });

        if (!errors.isEmpty()) {

            res.render('restaurant_form', { title: 'Edit restaurant', restaurant: restaurant, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Restaurant.findByIdAndUpdate(req.params.id, restaurant, {}, function (err,therestaurant) {
                if (err) { return next(err); }
                   // Successful - redirect to restaurant detail page.
                   res.redirect(therestaurant.url);
                });
        }
    }
];