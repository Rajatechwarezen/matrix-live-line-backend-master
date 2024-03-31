const { date } = require('joi');
const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let Shorts = db.Shorts;
let resultdb = global_fun.resultdb;

let getShortsById = async (id) => {
    try {
        let temp = await Shorts.findOne({
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

let getShortsByIdAndUserIdInDisLikeSection = async (data) => {
    try {
        let temp = await Shorts.findOne({
            $and: [
                { _id: data.shortId },
                { disLikes: { $elemMatch: { userId: data.userId } } }
            ]
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

let getShortsByIdAndUserIdInLikeSection = async (data) => {
    try {
        let temp = await Shorts.findOne({
            $and: [
                { _id: data.shortId },
                { likes: { $elemMatch: { userId: data.userId } } }
            ]
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

let pushLikeDataInShorts = async (data) => {
    try {
        let pushData = await Shorts.updateOne(
            { _id: data.shortId },
            { $push: { likes: { userId: data.userId } } },
            { multi: true }
        )
        console.log('pushData_____', pushData);
        if (pushData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, pushData)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let pushDisLikeDataInShorts = async (data) => {
    try {
        let pushData = await Shorts.updateOne(
            { _id: data.shortId },
            { $push: { disLikes: { userId: data.userId } } },
            { multi: true }
        )
        console.log('pushData_____', pushData);
        if (pushData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, pushData)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let pullLikeDataFromShorts = async (data) => {
    try {
        let pullData = await Shorts.updateOne(
            { _id: data.shortId },
            { $pull: { likes: { userId: data.userId } } },
            { multi: true }
        )
        console.log('pullData_____', pullData);
        if (pullData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, pullData)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let pullDisLikeDataFromShorts = async (data) => {
    try {
        let pullData = await Shorts.updateOne(
            { _id: data.shortId },
            { $pull: { disLikes: { userId: data.userId } } },
            { multi: true }
        )
        console.log('pullData_____', pullData);
        if (pullData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, pullData)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};



let saveShorts = async (data) => {
    try {
        let catDat = new Shorts(data);
        let responnse = await catDat.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getAllShorts = async (data) => {
    try {
        let resData = await Shorts.find();
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getShortsList = async (data) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'que': { '$regex': data.keyWord, '$options': 'i' } };
        }
        if (data && data.category) {
            query['category'] = data.category;
        }
        let total = await Shorts.countDocuments(query);
        let resData = await Shorts.find(query).skip(data.size * (data.pageNo - 1)).limit(data.size).sort({ createdAt: -1 });
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


let getShortsByQue = async (que) => {
    console.log('que_______', que);
    try {
        let tempdata = await Shorts.findOne({
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

let deleteShorts = async (id) => {
    try {
        let deleteShorts = await Shorts.deleteOne({ _id: id });
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
    saveShorts: saveShorts,
    getShortsById: getShortsById,
    getShortsList: getShortsList,
    getAllShorts: getAllShorts,
    getShortsByQue: getShortsByQue,
    deleteShorts: deleteShorts,
    pushLikeDataInShorts: pushLikeDataInShorts,
    pushDisLikeDataInShorts: pushDisLikeDataInShorts,
    pullDisLikeDataFromShorts: pullDisLikeDataFromShorts,
    pullLikeDataFromShorts: pullLikeDataFromShorts,
    getShortsByIdAndUserIdInDisLikeSection: getShortsByIdAndUserIdInDisLikeSection,
    getShortsByIdAndUserIdInLikeSection: getShortsByIdAndUserIdInLikeSection,

};