const db = require('../../db'),
    bcrypt = require('bcrypt'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let LoginHistory = db.LoginHistory;
let resultdb = global_fun.resultdb;






let getLoginHistoryById = async (id) => {
    console.log('11111111111111111111111111111111111111111111111', id);
    try {
        let LoginHistoryData = await LoginHistory.findOne({
            _id: id.toString()
        });
        if (LoginHistoryData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, LoginHistoryData)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getAllLoginHistory = async () => {
    try {
        let LoginHistoryData = await LoginHistory.find();
        if (LoginHistoryData === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, LoginHistoryData)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let saveLoginHistory = async (data) => {
    try {
        let testUser = new LoginHistory(data);
        let responnse = await testUser.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};

let getLoginHistoryList = async (data) => {
    try {
        let query = {};
        query["userId"] = data.userId
        let total = await LoginHistory.countDocuments(query);
        let resData = await LoginHistory.find(query)
            .skip(data.size * (data.pageNo - 1)).limit(data.size).sort({ createdAt: -1 }).populate('userId');
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
// let getLoginHistoryListUser = async (userId) => {
//     try {
//         query= { userId: userId }
//         let total = await LoginHistory.countDocuments(query);
//         let resData = await LoginHistory.find(query)
//         let tempData = {
//             total: total,
//             list: resData
//         }
//         return resultdb(CONSTANTS.SUCCESS, tempData)
//     } catch (error) {
//         console.log(error);

//         return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
//     }
// };
module.exports = {
    getAllLoginHistory,
    saveLoginHistory,
    getLoginHistoryById,
    getLoginHistoryList,
    // getLoginHistoryListUser
}