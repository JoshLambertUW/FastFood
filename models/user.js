var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    email: {type: String,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
        },
    },
    restaurants: [{ type : Schema.Types.ObjectId, ref: 'Restaurant' }],
    admin: {type: Boolean, default: false},
});

User.plugin(passportLocalMongoose);

//Export model
module.exports = mongoose.model('User', User);