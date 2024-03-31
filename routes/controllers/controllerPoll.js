const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const servicePoll = require('../services/servicePoll');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function createPoll(req, res) {
  const userValidSchema = Joi.object({
    que: Joi.string().required(),
    matchId: Joi.string().required(),
    series: Joi.string().required(),
    matchs: Joi.string().required(),
    match_date: Joi.string().required(),
    match_time: Joi.string().required(),
    teamA: Joi.string().required(),
    teamB: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePoll.getPollByQue(req.body.que);
  if (modelData.statusCode === CONSTANTS.SUCCESS && modelData.data && modelData.data.isDisable == true) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST, CONSTANTS.DATA_NULL);
  } else if (modelData.data == null) {
    let modeldataRes = await servicePoll.savePoll(req.body);
    if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_CREATE_SUCCESS, modeldataRes.data);
    } else if (modeldataRes.statusCode == 11000) {
      return apiErrorRes(req, res, CONSTANTS_MSG.Poll_ALREADY_EXIST);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getPollList(req, res) {
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

async function getAllPoll(req, res) {
  let resData = await servicePoll.getAllPoll();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updatePoll(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
    que: Joi.string().required(),
    matchId: Joi.string().required(),
    series: Joi.string().required(),
    matchs: Joi.string().required(),
    match_date: Joi.string().required(),
    match_time: Joi.string().required(),
    teamA: Joi.string().required(),
    teamB: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePoll.getPollById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.que = req.body.que;
    modelData.data.matchId = req.body.matchId;
    modelData.data.series = req.body.series;
    modelData.data.matchs = req.body.matchs;
    modelData.data.match_date = req.body.match_date;
    modelData.data.match_time = req.body.match_time;
    modelData.data.teamA = req.body.teamA;
    modelData.data.teamB = req.body.teamB;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deletePoll(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePoll.getPollById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await servicePoll.deletePoll(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.POLL_DELETE_SUCCESS);
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

async function updatePollStatus(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await servicePoll.getPollById(req.body.id);
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
async function getPollById(req, res) {
  let resData = await servicePoll.getPollById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createPoll', createPoll);
router.get('/getAllPoll', getAllPoll);
router.post('/updatePoll', updatePoll);
router.post('/getPollList', getPollList);
router.post('/deletePoll', deletePoll);
router.post('/updatePollStatus', updatePollStatus);
router.post('/getPollById', getPollById);


module.exports = router;