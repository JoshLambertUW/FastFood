var Restaurant = require('../models/restaurant');
var Coupon = require('../models/coupon');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.MAPS_KEY,
});

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
    Restaurant.findById(req.params.id)
    .exec(function(err, results){
        if (err){ return next(err);}
        if (results==null) {
            var err = new Error('Restaurant not found');
            err.status = 404;
            return next(err);
        }
        if (!req.user || req.user.restaurants.indexOf(req.params.id) < 0 ) {favMsg = 'Add to favorites';}
        else {favMsg = 'Remove from favorites';}
        console.log(req.session.expiredPref);
        res.render('restaurant_detail', { title: 'Details', restaurant: results, coupon_list: res.locals.list_coupons, pref: req.sortOption, expiredPref: req.session.expiredPref, favOption: favMsg});
    });
};

exports.restaurant_location_get = function(req, res, next) {
    
    var lat = 0;
    var lng = 0;
    
    //Sanitize input
    googleMapsClient.geocode({
      address: req.query.user_location }, (function(err, response) {
      if (err) { 
        console.log(req.query.user_location)
        console.log(err);
        return next(err); }
      lat = response.json.results[0].geometry.location.lat;
      lng = response.json.results[0].geometry.location.lng;
      Restaurant.findById(req.params.id)
        .exec(function(err, results){
        if (err){ console.log(err); return next(err);}
        if (results==null) {
            var err = new Error('Restaurant not found');
            err.status = 404;
            return next(err);
        }
        googleMapsClient.places({
          query: results.name,
          location: [lat, lng],
          radius: 10000,
          type: 'restaurant'
          }, (function(err, loc){
          if (err) { console.log(err); return next(err); }
          console.log(loc.json.results[0]);
          res.render('locations', {restaurant: results.name, lat: lat, lng:lng, locations: loc.json.results, google_maps_api_key: process.env.MAPS_KEY});
          })
        );
      });
    })
    );
};

// Display restaurant create form on GET.
exports.restaurant_create_get = function(req, res, next) { 
    res.render('restaurant_form', { title: 'Add a restaurant' });
};

// Handle restaurant create on POST.
exports.restaurant_create_post = [
    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('site').trim().escape(),

    (req, res, next) => {

        // Create a restaurant object with escaped and trimmed data.
        var restaurant = new Restaurant(
          { name: req.body.name,
            site: req.body.site,
            mobile: req.body.mobile ? true : false,
          });

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
        if (!req.user.admin) return next({Code: 403, error:'Access denied'});
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
exports.restaurant_update_get = function(req, res, next){
    // Get restaurant, authors and genres for form.
    async.parallel({
        restaurant: function(callback) {
            Restaurant.findById(req.params.id).exec(callback);
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
    // Sanitize fields.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('site').trim().escape(),

    (req, res, next) => {

        // Create a restaurant object with escaped/trimmed data and old id.
        var restaurant = new Restaurant(
        {  name: req.body.name,
           site: req.body.site,
           mobile: req.body.mobile ? true : false,
           android_url: req.body.android_url,
           ios_url: req.body.ios_url,
           _id:req.params.id
        });

            if (!req.user.admin) return next({Code: 403, error:'Access denied'});
            // Data from form is valid. Update the record.
            Restaurant.findByIdAndUpdate(req.params.id, restaurant, {}, function (err,therestaurant) {
                if (err) { return next(err); }
                   // Successful - redirect to restaurant detail page.
                   res.redirect(therestaurant.url);
                });
    }
];