var express = require('express');
var router = express.Router();

var restaurant_controller = require('../controllers/restaurantController');
var coupon_controller = require('../controllers/couponController');
var user_controller = require('../controllers/userController');
var passport = require('passport');

// GET home page.
router.get('/', user_controller.index);

// GET request to create a Restaurant.

router.get('/restaurant/create', user_controller.restrict, restaurant_controller.restaurant_create_get);

// POST request to create a Restaurant.
router.post('/restaurant/create', user_controller.restrict, restaurant_controller.restaurant_create_post);

// GET request to delete Restaurant.
router.get('/restaurant/:id/delete', user_controller.restrict, restaurant_controller.restaurant_delete_get);

// POST request to delete Restaurant.
router.post('/restaurant/:id/delete', passport.authenticate('local'), restaurant_controller.restaurant_delete_post);

// GET request to update Restaurant.
router.get('/restaurant/:id/update', user_controller.restrict, restaurant_controller.restaurant_update_get);

// POST request to update Restaurant.
router.post('/restaurant/:id/update', passport.authenticate('local'), restaurant_controller.restaurant_update_post);

// GET request for one Restaurant.
router.get('/restaurant/:id', restaurant_controller.restaurant_detail);

// GET request for list of all Restaurant items.
router.get('/restaurants', restaurant_controller.restaurant_list);

/// COUPON ROUTES ///

// GET request for creating a Coupon. NOTE This must come before route that displays Coupon (uses id).
router.get('/coupon/create', user_controller.restrict, coupon_controller.coupon_create_get);

// POST request for creating Coupon. 
router.post('/coupon/create', user_controller.restrict, coupon_controller.coupon_create_post);

// GET request to delete Coupon.
router.get('/coupon/:id/delete', user_controller.restrict, coupon_controller.coupon_delete_get);

// POST request to delete Coupon.
router.post('/coupon/:id/delete', user_controller.restrict, coupon_controller.coupon_delete_post);

// GET request to update Coupon.
router.get('/coupon/:id/update', user_controller.restrict, coupon_controller.coupon_update_get);

// POST request to update Coupon.
router.post('/coupon/:id/update', user_controller.restrict, coupon_controller.coupon_update_post);

// GET request for one Coupon.
router.get('/coupon/:id', coupon_controller.coupon_detail);

// GET request for list of all Coupon.
router.get('/coupons', coupon_controller.coupon_list);

/// AUTH ROUTES ///

router.get('/register', user_controller.user_create_get);

router.post('/register', user_controller.user_create_post);

router.get('/login', user_controller.user_login_get);

router.post('/login', user_controller.user_login_post);

router.get('/profile', user_controller.restrict, user_controller.user_get);

router.post('/changepwd', user_controller.restrict, user_controller.user_changepwd_post);

router.post('/fav', user_controller.restrict, user_controller.user_fav_post);

router.get('/logout', user_controller.user_logout);

module.exports = router;