#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('Specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Restaurant = require('./models/restaurant')
var Coupon = require('./models/coupon')
var Mobile = require('./models/mobileapp')
var User = require('./models/user')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var restaurants = []
var coupons = []
var users = []

function userCreate(username, email, userPassword, restaurants, admin, cb) {
  
  var user = new User({username: username, email: email, restaurants: restaurants});
  
  User.register(user, userPassword, function(err){
      if (err){
          cb(err, null)
          return
      }
      console.log('New User: ' + user);
      users.push(user)
      cb(null, author)
  } );
}

function restaurantCreate(name, site, mobile, cb) {
   
  var restaurant = new Restaurant(
    { name: req.body.name,
        site: req.body.site,
        mobile: req.body.mobile ? true : false,
    });
    
  restaurant.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Restaurant: ' + restaurant);
    restaurants.push(restaurant)
    cb(null, restaurant)
  });
}


function couponCreate(restaurant, description, date_added, mobile, code, date_expires, user, cb) {
  var coupon = new Coupon(
      { restaurant: restaurant,
        description: escription,
        code: code,
        date_added: date_added,
        date_expires: date_expires,
        mobile: mobile;
        user: user,
  });  
  
  coupon.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Coupon: ' + coupon);
      cb(err, null)
      return
    }
    console.log('New Coupon: ' + coupon);
    coupons.push(coupon)
    cb(null, restaurant)
  });
}

function createRestaurants(cb) {
    //ToDo
}

function createUsers(cb) {
    ToDo
}

function createCoupons(cb) {
    //ToDo
}



async.series([
    createRestaurants,
    createUsers,
    createCoupons
],

// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Coupons: '+coupons);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



