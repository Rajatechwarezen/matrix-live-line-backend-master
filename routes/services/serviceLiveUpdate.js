const { date } = require('joi');
const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let LiveUpdate = db.LiveUpdate;
let resultdb = global_fun.resultdb;

let getLiveUpdateById = async (id) => {
    try {
        let temp = await LiveUpdate.findOne({
            _id: id
        });
        console.log('temp_____', temp);
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

let getLiveUpdateByMatchId = async (id) => {
    try {
        let temp = await LiveUpdate.findOne({
            matchId: id
        });
        console.log('temp_____', temp);
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




let saveLiveUpdate = async (data) => {
    try {
        let catDat = new LiveUpdate(data);
        let responnse = await catDat.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getAllLiveUpdate = async (data) => {
    try {
        let resData = await LiveUpdate.find();
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getLiveUpdateList = async (data) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'que': { '$regex': data.keyWord, '$options': 'i' } };
        }
        if (data && data.category) {
            query['category'] = data.category;
        }
        let total = await LiveUpdate.countDocuments(query);
        let resData = await LiveUpdate.find(query).skip(data.size * (data.pageNo - 1)).limit(data.size).sort({ createdAt: -1 });
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


let getLiveUpdateByQue = async (que) => {
    console.log('que_______', que);
    try {
        let tempdata = await LiveUpdate.findOne({
            que: que
        });
        console.log('tempdata_______', tempdata);
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

let deleteLiveUpdate = async (id) => {
    try {
        let deleteLiveUpdate = await LiveUpdate.deleteOne({ _id: id });
        console.log('deleteLiveUpdate_______', deleteLiveUpdate);
        if (deleteLiveUpdate && deleteLiveUpdate.deletedCount != 0) {
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
    saveLiveUpdate: saveLiveUpdate,
    getLiveUpdateById: getLiveUpdateById,
    getLiveUpdateList: getLiveUpdateList,
    getAllLiveUpdate: getAllLiveUpdate,
    getLiveUpdateByQue: getLiveUpdateByQue,
    deleteLiveUpdate: deleteLiveUpdate,
    getLiveUpdateByMatchId: getLiveUpdateByMatchId,

};