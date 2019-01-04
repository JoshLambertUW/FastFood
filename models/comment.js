var mongoose = require('mongoose');
var moment = require('moment');
var mongooseVoting = require('mongoose-voting');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon',required: true},
    message: {type: String, required: true, minLength: 3},
    date_added: {type: Date, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    username: {type: String, required: true},
  }
);

CommentSchema.plugin(mongooseVoting);

CommentSchema
.virtual('date_added_formatted')
.get(function () {
  return moment(this.date_added).format('MMMM Do, YYYY');
});

//Export model
module.exports = mongoose.model('Comment', CommentSchema);