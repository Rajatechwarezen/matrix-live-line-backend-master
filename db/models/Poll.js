const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const settings = require("../../config/settings.json");

let PollSchema = new Schema({
  que: {
    type: String,
    default: ""
  },
  matchId: {
    type: String,
  },
  series: {
    type: String,
  },
  matchs: {
    type: String,
  },
  match_date: {
    type: String,
  },
  match_time: {
    type: String,
  },
  teamA: {
    type: String,
  },
  teamB: {
    type: String,
  },
  optionsList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PollOption',
  }],
  isDisable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },

});

PollSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("Poll", PollSchema, "Poll");