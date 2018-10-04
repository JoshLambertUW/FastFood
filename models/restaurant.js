var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestaurantSchema = new Schema(
  {
    name: {type: String, required: true},
    site: {type: String, required: false},
    mobile: {type: Boolean, required: true},
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