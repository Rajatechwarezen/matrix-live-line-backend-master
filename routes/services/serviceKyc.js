const { Mongoose } = require('mongoose');
const db = require('../../db'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
var mongoose = require("mongoose");
let Kyc = db.Kyc;
let resultdb = global_fun.resultdb;



let getKycByName = async (name) => {
    try {
        let tempdata = await Kyc.findOne({
            name: name
        });
        console.log("temopdeae in service", tempdata);
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
let getKycById = async (id) => {
    try {
        let tempdata = await Kyc.findOne({
            _id: id
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
let getKycByUserId = async (UserId) => {
    console.log('UserId______________', UserId);
    try {
        let tempdata = await Kyc.findOne({
            userId: UserId
        });
        console.log("temopdeae in service", tempdata);
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

let saveKyc = async (data) => {
    console.log('asdfasdfasdfasdfsdfrrrrrrrrrrrrrrrrrrrrrrrrrrr', data);
    try {
        let reqData = {
            ...data,
            "status": 1
        }
        let testKyc = new Kyc(reqData);

        let responnse = await testKyc.save();

        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.error("Can't save information of user for kyc, Query", error);
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};
let getKycList = async (data, sort) => {
    try {
        let query = { isSubmit: true };
        if (data.kycType && data.kycType !== '' && data.kycType === "PENDING") {
            query['status'] = 0
        } else if (data.kycType && data.kycType !== '' && data.kycType === "SUCCESS") {
            query['status'] = 1
        } else if (data.kycType && data.kycType !== '' && data.kycType === "REJECT") {
            query['status'] = 2
        }

        if (data.keyWord && data.keyWord !== '') {
            query = { isSubmit: true, 'docnumber': { '$regex': data.keyWord, '$options': 'i' } };
        }
        let total = await Kyc.countDocuments(query);
        let resData = await Kyc.find(query)
            .populate('userId', 'name email -_id')
            // .populate('kycDocList')
            .populate({
                path: 'kycDocList',
                populate: {
                    path: 'docTypeId',
                    model: 'Document'
                }
            })
            .populate('userInfoId')
            .sort(sort)
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

module.exports = {
    saveKyc,
    getKycByName,
    getKycById,
    getKycByUserId,
    getKycList
};