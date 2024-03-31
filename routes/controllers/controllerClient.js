const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const globalFunction = require('../../utils/globalFunction');
const jwt = require('jsonwebtoken');
const serviceUser = require('../services/serviceUser');
const serviceShorts = require('../services/serviceShorts');
const serviceLoginHistory = require('../services/serviceLoginHistory');
const serviceBlog = require('../services/serviceBlog');
const servicePoll = require('../services/servicePoll');
const servicePollAnswer = require('../services/servicePollAnswer');
const serviceLiveUpdate = require('../services/serviceLiveUpdate');
const serviceRedis = require('../services/serviceRedis');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const settings = require('../../config/settings.json');
// const serviceEvent = require('../services/serviceEvent');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;

async function userRegister(req, res) {
  const userValidSchema = Joi.object({
    fullName: Joi.string().required(),
    mobile: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
    deviceId: Joi.string().allow(null).allow('').optional(),

  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);

  }
  if (req.body.password !== req.body.confirmPassword) {
    console.log("  Password and Confirm Password are not same :", req.body.password, ",", req.body.confirmPassword);
    return apiErrorRes(req, res, 'Password and confirm password not matched.');
  }

  let userData = await serviceUser.findMobile(req.body.mobile);

  if (userData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, 'Phone number already exist')
  }
  else if (userData.data == null) {
    // let keyData = '090909';
    let keyData = await globalFunction.generateOTP(6)
    let userToken = globalFunction.generateKey(40)
    let findUserData = {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      otp: keyData
    }
    axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=40HPd1m8XupTIr5fN3jxEFJCzqZliOaGWghtLRQv72eKUMwcsDkigE7LF5BIu2aAStNjoM89PUyl4R6p&route=otp&variables_values=${keyData}&flash=0&numbers=${req.body.mobile}`)
      .then(async (data) => {
        console.log('111111111', data && data.data ? data.data : '###');
        await serviceRedis.setKey("OTP_" + userToken, JSON.stringify(findUserData))
        return apiSuccessRes(req, res, CONSTANTS_MSG.REGISTER_SUCCESS_USER_MSG, { token: userToken });
      })
      .catch((err) => {
        console.log('**********', err.response.data.message);
        return apiErrorRes(req, res, err.response.data.message, null);
      })
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.REGISTER_SERVER_ERROR_MSG);
  }
}
async function verifyOtp(req, res) {
  const userValidSchema = Joi.object({
    token: Joi.string().required(),
    otp: Joi.string().required()
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }

  let tokenFromRedis = await serviceRedis.getKey("OTP_" + req.body.token);
  if (tokenFromRedis.statusCode === CONSTANTS.SUCCESS) {
    let tokenData = JSON.parse(tokenFromRedis.data)
    if (tokenData.otp == req.body.otp) {
      let findUserData = {
        fullName: tokenData.fullName,
        mobile: tokenData.mobile,
        password: tokenData.password,
      }
      let userData = await serviceUser.saveUser(findUserData);
      if (userData.statusCode == CONSTANTS.SUCCESS) {
        const token = jwt.sign({
          userId: userData.data._id,
        }, settings.usersecret, {
          expiresIn: '365d'
        });
        let returnData = { userId: userData.data._id, token };
        await serviceRedis.removeKey("OTP_" + req.body.token);
        let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
        let loginHistoryData = {
          userId: userData.data._id,
          desc: CONSTANTS_MSG.REGISTRATION_SUCCESS_MESSAGE,
          ipAddress: ip,
        }
        await serviceLoginHistory.saveLoginHistory(loginHistoryData)
        return apiSuccessRes(req, res, CONSTANTS_MSG.REGISTRATION_SUCCESS_MESSAGE, returnData);
      } else {
        return apiErrorRes(req, res, "Unable to register. Plz try again ");
      }
    } else {
      return apiErrorRes(req, res, "Invalid Otp");
    }
  } else {
    return apiErrorRes(req, res, "Otp Expired");
  }
}
async function login(req, res) {
  const userValidSchema = Joi.object({
    mobile: Joi.string().required(),
    password: Joi.string().required(),
    deviceId: Joi.string().allow(null).allow('').optional(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }

  let findUserData = {
    mobile: req.body.mobile,
    password: req.body.password,
  }

  let userData = await serviceUser.verifyMobilePassword(findUserData);
  console.log('userDatauserDatauserDatauserDatauserData', userData);

  if (userData.statusCode === CONSTANTS.SUCCESS && userData.data.isDisable == true) {
    return apiErrorRes(req, res, CONSTANTS_MSG.DEACIVE_USER)
  }
  else if (userData.statusCode === CONSTANTS.SUCCESS) {
    userData.data.deviceId = req.body.deviceId;
    userData.data.save();
    const token = jwt.sign({ userId: userData.data._id }, settings.usersecret);
    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    let loginHistoryData = {
      userId: userData.data._id,
      desc: CONSTANTS_MSG.LOGIN_SUCCESS,
      ipAddress: ip,
    }
    await serviceLoginHistory.saveLoginHistory(loginHistoryData)
    let returnData = { userId: userData.data.userId, token };
    return apiSuccessRes(req, res, CONSTANTS_MSG.LOGIN_SUCCESS, returnData);
  }
  else if (userData.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, CONSTANTS_MSG.INVALID_PASSWORD);
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Mobile Number invalid');
  } else if (userData.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_FAILURE);
  }
}
async function forgotPassword(req, res) {
  const userValidSchema = Joi.object({
    mobile: Joi.string().required()
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }

  let userData = await serviceUser.findMobile(req.body.mobile);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    let keyData = await globalFunction.generateOTP(6)
    let userToken = globalFunction.generateKey(40)
    let findUserData = {
      mobile: req.body.mobile,
      otp: keyData
    }
    axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=40HPd1m8XupTIr5fN3jxEFJCzqZliOaGWghtLRQv72eKUMwcsDkigE7LF5BIu2aAStNjoM89PUyl4R6p&route=otp&variables_values=${keyData}&flash=0&numbers=${req.body.mobile}`)
      .then(async (data) => {
        console.log('111111111', data && data.data ? data.data : '###');
        await serviceRedis.setKey("FORGOT_" + userToken, JSON.stringify(findUserData));
        return apiSuccessRes(req, res, CONSTANTS_MSG.FORGOT_PASSWORD_SUCCESS_MESSAGE_MSG, { token: userToken });
      })
      .catch((err) => {
        console.log('**********', err.response.data.message);
        return apiErrorRes(req, res, err.response.data.message, null);
      })
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.USER_NOT_FOUND);
  }
}
async function verifyOtpforgotPassword(req, res) {
  const userValidSchema = Joi.object({
    token: Joi.string().required(),
    otp: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    console.log("  Password and Confirm Password are not same :", req.body.password, ",", req.body.confirmPassword);
    return apiErrorRes(req, res, 'Password and confirm password not matched.');
  }

  let tokenFromRedis = await serviceRedis.getKey("FORGOT_" + req.body.token);
  if (tokenFromRedis.statusCode === CONSTANTS.SUCCESS) {
    let tokenData = JSON.parse(tokenFromRedis.data)
    console.log('tokenData______________', tokenData);
    if (tokenData.otp == req.body.otp) {
      console.log('tokenData.email', tokenData.email);
      let userResData = await serviceUser.findMobile(tokenData.mobile)
      console.log('userResData_______________', userResData);
      userResData.data.password = req.body.newPassword
      await userResData.data.save()
      await serviceRedis.removeKey("OTP_" + req.body.token);
      return apiSuccessRes(req, res, CONSTANTS_MSG.FORGOT_PASSWORD_SUCCESS)
    } else {
      console.log('1');
      return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_VALIDATE_OTP_INVALID_OTP_OR_EXPIRED_MSG);
    }
  } else if (tokenFromRedis.statusCode === CONSTANTS.DATA_NULL) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_VALIDATE_OTP_INVALID_OTP_OR_EXPIRED_MSG);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }

}
async function changepassword(req, res) {
  const userValidSchema = Joi.object({
    mobile: Joi.string().required(),
    password: Joi.string().required(),
    newPassword: Joi.string().required()
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let userData = await serviceUser.verifyMobilePassword(req.body);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    userData.data.password = req.body.newPassword;
    await userData.data.save();
    return apiSuccessRes(req, res, "Password updated successfully");
  } else if (userData.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, 'Enter valid password');
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Please enter valid mobile no.');
  } else if (userData.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getProfile(req, res) {
  let userData = await serviceUser.getProfile(req.user.userId);
  if (userData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, userData.data);
  } else if (userData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiSuccessRes(req, res, CONSTANTS_MSG.NOT_FOUND, CONSTANTS.DATA_NULL);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.SERVER_ERROR,);
  }
}

async function updateProfile(req, res) {
  const userValidSchema = Joi.object({
    fullName: Joi.string().required(),
    deviceId: Joi.string().allow(null).allow('').optional(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelDataTemp = await serviceUser.getUserById(req.user.userId);
  if (modelDataTemp.statusCode == CONSTANTS.SUCCESS) {
    modelDataTemp.data.fullName = req.body.fullName
    modelDataTemp.data.deviceId = req.body.deviceId
    let modeldataRes = await modelDataTemp.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.PROFILE_UPDATE_SUCESSFULLY_MSG, modeldataRes);
  }
  else {
    return apiErrorRes(req, res, CONSTANTS_MSG.USER_NOT_FOUND);
  }
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
      const respArr = data.data.data
      console.log('data________', respArr.length);
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.slice(startIndex, endIndex);
        console.log('resData________', resData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, resData);
      } else {
        return apiErrorRes(req, res, 'Not found.', []);
      }

    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', null);
    })
}

async function getRecentMatchList(req, res) {
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
  axios.get(`http://172.105.48.215/apiv4/recentMatches/${settings.Match_Api_Key}`)
    .then(async (data) => {
      const respArr = data.data.data
      console.log('data________', respArr.length);
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.slice(startIndex, endIndex);
        console.log('resData________', resData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, resData);
      } else {
        return apiErrorRes(req, res, 'Not found.', []);
      }

    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', null);
    })
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
      const respArr = data.data.data
      console.log('data________', respArr.length);
      let startIndex = (pageNo - 1) * size;
      let endIndex = startIndex + size;
      if (respArr.length > 0) {
        let resData = respArr.slice(startIndex, endIndex);
        console.log('resData________', resData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, resData);
      } else {
        return apiSuccessRes(req, res, 'Not found.', []);
      }

    })
    .catch((err) => {
      console.log('**********', err);
      return apiErrorRes(req, res, 'Error While Hit Api', null);
    })
}

async function getShortsList(req, res) {
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
  let resData = await serviceShorts.getShortsList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getShortsListByCategory(req, res) {
  const joiValidateSchema = Joi.object({
    category: Joi.string().required(),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  req.body.category = req.body.category.toLowerCase();
  let resData = await serviceShorts.getShortsList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function likeOrDislikeShorts(req, res) {
  const ShortsValidSchema = Joi.object({
    id: Joi.string().required(),
    status: Joi.string().valid('like', 'dislike'),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let reqData = {
    userId: req.user.userId,
    shortId: req.body.id,
    status: req.body.status
  }

  let modelData = await serviceShorts.getShortsByIdAndUserIdInDisLikeSection(reqData);
  console.log('modelDatamodelDatamodelData', modelData);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    if (req.body.status == 'like') {
      await serviceShorts.pullDisLikeDataFromShorts(reqData);
      await serviceShorts.pushLikeDataInShorts(reqData);
      return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
    } else {
      await serviceShorts.pullDisLikeDataFromShorts(reqData);
      return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
    }
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    let innerModelData = await serviceShorts.getShortsByIdAndUserIdInLikeSection(reqData);
    console.log('innerModelDatainnerModelDatainnerModelData', innerModelData);
    if (innerModelData.statusCode === CONSTANTS.SUCCESS) {
      if (req.body.status == 'dislike') {
        await serviceShorts.pullLikeDataFromShorts(reqData);
        await serviceShorts.pushDisLikeDataInShorts(reqData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
      }
      else {
        await serviceShorts.pullLikeDataFromShorts(reqData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
      }
    } else if (innerModelData.statusCode === CONSTANTS.NOT_FOUND) {

      if (req.body.status == 'dislike') {
        await serviceShorts.pushDisLikeDataInShorts(reqData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
      }
      else {
        await serviceShorts.pushLikeDataInShorts(reqData);
        return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);
      }
    }
  }
  else {
    return apiErrorRes(req, res, CONSTANTS_MSG.SERVER_ERROR);
  }

  // let modelData = await serviceShorts.getShortsById(req.body.id);
  // console.log('modelDatamodelDatamodelData', modelData);
  // if (modelData.statusCode === CONSTANTS.SUCCESS) {
  //   if(req.body.status =='like'){
  //     if(modelData.data && modelData.data.likes && model.data.likes.includes()){

  //     }

  //   }
  //   modelData.data.category = req.body.category.toLowerCase();
  //   modelData.data.uploadType = req.body.uploadType;
  //   modelData.data.file = req.body.file;
  //   await modelData.data.save();
  //   return apiSuccessRes(req, res, CONSTANTS_MSG.SHORTS_UPDATE_SUCCESS, modelData.data);
  // } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
  //   return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  // } else {
  //   return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  // }
}

async function getLiveUpdateByMatchId(req, res) {
  console.log('111111111');
  const ShortsValidSchema = Joi.object({
    matchId: Joi.string().required(),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceLiveUpdate.getLiveUpdateByMatchId(req.body.matchId);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', null);
  }
}

async function getBlogList(req, res) {
  const userValidSchema = Joi.object({
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceBlog.getBlogList(req.body);

  if (resData.statusCode === CONSTANTS.SUCCESS) {

    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function saveDeviceId(req, res) {
  const userValidSchema = Joi.object({
    deviceId: Joi.string().empty(""),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceUser.findDeviceByDevId(req.body.deviceId);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    resData.data.deviceId = req.body.deviceId;
    await resData.data.save();
    return apiSuccessRes(req, res, 'Success', resData.data);
  }
  else if (resData.data == null) {
    let modeldataRes = await serviceUser.saveDeviceId(req.body);
    if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, "Success", modeldataRes.data);
    } else if (modeldataRes.statusCode == 11000) {
      return apiErrorRes(req, res, "Failure");
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getPollListForUser(req, res) {
  const userValidSchema = Joi.object({
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await servicePoll.getPollList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function savePollAnswer(req, res) {
  const userValidSchema = Joi.object({
    pollId: Joi.string().required(),
    answer: Joi.string().required(),
    pollOptionId: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let query = {
    userId: req.user.userId,
    pollId: req.body.pollId,
    // pollOptionId: req.body.pollOptionId,
  }

  let saveUserPollData = await servicePollAnswer.findOne(query);
  if (saveUserPollData.statusCode == CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, "Already Save Answer", saveUserPollData.data);
  }
  let data = {
    pollId: req.body.pollId,
    userId: req.user.userId,
    pollOptionId: req.body.pollOptionId,
    answer: req.body.answer,
    $inc: { count: 1 }
  }

  let tempData0 = await servicePollAnswer.savePollAnswer(data);
  if (tempData0.statusCode == CONSTANTS.SUCCESS) {
    let dataPollDataQuery = {
      pollId: req.body.pollId,
      _id: req.body.pollOptionId,
    }

    let dataPollData = {
      pollId: req.body.pollId,
      _id: req.body.pollOptionId,
      $inc: { count: 1 }
    }

    await servicePoll.findOneAndUpdatePollOption(dataPollDataQuery, dataPollData);

    console.log("tempData0::", tempData0);
    console.log("req.user.userId::", req.user);

    // return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS);


    // await servicePollCampaign.findOneAndUpdate({
    //   // userId: req.headers.userId,
    //   userId: req.user.userId,
    //   pollId: req.body.pollId,
    // }, { isComplete: true });
    return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, tempData0.data);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getPollAnswerByUser(req, res) {

  let pollData = await servicePoll.getEnabledPoll();

  let tempObject = {}
  if (pollData.statusCode === CONSTANTS.SUCCESS) {

    console.log('req.user..........', req.user.userId);

    let pollAnswerData = await servicePollAnswer.getPollAnswerByUserId(req.user.userId);


    pollAnswerData.data.forEach(element => {
      tempObject[element.pollId] = element
    });
    console.log('pollAnswerData_______', tempObject);
    let pollDataTempData = JSON.parse(JSON.stringify(pollData.data))
    for (let index = 0; index < pollDataTempData.length; index++) {
      const element = pollDataTempData[index];
      element["isSubmit"] = tempObject[element.id] ? true : false;
      if (tempObject[element.id]) {

        let dataFilter = element.optionsList.filter(data => data.name == tempObject[element.id].answer)
        console.log('dataFilter______', dataFilter);
        element['answerCount'] = dataFilter && dataFilter.length > 0 ? dataFilter[0].count : null;
      }
    }
    return apiSuccessRes(req, res, 'Success', pollDataTempData);
  } else {
    return apiErrorRes(req, res, 'Data not found.', []);
  }
}



router.post('/userRegister', userRegister);
router.post('/verifyOtp', verifyOtp);
router.post('/login', login);
router.post('/verifyOtpforgotPassword', verifyOtpforgotPassword);
router.post('/forgotPassword', forgotPassword);
router.post('/changepassword', changepassword);
router.get('/getProfile', getProfile);
router.post('/updateProfile', updateProfile);
router.post('/getUpcomingMatchList', getUpcomingMatchList);
router.post('/getRecentMatchList', getRecentMatchList);
router.post('/getLiveMatchList', getLiveMatchList);
router.post('/getShortsList', getShortsList);
router.post('/getShortsListByCategory', getShortsListByCategory);
router.post('/likeOrDislikeShorts', likeOrDislikeShorts);
router.post('/getLiveUpdateByMatchId', getLiveUpdateByMatchId);
router.post('/getBlogList', getBlogList);
router.post('/saveDeviceId', saveDeviceId);
router.post('/getPollListForUser', getPollListForUser);
router.post('/savePollAnswer', savePollAnswer);
router.get('/getPollAnswerByUser', getPollAnswerByUser);

module.exports = router;