var User = require('../models/user');
var Coupon = require('../models/coupon');
var passport = require('passport');
var async = require('async');

exports.index = function(req, res, next) {
    Coupon.find()
    .sort({'date_added': -1})
    .limit(10)
    .populate('restaurant')
    .exec(function (err, list_coupons) {
      if (err) { return next(err); }
      res.render('index', {coupon_list: list_coupons });
    });
}

exports.user_get = function(req, res) {
    if (!req.user) res.redirect('/');
    res.render('profile', {user: req.user});
}

exports.user_create_get = function(req, res) {
    if (!req.user) res.redirect('/');
    res.render('register');
};

exports.user_create_post = function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err) {
        if (err) {
            console.log(err.message);
            return res.render('register', {error: err.message});
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
};

exports.user_login_get = function(req, res) {
    res.render('login');
};

exports.user_login_post = function(req, res) {
    passport.authenticate('local')(req, res, function () {
      return res.redirect('/');
    });
};

exports.user_logout = function(req, res) {
    req.logout();
    res.redirect('/');
};