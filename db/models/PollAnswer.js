const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PollAnswerSchema = new Schema({
    answer: {
        type: String
    },
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pollOptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PollOption'
    },
    weightage: {
        type: Number
    },
    count: {
        type: Number
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    }
});

PollAnswerSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
module.exports = mongoose.model("PollAnswer", PollAnswerSchema, "PollAnswer");
