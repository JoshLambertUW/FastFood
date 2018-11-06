var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var CouponSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    description: {type: String, required: true},
    date_added: {type: Date, required: true},
    mobile: {type: Boolean, default: false, required: true},
    code: {type: String, default: ''},
    date_expires: {type: Date},
    status: {type: String, required: true, enum: ['Expired', 'Unconfirmed', 'Valid', 'Invalid'], default: 'Valid'},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    score: {type: Number},
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' , type: Number }],
  }
);

// Virtual for Coupon's URL
CouponSchema
.virtual('url')
.get(function () {
  return '/coupon/' + this._id;
});

CouponSchema
.virtual('date_added_formatted')
.get(function () {
  return moment(this.date_added).format('MMMM Do, YYYY');
});

CouponSchema
.virtual('date_expires_formatted')
.get(function () {
  return moment(this.date_expires).format('MMMM Do, YYYY');
});

// Virtual for bookinstance's URL
CouponSchema
.virtual('url')
.get(function () {
  return 'coupon/' + this._id;
});

//Export model
module.exports = mongoose.model('Coupon', CouponSchema);