var User = require('../models/user');
var Coupon = require('../models/coupon');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

router.get('/users/create', user_controller.user_create_get);

router.post('/users/create', user_controller.user_create_post);

router.get('/users/login', user_controller.user_login_get);

router.post('/users/login', user_controller.user_login_post);

router.get('/users/account', user_controller.user_get);

exports.user_get = function(res, req) {
    res.render('profile', {user:});
}

exports.user_create_get = function(req, res) {
    res.render('register', {});
};

exports.user_create_post = [

    // Validate fields.
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
  
    
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        var finalUser = new User(username: req.body.username);
        finalUser.setPassword(user.password);

        if (!errors.isEmpty()) {
                res.render('register', { finalUser: finalUser, errors: errors.array() });
            });
            return;
        }
        else {
            finalUser.save(function (err) {
                if (err) { return next(err); }
                   res.redirect('/');
                });
        }
    }
];

exports.user_login_get = function(req, res) {
    res.render('login', {user: req.user});
};

exports.user_login_post = [

    // Validate fields.
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        var finalUser = new User(username: req.body.username);
        finalUser.setPassword(user.password);

        if (!errors.isEmpty()) {
                res.render('register', { finalUser: finalUser, errors: errors.array() });
            });
            return;
        }
        else {
            finalUser.save(function (err) {
                if (err) { return next(err); }
                   res.redirect('/');
                });
        }
    }
];

