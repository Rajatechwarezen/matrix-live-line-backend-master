const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const settings = require('../../config/settings.json');

let ShortsSchema = new Schema({
  category: {
    type: String,
    default: ''
  },
  uploadType: {
    type: String,
    enum: ['IMAGE', 'VIDEO']
  },
  file: {
    type: String,
    default: ''
  },
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
  disLikes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
  isDisable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  }
});
ShortsSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    ret.fileUrl = ret.file ? settings.imageUrl + ret.file : null;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("Shorts", ShortsSchema, "Shorts");