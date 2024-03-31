const moment = require('moment');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const settings = require('../../config/settings.json');


let KycSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        default: ''
    },
    adharNo: {
        type: String,
        default: ''
    },
    frontAdharImg: {
        type: String,
        default: ''
    },
    backAdharImg: {
        type: String,
        default: ''
    },
    panNo: {
        type: String,
        default: ''
    },
    panImg: {
        type: String,
        default: ''
    },
    dob: {
        type: String,
        default: ''
    },
    comment: {
        type: String,
        default: ''
    },
    isApprove: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3],        // 0 = Pending, 1=Accept , 2 = Reject
        default: 0
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    },
});


KycSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        ret.imageLinkAdFront = ret.frontAdharImg ? settings.imageUrl + ret.frontAdharImg : null;
        ret.imageLinkAdBack = ret.backAdharImg ? settings.imageUrl + ret.backAdharImg : null;
        ret.imageLinkPan = ret.panImg ? settings.imageUrl + ret.panImg : null;
        delete ret.__v;
        return ret;
    }
};
module.exports = mongoose.model("Kyc", KycSchema, "Kyc");
