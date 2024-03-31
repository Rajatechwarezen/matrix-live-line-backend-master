const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const settings = require('../../config/settings.json');
const SALT_WORK_FACTOR = 10;

let DeviceIdSchema = new Schema({
  deviceId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

DeviceIdSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
module.exports = mongoose.model("DeviceId", DeviceIdSchema, "DeviceId");