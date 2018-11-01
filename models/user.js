var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    admin: {type: Boolean, default: false},
});

User.plugin(passportLocalMongoose);

//Export model
module.exports = mongoose.model('User', User);