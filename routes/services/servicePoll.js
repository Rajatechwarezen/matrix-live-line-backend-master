const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let Poll = db.Poll;
let PollOption = db.PollOption;
let resultdb = global_fun.resultdb;
const mongoose = require("mongoose");


let getPollById = async (id) => {
    try {
        let tempPoll = await Poll.findOne({
            _id: id.toString()
        }).populate('optionsList');
        if (tempPoll === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPoll)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let getPollBypollId = async (pollId) => {

    console.log("mongoose.Types.ObjectId(pollId):::", mongoose.Types.ObjectId(pollId));

    try {
        let tempPoll = await Poll.findOne({
            pollId: mongoose.Types.ObjectId(pollId)
        }).populate('pollId');

        console.log("tempPoll_____tempPoll::", tempPoll);

        if (tempPoll === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPoll)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let findOne = async (query) => {
    try {
        let tempPoll = await Poll.findOne(query);
        if (tempPoll === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempPoll)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getPollByQue = async (que) => {
    try {
        let tempdata = await Poll.findOne({
            que: que
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
let savePoll = async (data) => {
    try {
        let testPoll = new Poll(data);
        let responnse = await testPoll.save();
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
        let responnse = await Poll.findOneAndUpdate(query, data, { upsert: true, useFindAndModify: false })
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
        let responnse = await Poll.aggregate([
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

let getPollList = async (data) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'que': { '$regex': data.keyWord, '$options': 'i' } };
        }
        let total = await Poll.countDocuments(query);
        let resData = await Poll.find(query).populate('optionsList')
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
let getAllPoll = async (data) => {
    try {
        let resData = await Poll.find().populate('optionsList');
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getEnabledPoll = async (data) => {
    try {
        let resData = await Poll.find({
            isDisable: false
        }).populate('optionsList');
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getPollTemp = async () => {
    try {
        let resData = await Poll.find();
        if (resData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, resData[0])
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let savePollMultiple = async (data) => {
    try {
        let responnse = await Poll.insertMany(data);
        // console.log("responnse savePollMultiple ", responnse);
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let findOneAndUpdatePollOption = async (query, data) => {
    try {
        let responnse = await PollOption.findOneAndUpdate(query, data, { upsert: true, useFindAndModify: false })
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("error  ", error)
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};

let deletePoll = async (id) => {
    try {
        let deleteShorts = await Poll.deleteOne({ _id: id });
        console.log('deleteShorts_______', deleteShorts);
        if (deleteShorts && deleteShorts.deletedCount != 0) {
            return resultdb(CONSTANTS.SUCCESS, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.DATA_NULL)
        }
    } catch (error) {
        console.log("error  ", error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

module.exports = {
    findOne,
    getPollDetailsAnswerWise,
    findOneAndUpdatePollOption,
    findOneAndUpdate,
    getPollById,
    savePoll,
    getPollByQue,
    getAllPoll,
    getPollTemp,
    getPollList,
    savePollMultiple,
    getPollBypollId,
    deletePoll,
    getEnabledPoll
};