const moment = require('moment');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserTxSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionID: {
        type: String
    },
    consumerNumber: {
        type: String
    },
    amount: {
        type: Number,
        default: 0
    },
    txType: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAW', 'RECEIVED_FROM_ADMIN', 'REFERRAL', 'WIN',],
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    },
    date: {
        type: Number,
        default: () => moment().startOf('day').unix() * 1000
    },
    month: {
        type: Number,
        default: () => moment().startOf('month').unix() * 1000
    }
});

UserTxSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
module.exports = mongoose.model("UserTx", UserTxSchema, "UserTx");
