var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UsersSchema = new Schema(
  {
    username: { type: String },
    password: { type: String },
  }
);

UsersSchema.plugin(passportLocalMongoose);

//Export model
module.exports = mongoose.model('User', UsersSchema);