var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MobileSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    platform: {type: String, required: true, enum: ['Android', 'iOS', 'Windows'], required: true},

  }
);

// Virtual for genres's URL
MobileSchema
.virtual('url')
.get(function () {
  return '/mobile/' + this._id;
});

//Export model
module.exports = mongoose.model('Mobile', MobileSchema);