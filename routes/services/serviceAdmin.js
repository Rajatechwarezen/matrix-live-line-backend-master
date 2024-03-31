const db = require('../../db'),
    bcrypt = require('bcrypt'),
    settings = require('../../config/settings'),
    global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let Admin = db.Admin;
let Agent = db.Agent;
let resultdb = global_fun.resultdb;

let findUsername = async (admin) => {
    try {
        var admin = await Admin.findOne({
            username: admin
        });
        if (admin === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, admin)
        }
    }
    catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let findMobile = async (mobile) => {
    try {
        var mobile = await Agent.findOne({
            mobile: mobile
        });
        if (mobile === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, mobile)
        }
    }
    catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};

let getEmployeeById = async (id) => {
    try {
        let tempEmployee = await Employee.findOne({
            _id: id.toString()
        });
        if (tempEmployee === null) {
            return resultdb(CONSTANTS.NOT_FOUND, CONSTANTS.DATA_NULL)
        } else {
            return resultdb(CONSTANTS.SUCCESS, tempEmployee)
        }
    } catch (error) {
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let verifyUsernamePassword = async (data) => {
    let Adminresponse = await findUsername(data.username);
    if (Adminresponse.data === null) {
        return resultdb(CONSTANTS.NOT_FOUND);
    } else if (Adminresponse.data.verificationStatus === false) {
        return resultdb(CONSTANTS.NOT_VERIFIED);
    } else {
        let verifypass = null;
        try {
            verifypass = await bcrypt.compare(data.password, Adminresponse.data.password);
        } catch (error) {
        }
        if (verifypass) {
            return resultdb(CONSTANTS.SUCCESS, Adminresponse.data);
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.FALSE);
        }
    }
};
let verifyAgentMobilePassword = async (data) => {
    let Adminresponse = await findMobile(data.mobile);
    if (Adminresponse.data === null) {
        return resultdb(CONSTANTS.NOT_FOUND);
    } else if (Adminresponse.data.verificationStatus === false) {
        return resultdb(CONSTANTS.NOT_VERIFIED);
    } else {
        let verifypass = null;
        try {
            verifypass = await bcrypt.compare(data.password, Adminresponse.data.password);
        } catch (error) {
        }
        if (verifypass) {
            return resultdb(CONSTANTS.SUCCESS, Adminresponse.data);
        } else {
            return resultdb(CONSTANTS.ACCESS_DENIED, CONSTANTS.FALSE);
        }
    }
};


let getAdminByUserName = async (userName) => {
    try {
        var user = await Admin.findOne({
            userName: userName
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


module.exports = {
    getEmployeeById: getEmployeeById,
    verifyUsernamePassword: verifyUsernamePassword,
    findUsername: findUsername,
    getAdminByUserName: getAdminByUserName,
    verifyAgentMobilePassword: verifyAgentMobilePassword
};