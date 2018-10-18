var User = require('../models/user');
var Coupon = require('../models/coupon');
var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('jsonwebtoken');


var async = require('async');

exports.user_get = function(res, req) {
    res.render('profile', {user: req.user});
}

exports.user_create_get = function(req, res) {
    res.render('register', {});
};

exports.user_create_post = function(req, res) {
     User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }
        passport.authenticate('local', { session: false})(req, res, function () {
            res.redirect('/');
        });
    });
};

exports.user_login_get = function(req, res) {
    res.render('login', {user: req.user});
};

exports.user_login_post = function(req, res) {
    passport.authenticate('local', {session: false}, (err, user, next) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
        if (err) {
            res.send(err);
        }
        // generate a signed son web token with the contents of user object and return it in the response
        const token = jwt.sign({ id: user.id, email: user.username}, 'secret');
        return res.json({user: user.username, token});
        });
    })(req, res);
};

