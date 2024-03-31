const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let PollAnswer = db.PollAnswer;
let resultdb = global_fun.resultdb;
const mongoose = require("mongoose");


let getPollAnswerById = async (id) => {
    try {
        let tempPollAnswer = await PollAnswer.findOne({
            _id: id.toString()
        });
        if (tempPollAnswer === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let getPollAnswerBypollId = async (pollId) => {

    console.log("mongoose.Types.ObjectId(pollId):::", mongoose.Types.ObjectId(pollId));

    try {
        let tempPollAnswer = await PollAnswer.findOne({
            pollId: mongoose.Types.ObjectId(pollId)
        }).populate('pollId');

        console.log("tempPollAnswer_____tempPollAnswer::", tempPollAnswer);

        if (tempPollAnswer === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

// let getPollAnswerByUserId = async (polls, userId) => {
//     try {
//         console.log('0000000000000', userId, polls);
//         let tempPollAnswer = await PollAnswer.find({ "pollId": { $in: [polls] }, "userId": userId })

//         console.log("tempPollAnswer_____tempPollAnswer::", tempPollAnswer);

//         if (tempPollAnswer === null) {
//             return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
//         } else {
//             return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
//         }
//     } catch (error) {
//         return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
//     }
// };

let getPollAnswerByUserId = async (userId) => {
    try {
        let tempPollAnswer = await PollAnswer.find({
            userId: userId.toString()
        })

        console.log("tempPollAnswer_____tempPollAnswer::", tempPollAnswer);

        if (tempPollAnswer === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let findOne = async (query) => {
    try {
        let tempPollAnswer = await PollAnswer.findOne(query);
        if (tempPollAnswer === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let findByUserIdAndPollId = async (query) => {
    try {
        let tempPollAnswer = await PollAnswer.findOne(query);
        if (tempPollAnswer === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPollAnswer)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getPollAnswerByName = async (name) => {
    try {
        let tempdata = await PollAnswer.findOne({
            name: name
        });
        if (tempdata === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempdata)
        }
    } catch (error) {
        console.log("error  ", error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let savePollAnswer = async (data) => {
    try {
        let testPollAnswer = new PollAnswer(data);
        let responnse = await testPollAnswer.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let findOneAndUpdate = async (query, data) => {
    try {
        let responnse = await PollAnswer.findOneAndUpdate(query, data, { upsert: true, useFindAndModify: false })
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("error  ", error)
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};

let getPollDetailsAnswerWise = async (pollId) => {
    try {
        let responnse = await PollAnswer.aggregate([
            {
                $match: { "pollId": mongoose.Types.ObjectId(pollId) },
            },
            {
                $group: {
                    _id: '$pollOptionId',
                    answer: { "$first": "$answer" },
                    count: { $sum: 1 }
                }
            }
        ])
        console.log("responnse  ", responnse);
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};

let getPollAnswerList = async (data) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'name': { '$regex': data.keyWord, '$options': 'i' } };
        }
        let total = await PollAnswer.countDocuments(query);
        let resData = await PollAnswer.find(query)
            .skip(data.size * (data.pageNo - 1)).limit(data.size).sort({ createdAt: -1 });
        let tempData = {
            total: total,
            list: resData
        }
        return resultdb(CONSTANTS.SUCCESS, tempData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getAllPollAnswer = async (data) => {
    try {
        let resData = await PollAnswer.find().populate('questionId');
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getPollAnswerTemp = async () => {
    try {
        let resData = await PollAnswer.find();
        if (resData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, resData[0])
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let savePollAnswerMultiple = async (data) => {
    try {
        let responnse = await PollAnswer.insertMany(data);
        // console.log("responnse savePollAnswerMultiple ", responnse);
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
module.exports = {
    findOne,
    getPollDetailsAnswerWise,
    findOneAndUpdate,
    getPollAnswerById,
    savePollAnswer,
    getPollAnswerByName,
    getAllPollAnswer,
    getPollAnswerTemp,
    getPollAnswerList,
    savePollAnswerMultiple,
    getPollAnswerBypollId,
    getPollAnswerByUserId,
    findByUserIdAndPollId
};