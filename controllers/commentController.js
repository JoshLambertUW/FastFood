var Comment = require('../models/comment');
var Coupon = require('../models/coupon');
var moment = require('moment');
var consts = require('../consts.js');
var mongoose = require('mongoose');

const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.vote = function(req, res, next) {
    Comment.findById(req.body.comment_id).exec(function (err, comment){
        if (err) { return next(err);}
        if (comment == null){ return next(err);}
        if (comment.upvoted(req.user.id)){
            comment.unvote(req.user.id, function(err){
                if (err) { return next(err);}
                res.json('Mark helpful');
            });
        }
        else {
            comment.upvote(req.user.id, function(err){
                if (err) { return next(err);}
                res.json('Unmark helpful');
            });
        }
    });
};

// Handle comment create on POST.
exports.new_comment = [
    // Sanitize fields.
    sanitizeBody('new_comment').trim().escape(),

    (req, res, next) => {
        
        var comment = new Comment(
          { coupon: req.params.id,
            message: req.body.new_comment,
            date_added: new Date(),
            user: req.user,
            username: req.user.username,
          });
          
        comment.upvote(req.user.id);
        
        comment.save(function(err){
            if (err) { return next(err);}
            res.redirect('/coupon/' + req.params.id);
        });
    }        
];

// Handle comment delete on POST.
exports.delete_comment = function(req, res, next) {
    Comment.findById(req.body.comment_id)
    .exec(function (err, results){
      if (err) {return next(err);}
      if (req.user.id != results.user._id && !req.user.admin){
          return next({Code: 403, error: 'Access denied'});
      }
    });
};