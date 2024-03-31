const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');
const axios = require('axios');
const globalFunction = require('../../utils/globalFunction');
const jwt = require('jsonwebtoken');
const serviceAdmin = require('../services/serviceAdmin');
const serviceUser = require('../services/serviceUser');
const serviceKyc = require('../services/serviceKyc');
const settings = require('../../config/settings.json');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;
const multer = require('multer');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload')
  },
  filename: (req, file, cb) => {
    console.log('222222222222222222222', file);
    console.log("file.fieldname  ", file.fieldname);
    console.log('path.extname(file.originalname)', path.extname(file.originalname));
    console.log("final file name :::   ", Date.now() + path.extname(file.originalname));
    req.body.imageFileName = (Date.now() + path.extname(file.originalname));
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

let upload = multer({ storage: storage });


async function adminLogin(req, res) {
  const joiValidateSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);

  }
  let findAdminData = {
    userName: req.body.userName.toLowerCase(),
    password: req.body.password,
  }
  let adminDatatemp = await serviceAdmin.verifyUsernamePassword(findAdminData);
  if (adminDatatemp.statusCode === CONSTANTS.SUCCESS) {
    const token = jwt.sign({
      chunk: 1,
      isAdmin: true,
      userName: adminDatatemp.data.userName,
    }, settings.adminsecret, { expiresIn: '365d' });
    let returnData = { userName: adminDatatemp.data.userName, token };
    return apiSuccessRes(req, res, CONSTANTS_MSG.LOGIN_SUCCESS, returnData);
  } else if (adminDatatemp.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, 'Enter valid password');
  } else if (adminDatatemp.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Please enter valid userName.');
  } else if (adminDatatemp.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_FAILURE);
  }
};

async function createUserByAdmin(req, res) {
  const joiValidateSchema = Joi.object({
    fullName: Joi.string().required(),
    mobile: Joi.number().required(),
    password: Joi.string().required()
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }

  let userData = await serviceUser.getUserByMobile(req.body.mobile);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, CONSTANTS_MSG.REGISTER_ALREADY_EXIST_USERNAME_MSG, CONSTANTS.DATA_NULL, CONSTANTS.DEACTIVE_STATUS);
  } else if (userData.data == null && userData.statusCode === CONSTANTS.NOT_FOUND) {
    let userDataRes = await serviceUser.saveUser(req.body);
    if (userDataRes.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.USER_CREATE_SUCCESS, userDataRes.data);
    } else if (userDataRes.statusCode == 11000) {
      return apiErrorRes(req, res, CONSTANTS_MSG.REGISTER_ALREADY_EXIST_USERNAME_MSG);
    } else {
      console.log("Failed to register , mobile :", req.body.mobile)
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    console.log("Server issue :")
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}


async function changePasswordAdmin(req, res) {
  const joiValidateSchema = Joi.object({
    newpassword: Joi.string().required(),
    confirmpassword: Joi.string().required(),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);

  }
  let userData = await serviceAdmin.getAdminByUserName(req.user.userName);
  console.log('userDatauserData--------------------', req.user.userName);
  if (req.body.newpassword !== req.body.confirmpassword) {
    return apiErrorRes(req, res, "Password does Not Match");
  }
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    userData.data.password = req.body.newpassword;
    await userData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.CHANGE_PASSWORD_SUCCESS);
  } else if (userData.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ENTER_VALID_PASSWORD_CURR);
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}


async function getUserList(req, res) {
  const joiValidateSchema = Joi.object({
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceUser.getUserList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateUserStatus(req, res) {
  const joiValidateSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceUser.getUserByUserId(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    resData.data.isDisable = !resData.data.isDisable
    await resData.data.save()
    return apiSuccessRes(req, res, 'Success', resData);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function deleteUser(req, res) {
  const joiValidateSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceUser.getUserByUserId(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {

    let modelDataInner = await serviceUser.deleteUser(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.USER_DELETE_SUCCESS);
    } else if (modelDataInner.statusCode === CONSTANTS.ACCESS_DENIED) {
      return apiErrorRes(req, res, CONSTANTS_MSG.USER_UNABLE_DELETE, CONSTANTS.DATA_NULL);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE, CONSTANTS.DATA_NULL);
    }
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getUserByUserId(req, res) {
  const joiValidateSchema = Joi.object({
    userId: Joi.string().required(),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let userData = await serviceUser.getUserByUserId(req.body.userId);
  console.log('_____________', userData);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, userData.data);
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiSuccessRes(req, res, CONSTANTS_MSG.NOT_FOUND, CONSTANTS.DATA_NULL);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.SERVER_ERROR,);
  }
}

async function uploadImage(req, res) {

  if (!req.file) {
    return apiErrorRes(req, res, "Please send image in form data.");
  }

  let tempData = {
    imageName: req.body.imageFileName,
    imageURL: settings.imageUrl + req.body.imageFileName,
  }
  return apiSuccessRes(req, res, "Sucess", tempData);
}

async function getLiveMatchList(req, res) {
  const joiValidateSchema = Joi.object({
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  const { pageNo, size } = req.body;
  axios.get(`http://172.105.48.215/apiv4/liveMatchList/${settings.Match_Api_Key}`)
    .then(async (data) => {
      const respArr = data.data.data;
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.slice(startIndex, endIndex);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, resData);
      } else {
        return apiSuccessRes(req, res, 'Not found.', []);
      }
    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', CONSTANTS.DATA_NULL);
    })
}

async function getUpcomingMatchList(req, res) {
  const joiValidateSchema = Joi.object({
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  const { pageNo, size } = req.body;
  axios.get(`http://172.105.48.215/apiv4/upcomingMatches/${settings.Match_Api_Key}`)
    .then(async (data) => {
      const respArr = data.data.data;
      console.log('respArr________', respArr.length);
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.slice(startIndex, endIndex);
        const returnData = {
          list: resData,
          total: respArr.length
        }
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, returnData);
      } else {
        return apiSuccessRes(req, res, 'Not found.', []);
      }
    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', CONSTANTS.DATA_NULL);
    })
}

async function getMatchByMatchId(req, res) {
  const joiValidateSchema = Joi.object({
    match_id: Joi.string().required()
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  const { pageNo, size } = req.body;
  axios.get(`http://172.105.48.215/apiv4/upcomingMatches/${settings.Match_Api_Key}`)
    .then(async (data) => {
      const respArr = data.data.data;
      console.log('respArr________', respArr.length);
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.filter(data => data.match_id == req.body.match_id);
        console.log('resData_______', resData);
        const returnData = resData[0]
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, returnData);
      } else {
        return apiSuccessRes(req, res, 'Not found.', []);
      }
    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', CONSTANTS.DATA_NULL);
    })
}

router.post('/adminLogin', adminLogin);
router.post('/createUserByAdmin', createUserByAdmin);
router.post('/getUserList', getUserList);
router.post('/changePasswordAdmin', changePasswordAdmin);
router.post('/updateUserStatus', updateUserStatus);
router.post('/deleteUser', deleteUser);
router.post('/getUserByUserId', getUserByUserId);
router.post('/getLiveMatchList', getLiveMatchList);
router.post('/getUpcomingMatchList', getUpcomingMatchList);
router.post('/getMatchByMatchId', getMatchByMatchId);
router.post('/uploadImage', upload.single('image'), uploadImage);
module.exports = router;