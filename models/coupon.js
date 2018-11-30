var mongoose = require('mongoose');
var moment = require('moment');
var mongooseVoting = require('mongoose-voting');

var Schema = mongoose.Schema;

var CouponSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant',required: true, minLength: 2, },
    description: {type: String, required: true, minLength: 3},
    date_added: {type: Date, required: true},
    deal_type: {type: String, required: true, enum: ['Online', 'Mobile', 'Printable'], required: true},
    deal_url: {type: String, required: false,
          validate: {
            validator: function(v) {
                return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
                .test(v);
            },
            message: props => `${props.value} is not a valid url`
        },
    },
    code: {type: String, required: false, minLength: 2},
    date_expires: {type: Date, required: false},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
  }
);

CouponSchema.plugin(mongooseVoting);

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

CouponSchema.
virtual('expired')
.get(function() {
    return (moment(this.date_expires) < moment());
});

CouponSchema
.virtual('totalScore')
.get(function () {
  return this.upvotes() - this.downvotes();
});

CouponSchema
.virtual('status')
.get(function() {
  if (this.expired) return 'Expired';
  if (Math.abs(this.totalScore) === 1) return this.totalScore + ' point';
  return this.totalScore + ' points';
});

//Export model
module.exports = mongoose.model('Coupon', CouponSchema);