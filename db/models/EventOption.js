const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let EventOptionSchema = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  option: {
    type: String,
    enum: ['YES', 'NO']
  },
  price: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});
EventOptionSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("EventOption", EventOptionSchema, "EventOption");