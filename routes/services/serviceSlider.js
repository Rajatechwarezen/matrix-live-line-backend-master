const { default: mongoose } = require('mongoose');
const db = require('../../db'),
    bcrypt = require('bcrypt'),

    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let Slider = db.Slider;
let resultdb = global_fun.resultdb;



let getSliderById = async (id) => {
    try {
        let temp = await Slider.findOne({
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
let getSliderByName = async (name) => {

    try {
        let tempdata = await Slider.findOne({
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

let saveSlider = async (data) => {
    try {
        let catDat = new Slider(data);
        let responnse = await catDat.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getAllSlider = async (data) => {
    try {
        let resData = await Slider.find();
        return resultdb(CONSTANTS.SUCCESS, resData)
    } catch (error) {
        console.log(error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getSliderList = async (data, sort) => {
    try {
        let query = {};
        if (data.keyWord && data.keyWord !== '') {
            query = { 'name': { '$regex': data.keyWord, '$options': 'i' } };
        }
        let total = await Slider.countDocuments(query);
        let resData = await Slider.find(query).sort(sort)
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


let getSliderBySlug = async (slug) => {

    try {
        let tempdata = await Slider.find({
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

let deleteSlider = async (id) => {
    try {
        let deleteShorts = await Slider.deleteOne({ _id: id });
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
    saveSlider: saveSlider,
    getSliderById: getSliderById,
    getSliderList: getSliderList,
    getAllSlider: getAllSlider,
    getSliderBySlug: getSliderBySlug,
    getSliderByName: getSliderByName,
    deleteSlider: deleteSlider,

};