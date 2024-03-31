const { default: mongoose } = require('mongoose');
const db = require('../../db'),
    bcrypt = require('bcrypt'),

    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let PollOption = db.PollOption;
let resultdb = global_fun.resultdb;



let getPollOptionById = async (id) => {
    try {
        let temp = await PollOption.findOne({
            _id: id
        });
        // console.log("111111111________", temp);
        if (temp === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, temp)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getPollOptionByPollIdAndName = async (data) => {

    try {
        let tempdata = await PollOption.findOne({
            name: data.name,
            pollId: data.pollId.toString()
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

let savePollOption = async (data) => {
    try {
        let catDat = new PollOption(data);
        let responnse = await catDat.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getAllPollOption = async (data) => {
    try {
        let resData = await PollOption.find();
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getPollOptionList = async (data, sort) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'name': { '$regex': data.keyWord, '$options': 'i' } };
        }
        let total = await PollOption.countDocuments(query);
        let resData = await PollOption.find(query).sort(sort)
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


let getPollOptionBySlug = async (slug) => {

    try {
        let tempdata = await PollOption.find({
            slug: slug
        });
        console.log('tempdatatempdata2222222222222222222', tempdata);
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

let deletePollOption = async (id) => {
    try {
        let deleteShorts = await PollOption.deleteOne({ _id: id });
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
    savePollOption: savePollOption,
    getPollOptionById: getPollOptionById,
    getPollOptionList: getPollOptionList,
    getAllPollOption: getAllPollOption,
    getPollOptionBySlug: getPollOptionBySlug,
    getPollOptionByPollIdAndName: getPollOptionByPollIdAndName,
    deletePollOption: deletePollOption,

};