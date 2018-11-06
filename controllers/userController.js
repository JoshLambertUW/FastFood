var User = require('../models/user');
var Coupon = require('../models/coupon');
var Restaurant = require('../models/restaurant');
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
    async.parallel({
        coupons: function(callback){
            Coupon.find({user: req.user.id})
            .sort({'date_added': -1})
            .limit(5)
            .populate('restaurant')
            .exec(callback);
        },
        favs: function(callback){
            User.findById(req.user.id)
            .populate('restaurants')
            .exec(callback);
        },
    }, function(err, results){
        if (err){ return next(err);}
        console.log(results.favs);
        res.render('profile', {coupon_list: results.coupons, restaurants: results.favs.restaurants });
    });
}

exports.user_fav_post = function(req, res, next){
    if (req.user.restaurants.indexOf(req.body.id) < 0){
        User.findByIdAndUpdate(req.user.id, {$push: {restaurants: req.body.id}}, {new: true}, function(err){
            if (err) { return next(err); }
            res.json(200);
        });
    }
    
    else {
        User.findByIdAndUpdate(req.user.id, {$pull: {restaurants: req.body.id}}, {new: true}, function(err){
            if (err){ return next(err); }
            res.json(200);
        });
    }
};

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

exports.user_login_post = function(req, res, next) {
    passport.authenticate('local', function(err, user, info){
        if (err){
            return next(err);
        }
        if (!user){
            return res.render('login', {error: 'Invalid username or password'});
        }
    req.logIn(user, function(err) {
        if (err){
            return next(err);
        }
        var redirectTo = req.session.redirect_to || '/';
        delete req.session.redirect_to;
        return res.redirect(redirectTo);
        return res.send({redirect: redirectTo});
    });
    })(req, res, next);
};

exports.user_changepwd_post = function(req, res, next) {
    User.findById(req.user.id)
    .exec(function(err, user){
      if (err){ return next(err); }
      if (user){
        user.setPassword(req.body.newPassword, function(){
            user.save();
            res.redirect('/profile');
        });
      } else {
        res.status(500).json({message: 'This user does not exist'});
      }
      });
};

exports.user_logout = function(req, res) {
    if (req.session.redirect_to) delete req.session.redirect_to;
    req.logout();
    res.redirect('/');
};