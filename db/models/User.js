const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const settings = require('../../config/settings.json');
const SALT_WORK_FACTOR = 10;

let UserSchema = new Schema({
  mobile: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: ""
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

UserSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
UserSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    ret.imageLinkUrl = ret.image ? settings.imageUrl + ret.image : null;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("User", UserSchema, "User");