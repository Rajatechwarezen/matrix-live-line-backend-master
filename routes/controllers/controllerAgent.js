const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');
const axios = require('axios');
const globalFunction = require('../../utils/globalFunction');
const jwt = require('jsonwebtoken');
const serviceAdmin = require('../services/serviceAdmin');
const serviceLoginHistory = require('../services/serviceLoginHistory');
const serviceUser = require('../services/serviceUser');
const serviceKyc = require('../services/serviceKyc');
const settings = require('../../config/settings.json');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function agentLogin(req, res) {
  const joiValidateSchema = Joi.object({
    mobile: Joi.string().required(),
    password: Joi.string().required()
  })
  const validateSchema = joiValidateSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateSchema && validateSchema.error) {
    return apiErrorRes(req, res, validateSchema.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);

  }
  let findAdminData = {
    mobile: req.body.mobile,
    password: req.body.password,
  }
  let adminDatatemp = await serviceAdmin.verifyAgentMobilePassword(findAdminData);
  if (adminDatatemp.statusCode === CONSTANTS.SUCCESS) {
    const token = jwt.sign({
      chunk: 1,
      isAdmin: true,
      mobile: adminDatatemp.data.mobile,
    }, settings.agentsecret, { expiresIn: '365d' });
    let returnData = { mobile: adminDatatemp.data.mobile, token };
    return apiSuccessRes(req, res, CONSTANTS_MSG.LOGIN_SUCCESS, returnData);
  } else if (adminDatatemp.statusCode === CONSTANTS.ACCESS_DENIED) {
    return apiErrorRes(req, res, 'Enter valid password');
  } else if (adminDatatemp.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, 'Please enter valid mobile.');
  } else if (adminDatatemp.statusCode === CONSTANTS.SERVER_ERROR) {
    return apiErrorRes(req, res, CONSTANTS_MSG.LOGIN_FAILURE);
  }
};

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

async function getLoginHistoryListByUserId(req, res) {

  const registerParamSchema = Joi.object({
    userId: Joi.string().required(),
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  });

  try {
    await registerParamSchema.validate(req.body, {
      abortEarly: true
    });
  } catch (error) {
    console.log(error);
    return apiErrorRes(req, res, error.details[0].message);
  }
  let resData = await serviceLoginHistory.getLoginHistoryList(req.body);

  if (resData.statusCode === CONSTANTS.SUCCESS) {

    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getLiveList(req, res) {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://apicricketchampion.in/apiv4/liveMatchList/68352c40e73f0d00dc1bcab407633cdc',
    headers: {}
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return apiSuccessRes(req, res, 'Success', response.data);

    })
    .catch((error) => {
      console.log(error);
      return apiErrorRes(req, res, error, null);
    });
}

async function getHomeList(req, res) {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://apicricketchampion.in/apiv4/homeList/68352c40e73f0d00dc1bcab407633cdc',
    headers: {}
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return res.status(200).json(response.data)
      // return apiSuccessRes(req, res, 'Success', response.data);

    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json(error)

      // return apiErrorRes(req, res, error, null);
    });
}

router.post('/agentLogin', agentLogin);
router.post('/getUserList', getUserList);
router.post('/getUserByUserId', getUserByUserId);
router.post('/getLoginHistoryListByUserId', getLoginHistoryListByUserId);
router.get('/getLiveList', getLiveList);
router.get('/getHomeList', getHomeList);
module.exports = router;