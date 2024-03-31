const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const servicePollOption = require('../services/servicePollOption');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function createPollOption(req, res) {
  const userValidSchema = Joi.object({
    name: Joi.string().required(),
    pollId: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePollOption.getPollOptionByPollIdAndName(req.body);
  if (modelData.statusCode === CONSTANTS.SUCCESS && modelData.data) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST, CONSTANTS.DATA_NULL);
  } else if (modelData.data == null) {
    let modeldataRes = await servicePollOption.savePollOption(req.body);
    if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_OPTION_CREATE_SUCCESS, modeldataRes.data);
    } else if (modeldataRes.statusCode == 11000) {
      return apiErrorRes(req, res, CONSTANTS_MSG.PollOption_ALREADY_EXIST);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getPollOptionList(req, res) {
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
  let resData = await servicePollOption.getPollOptionList(req.body);

  if (resData.statusCode === CONSTANTS.SUCCESS) {

    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getAllPollOption(req, res) {
  let resData = await servicePollOption.getAllPollOption();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updatePollOption(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    pollId: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePollOption.getPollOptionById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.name = req.body.name;
    modelData.data.pollId = req.body.pollId;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_OPTION_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deletePollOption(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePollOption.getPollOptionById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await servicePollOption.deletePollOption(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_OPTION_DELETE_SUCCESS);
    } else if (modelDataInner.statusCode === CONSTANTS.ACCESS_DENIED) {
      return apiErrorRes(req, res, "Unable to delete", CONSTANTS.DATA_NULL);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE, CONSTANTS.DATA_NULL);
    }
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function updatePollOptionStatus(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePollOption.getPollOptionById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.isDisable = !modelData.data.isDisable;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}
async function getPollOptionById(req, res) {
  let resData = await servicePollOption.getPollOptionById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createPollOption', createPollOption);
router.get('/getAllPollOption', getAllPollOption);
router.post('/updatePollOption', updatePollOption);
router.post('/getPollOptionList', getPollOptionList);
router.post('/deletePollOption', deletePollOption);
router.post('/updatePollOptionStatus', updatePollOptionStatus);
router.post('/getPollOptionById', getPollOptionById);


module.exports = router;