var mongoose = require('mongoose');
var Schema = mongoose.Schema;

import passportLocalMongoose from  'passport-local-mongoose';


var UsersSchema = new Schema(
  {
    username: { type: String },
    salt: { type: String },
  }
);

UsersSchema.plugin(passportLocalMongoose);

//Export model
module.exports = mongoose.model('User', UsersSchema);