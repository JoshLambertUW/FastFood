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
var users = []
var coupons = []

function restaurantCreate(name, site, mobile, cb) {
   
  restaurant = { 
        name: name,
        mobile: mobile ? true : false,
    }
    
  if (site != false) restaurant.site = site
  
  var restaurantEntry = new Restaurant(restaurant);
    
  restaurantEntry.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    
    console.log('New Restaurant: ' + restaurantEntry);
    restaurants.push(restaurantEntry)
    cb(null, restaurantEntry)
  });
}

function userCreate(username, email, userPassword, restaurants, admin, cb) {
  
  user = {restaurants: restaurants, admin: admin}
  if (email != false) user.email = email;
  
  var userEntry = new User(user);
  
  User.register(userEntry, userPassword, function(err){
      if (err){
          console.log(err)
      }
      console.log('New User: ' + userEntry);
      users.push(userEntry)
      cb(null, user)
  } );
}


function couponCreate(restaurant, description, code, date_added, date_expires, deal_type, deal_url, user, cb) {
  coupon =
      { restaurant: restaurant,
        description: description,
        date_added: date_added,
        date_expires: date_expires,
        deal_type: deal_type,
        user: user,
      }

  if (deal_url != false) coupon.deal_url = deal_url
  if (code != false) coupon.code = code
    
  var couponEntry = new Coupon(coupon);
  
  couponEntry.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Coupon: ' + couponEntry);
      cb(err, null)
      return
    }
    console.log('New Coupon: ' + couponEntry);
    coupons.push(couponEntry)
    cb(null, couponEntry)
  });
}

function createRestaurants(cb) {
    async.parallel([
        function(callback) {
          restaurantCreate('Subway', 'Subway.com', false, callback);
        },
        function(callback) {
          restaurantCreate('Mcdonalds', 'Mcdonalds.com', true, callback);
        },
        function(callback) {
          restaurantCreate('Starbucks', 'Starbucks.com', true, callback);
        },
        function(callback) {
          restaurantCreate('KFC', 'KFC.com', false, callback);
        },
        function(callback) {
          restaurantCreate('Burger King', false, false, callback);
        }
        ],
        cb);
}

function createUsers(cb) {
    async.parallel([
        function(callback) {
          userCreate('Equen1947', false, 'password1', [restaurants[3],restaurants[4],], false, callback);
        },
        function(callback) {
          userCreate('Filly1970', 'Filly1970@test.com', 'password2', [restaurants[0],restaurants[3],], false, callback);
        },
        function(callback) {
          userCreate('Rater1954', 'Rater1954@test.com', 'password3', [restaurants[0],restaurants[3],, restaurants[4]], false, callback);
        },
        function(callback) {
          userCreate('Dentoory68', 'Dentoory68@test.com', 'password4',[], false, callback);
        },
        ],
        cb);
}

function createCoupons(cb) {
    async.parallel([
        function(callback) {
          couponCreate(restaurants[1], 'Buy one get one free item', false,new Date(2018, 1, 1),new Date(2020,1,1), 'Online', false,users[1], callback);
        },
        function(callback) {
          couponCreate(restaurants[2], 'Free item', 'test01', new Date(2016,1,1),new Date(2017,1,1), 'Mobile', false,users[1], callback);
        },
        function(callback) {
          couponCreate(restaurants[4], 'Buy one get one free item',false, Date(2018,2,1),Date(2019,2,1), 'Printable','http://www.test.com', users[0], callback);
        },
        ],
        cb);
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

