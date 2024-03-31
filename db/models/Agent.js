const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;
let AgentSchema = new Schema({
  userName: {
    type: String,
    default: ""
  },
  password: {
    type: String,
    default: ""
  },
  mobile: {
    type: String,
    default: ""
  },
  isDisable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  }

});

AgentSchema.pre('save', function (next) {
  let admin = this;
  if (!admin.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(admin.password, salt, function (err, hash) {
      if (err) return next(err);
      admin.password = hash;
      next();
    });
  });
});
AgentSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
};
module.exports = mongoose.model("Agent", AgentSchema, "Agent");

