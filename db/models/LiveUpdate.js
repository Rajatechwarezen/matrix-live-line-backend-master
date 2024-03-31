const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let LiveUpdateSchema = new Schema({
  matchId: {
    type: String,
    unique: true,
    required: true
  },
  matchUpdate: {
    type: String,
    default: ''
  },
  matchData: Schema.Types.Mixed,
  isDisable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  },
  updatedAt: {
    type: Number,
    default: () => Date.now()
  }
});
LiveUpdateSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("LiveUpdate", LiveUpdateSchema, "LiveUpdate");