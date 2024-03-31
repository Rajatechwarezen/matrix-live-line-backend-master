const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const serviceShorts = require('../services/serviceShorts');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;
const db = require('../../db');
let Shorts = db.Shorts;


async function createShorts(req, res) {
  const ShortsValidSchema = Joi.object({
    category: Joi.string().required(),
    uploadType: Joi.string().valid('IMAGE', 'VIDEO'),
    file: Joi.string().required(),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  req.body.category = req.body.category.toLowerCase();
  let modeldataRes = await serviceShorts.saveShorts(req.body);
  if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, CONSTANTS_MSG.SHORTS_CREATE_SUCCESS, modeldataRes.data);
  } else if (modeldataRes.statusCode == 11000) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getFilteredShortsList(req, res) {
  const ShortsValidSchema = Joi.object({
    // status: Joi.string().empty("").valid('ENABLE', 'DISABLE'),
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceShorts.getShortsList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getAllShorts(req, res) {
  let resData = await serviceShorts.getAllShorts();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateShorts(req, res) {
  const ShortsValidSchema = Joi.object({
    id: Joi.string().required(),
    category: Joi.string().required(),
    uploadType: Joi.string().valid('IMAGE', 'VIDEO'),
    file: Joi.string().required(),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceShorts.getShortsById(req.body.id);
  console.log('modelDatamodelDatamodelData', modelData);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.category = req.body.category.toLowerCase();
    modelData.data.uploadType = req.body.uploadType;
    modelData.data.file = req.body.file;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.SHORTS_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deleteShorts(req, res) {
  const ShortsValidSchema = Joi.object({
    id: Joi.string().required()
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceShorts.getShortsById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await serviceShorts.deleteShorts(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.SHORTS_DELETE_SUCCESS);
    } else if (modelDataInner.statusCode === CONSTANTS.ACCESS_DENIED) {
      return apiErrorRes(req, res, CONSTANTS_MSG.UNABLE_DELETE, CONSTANTS.DATA_NULL);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE, CONSTANTS.DATA_NULL);
    }
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function updateShortsStatus(req, res) {
  const ShortsValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateShortsData = ShortsValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateShortsData && validateShortsData.error) {
    return apiErrorRes(req, res, validateShortsData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceShorts.getShortsById(req.body.id);
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
async function getShortsById(req, res) {
  let resData = await serviceShorts.getShortsById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createShorts', createShorts);
router.post('/getAllShorts', getAllShorts);
router.post('/updateShorts', updateShorts);
router.post('/getFilteredShortsList', getFilteredShortsList);
router.post('/deleteShorts', deleteShorts);
router.post('/updateShortsStatus', updateShortsStatus);
router.post('/getShortsById', getShortsById);


module.exports = router;