const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const settings = require("../../config/settings.json");

let BlogSchema = new Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  desc: {
    type: String,
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },

});

BlogSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    ret.imageLinkUrl = ret.image ? settings.imageUrl + ret.image : null;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("Blog", BlogSchema, "Blog");