const mongoose = require("mongoose");
const moment = require('moment');
const Schema = mongoose.Schema;

let LoginHistorySchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    ipAddress: {
        type: String,
        // required: true
    },
    desc: {
        type: String,
        default: null
        // required: true
    },

    createdAt: {
        type: Number,
        default: () => Date.now()
    }
});
LoginHistorySchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
module.exports = mongoose.model("LoginHistory", LoginHistorySchema, "LoginHistory");
