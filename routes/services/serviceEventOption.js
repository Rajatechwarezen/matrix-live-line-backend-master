const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let EventOption = db.EventOption;
let resultdb = global_fun.resultdb;

let getEventOptionById = async (id) => {
    try {
        let temp = await EventOption.findOne({
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
let getEventOptionByPrice = async (data) => {
    try {
        let temp = await EventOption.findOne({
            eventId: data.eventId,
            option: data.option,
            price: data.price,
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

let saveEventOption = async (data) => {
    try {
        let catDat = new EventOption(data);
        let responnse = await catDat.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getAllEventOptionByEventId = async (id) => {
    try {
        let resData = await EventOption.find({ eventId: id });
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getEventOptionList = async (data) => {
    try {
        let query = {};

        if (data.keyWord && data.keyWord !== '') {
            query = { 'price': { '$regex': data.keyWord, '$options': 'i' } };
        }
        query['eventId'] = data.eventId;
        if (data && data.option && data.option != "") {
            query['option'] = data.option;
        } else {
            query['option'] = "YES";
        }
        console.log('^^^^^^^^^^^^^', query);
        let total = await EventOption.countDocuments(query);
        let resData = await EventOption.find(query).skip(data.size * (data.pageNo - 1)).limit(data.size).sort({ price: 1 }).populate('eventId', 'que');
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


let getEventOptionByQue = async (que) => {
    console.log('que_______', que);
    try {
        let tempdata = await EventOption.findOne({
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

let deleteEventOption = async (id) => {
    try {
        let deleteEventOption = await EventOption.deleteOne({ _id: id });
        if (deleteEventOption && deleteEventOption.deletedCount != 0) {
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
    saveEventOption: saveEventOption,
    getEventOptionById: getEventOptionById,
    getEventOptionList: getEventOptionList,
    getAllEventOptionByEventId: getAllEventOptionByEventId,
    getEventOptionByQue: getEventOptionByQue,
    deleteEventOption: deleteEventOption,
    getEventOptionByPrice: getEventOptionByPrice,
};