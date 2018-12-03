var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestaurantSchema = new Schema(
  {
    name: {type: String, required: true, minLength: 2},
    site: {type: String, required: false,
          validate: {
            validator: function(v) {
                return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
                .test(v);
            },
            message: props => `${props.value} is not a valid url`
        },
    },
    mobile: {type: Boolean, required: true},
    android_url: {type: String, required: false,
          validate: {
            validator: function(v) {
                return 'https:\/\/play\.google\.com\/store\/apps\/details\?id=[-a-zA-Z0-9@:%_\+.~#?&=]{2,256}'
                .test(v);
            },
            message: props => `${props.value} is not a valid Play Store url`
        },
    },
    ios_url: {type: String, required: false,
          validate: {
            validator: function(v) {
                return 'https:\/\/itunes\.apple\.com\/us\/app\/[-a-zA-Z0-9@:%_\+.~#?&=]{2,256}'
                .test(v);
            },
            message: props => `${props.value} is not a valid App store url`
        },
    },
  }
);

// Virtual for restaurants's local URL
RestaurantSchema
.virtual('url')
.get(function () {
  return '/restaurant/' + this._id;
});

//Export model
module.exports = mongoose.model('Restaurant', RestaurantSchema);