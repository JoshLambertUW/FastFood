var User = require('../models/user');
var Coupon = require('../models/coupon');
import bodyParser from 'body-parser';
import passport from 'passport';
const AuthController = {};
import jwt from 'jsonwebtoken';

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.user_get = function(res, req) {
    res.render('profile', {user: req.user});
}

exports.user_create_get = function(req, res) {
    res.render('register', {user: req.user});
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
        
        var finalUser = new User({username: req.body.username});
        
        if (!errors.isEmpty()) {
                res.render('register', { finalUser: finalUser, errors: errors.array() });
                return;
        }
        else {
            try{
                User.register(finalUser, req.body.password, function(err, account) {
                    if (err) {
                        return res.status(500).send('An error occurred: ' + err);
                    }

                    passport.authenticate(
                        'local', {
                            session: false
                        })(req, res, () => {
                        res.status(200).send('Successfully created new account');
                        res.redirect('/');
                    });
                });
            }
            catch(err){
                return res.status(500).send('An error occurred: ' + err);
            }
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

        if (!errors.isEmpty()) {
                res.render('login', { errors: errors.array() });
                return;
        }
        
        else {
                passport.authenticate('local', {session: false}, (err, user, info) => {
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
                    const token = jwt.sign({ id: user.id, email: user.username}, '');
                    return res.json({user: user.username, token});
                });
            })(req, res);    
        }
    }
];

