const { Ticket } = require('../../db');
const db = require('../../db'),
    bcrypt = require('bcrypt'),

    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let User = db.User;
let DeviceId = db.DeviceId;
let resultdb = global_fun.resultdb;

let generateUniqueUserName = async (name) => {
    const min = 1;
    const max = 9999;
    let userName = name;
    let randomNumber;
    let isUnique = false;
    while (!isUnique) {
        randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (name.includes(" ")) {
            userName = name.replace(/ /g, "_");
        }
        userName = userName + randomNumber;
        const alreadyUser = await User.findOne({ userName: userName })
        if (!alreadyUser || alreadyUser == null) {
            isUnique = true;
        }
    }
    const randomString = userName.toString().padStart(4, '0');
    return randomString;
}


let getUserByMobile = async (mobile) => {
    try {
        var tempMobile = await User.findOne({
            mobile: mobile
        });
        if (tempMobile === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempMobile)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let saveUser = async (data) => {
    try {
        let testUser = new User(data);
        let responnse = await testUser.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);

        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};

let getUserList = async (data) => {
    try {
        console.log('data_____', data);
        let query = {}
        if (data.keyWord && data.keyWord !== '') {
            query = { 'mobile': { '$regex': data.keyWord, '$options': 'i' } };
        }
        console.log('query_______', query);
        let total = await User.countDocuments(query);
        let resData = await User.find(query)
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


let deleteUser = async (id) => {
    try {
        let deleteUser = await User.deleteOne({ _id: id });
        if (deleteUser && deleteUser.deletedCount != 0) {
            return resultdb(CONSTANTS.SUCCESS, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.DATA_NULL)
        }
    } catch (error) {
        console.log("error  ", error);

        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


















let getUserByEmail = async (userName) => {
    try {
        var user = await User.findOne({
            userName: userName
        });
        console.log("111111111________", user);
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getUserByUserId = async (userId) => {
    try {
        var user = await User.findOne({
            _id: userId
        });
        // console.log("111111111________", user);
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let getProfile = async (userId) => {
    try {
        var user = await User.findOne({
            _id: userId
        });
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getUserProfile = async (userId) => {
    try {
        var user = await User.findOne({
            _id: userId
        })
        // console.log("111111111________", user);
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let getUserByUserName = async (userName) => {
    // console.log("SERVICE____getRefByUserId::", id)
    try {
        var user = await User.findOne({
            userName: userName
        })
        // console.log("SERVICE____getRefByUserId:user:", user)
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.error("Unable to find user account, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

function generateKey(length = CONSTANTS.TOKEN_LENGTH) {
    var key = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < length; i++) {
        key += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return key;
}

function generateOTP(length = CONSTANTS.OTP_LENGTH) {
    var key = "";
    var possible = "0123456789";
    for (var i = 0; i < length; i++) {
        key += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return key;
}

const sendVerificationEmail = async (email, link) => {
    try {

        return await transporter.sendMail({
            from: settings.SMTP_EMAIL,
            to: email,
            subject: 'Verify email address, DIC coin wallet.',
            html: (await htmltemplate.verificationEmail(link)).toString()
        });
    } catch (error) {
        console.log("email error ::: ", error);

    }

}


let verifyEmailPassword = async (data) => {
    let userresponse = await getUserByEmail(data.userName);
    console.log("userresponseuserresponse________________", userresponse)
    if (userresponse.data === null) {
        return resultdb(CONSTANTS.NOT_FOUND);
    }
    else {
        console.log("111111111111111111111111111")
        let verifypass = null;

        verifypass = await bcrypt.compare(data.password, userresponse.data.password);
        console.log("verifypassverifypass______________", verifypass)

        if (verifypass) {
            return resultdb(CONSTANTS.SUCCESS, userresponse.data);
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.FALSE);
        }
    }
};

let verifyMobilePassword = async (data) => {
    let userresponse = await getUserByMobile(data.mobile);
    console.log("userresponseuserresponse________________", userresponse)
    if (userresponse.data === null) {
        return resultdb(CONSTANTS.NOT_FOUND);
    }
    else {
        console.log("111111111111111111111111111")
        let verifypass = null;

        verifypass = await bcrypt.compare(data.password, userresponse.data.password);
        console.log("verifypassverifypass______________", verifypass)

        if (verifypass) {
            return resultdb(CONSTANTS.SUCCESS, userresponse.data);
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.FALSE);
        }
    }
};
let verifyuserIdPassword = async (data) => {
    console.log("11111111", data);

    let userresponse = await getUserById(data.userId);
    // console.log("2222222222", userresponse);

    if (userresponse.data === null) {
        return resultdb(CONSTANTS.NOT_FOUND);
    } else if (userresponse.data.verificationStatus === false) {
        return resultdb(CONSTANTS.NOT_VERIFIED);
    } else {
        let verifypass = null;
        try {
            verifypass = await bcrypt.compare(data.currentpassword, userresponse.data.password);
            console.error("Unable to verify user account, Query", error);
            //console.log("verifypass  ",verifypass);
        } catch (error) {
        }
        if (verifypass) {
            return resultdb(CONSTANTS.SUCCESS, userresponse.data);
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.FALSE);
        }
    }
};
let getUserById = async (id) => {
    // logger.info('Enter get_user_by_id......', id.toString());
    try {
        var user = await User.findOne({
            _id: id.toString()
        });
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.error("Unable to get data of user, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getAllUser = async (data) => {
    try {
        var user = await User.find();
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let getAllUserDeviceId = async () => {
    try {
        var user = await User.find({ "deviceId": { $exists: true, $ne: null, $ne: "" } });
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let getDashboardData = async (data, sort) => {

    try {
        let totalWalletDeposit = await Ticket.countDocuments({
            type: 'WALLET_REQ',
            txType: 'DEPOSIT',
        })
        let totalWalletWithdrawl = await Ticket.countDocuments({
            type: 'WALLET_REQ',
            txType: 'WITHDRAW',
        })
        let todaysRequests = await Ticket.countDocuments({
            createdAt: Date.now(),
            txType: 'WITHDRAW',
        })
        let totalUser = await User.countDocuments()

        let tempData = {
            totalWalletDeposit: totalWalletDeposit,
            totalWalletWithdrawl: totalWalletWithdrawl,
            todaysRequests: todaysRequests,
            totalUser: totalUser
        }
        return resultdb(CONSTANTS.SUCCESS, tempData)
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let findMobile = async (mobile) => {
    try {
        let user = await User.findOne({
            mobile: mobile
        });
        console.log('useruseruseruseruseruseruseruseruseruseruseruser', user);
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let findDeviceByDevId = async (deviceId) => {
    try {
        let user = await DeviceId.findOne({
            deviceId: deviceId
        });
        if (user === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, user)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};


let saveDeviceId = async (data) => {
    try {
        let testDevideId = new DeviceId(data);
        let responnse = await testDevideId.save();
        return resultdb(CONSTANTS.SUCCESS, responnse)
    } catch (error) {
        console.log("there are the catch error", error);
        if (error.code)
            return resultdb(error.code, CONSTANTS.DATA_NULL)
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL);
    }
};


module.exports = {
    getUserByEmail: getUserByEmail,
    findMobile: findMobile,
    generateUniqueUserName: generateUniqueUserName,
    generateKey: generateKey,
    generateOTP: generateOTP,
    sendVerificationEmail: sendVerificationEmail,
    saveUser: saveUser,
    verifyEmailPassword: verifyEmailPassword,
    getUserByUserName: getUserByUserName,
    getUserByUserId: getUserByUserId,
    getAllUser: getAllUser,
    getUserByMobile: getUserByMobile,
    verifyMobilePassword: verifyMobilePassword,
    getUserById: getUserById,
    verifyuserIdPassword: verifyuserIdPassword,
    getUserList: getUserList,
    getProfile: getProfile,
    getUserProfile: getUserProfile,
    getAllUserDeviceId: getAllUserDeviceId,
    getDashboardData: getDashboardData,
    deleteUser: deleteUser,
    findDeviceByDevId: findDeviceByDevId,
    saveDeviceId: saveDeviceId,

};