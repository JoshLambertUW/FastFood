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

exports.restrict = function(req, res, next){
    if (!req.user) {
        req.session.redirect_to = req.path;
        res.redirect('/login');
    } else {
        next();
    }
}

exports.user_get = function(req, res) {
    res.render('profile');
}

exports.user_create_get = function(req, res) {
    if (req.user) res.redirect('/');
    res.render('register');
};

exports.user_create_post = function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err) {
        if (err) {
            console.log(err.message);
            return res.render('register', {error: err.message});
        }
        var redirectTo = req.session.redirect_to || '/';
        delete req.session.redirect_to;
        passport.authenticate('local')(req, res, function () {
            res.redirect(redirectTo);
        });
    });
};

exports.user_login_get = function(req, res) {
    if (req.user) res.redirect('/');
    res.render('login');
};

exports.user_login_post = function(req, res) {
    var redirectTo = req.session.redirect_to || '/';
    delete req.session.redirect_to;
    passport.authenticate('local')(req, res, function () {
        return res.redirect(redirectTo);
    });
};

exports.user_logout = function(req, res) {
    if (req.session.redirect_to) delete req.session.redirect_to;
    req.logout();
    res.redirect('/');
};