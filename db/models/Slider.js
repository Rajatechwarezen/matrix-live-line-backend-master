const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const settings = require("../../config/settings.json");

let SliderSchema = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
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

SliderSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    ret.imageLinkUrl = ret.image ? settings.imageUrl + ret.image : null;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("Slider", SliderSchema, "Slider");