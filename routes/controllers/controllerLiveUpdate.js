const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const serviceLiveUpdate = require('../services/serviceLiveUpdate');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;

// async function createLiveUpdate(req, res) {
//   const LiveUpdateValidSchema = Joi.object({
//     matchId: Joi.string().required(),
//     matchUpdate: Joi.string().required(),
//   })
//   const validateLiveUpdateData = LiveUpdateValidSchema.validate(req.body, {
//     abortEarly: true
//   })
//   if (validateLiveUpdateData && validateLiveUpdateData.error) {
//     return apiErrorRes(req, res, validateLiveUpdateData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
//   }
//   req.body.category = req.body.category.toLowerCase();
//   let modeldataRes = await serviceLiveUpdate.saveLiveUpdate(req.body);
//   if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
//     return apiSuccessRes(req, res, CONSTANTS_MSG.LIVE_UPDATE_CREATE_SUCCESS, modeldataRes.data);
//   } else if (modeldataRes.statusCode == 11000) {
//     return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST);
//   } else {
//     return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
//   }
// }

async function getFilteredLiveUpdateList(req, res) {
  const LiveUpdateValidSchema = Joi.object({
    // status: Joi.string().empty("").valid('ENABLE', 'DISABLE'),
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateLiveUpdateData = LiveUpdateValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateLiveUpdateData && validateLiveUpdateData.error) {
    return apiErrorRes(req, res, validateLiveUpdateData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceLiveUpdate.getLiveUpdateList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getAllLiveUpdate(req, res) {
  let resData = await serviceLiveUpdate.getAllLiveUpdate();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateLiveUpdate(req, res) {
  const LiveUpdateValidSchema = Joi.object({
    id: Joi.string().required(),
    matchUpdate: Joi.string().required(),
  })
  const validateLiveUpdateData = LiveUpdateValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateLiveUpdateData && validateLiveUpdateData.error) {
    return apiErrorRes(req, res, validateLiveUpdateData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceLiveUpdate.getLiveUpdateById(req.body.id);
  console.log('modelDatamodelDatamodelData', modelData);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.matchUpdate = req.body.matchUpdate;
    modelData.data.updatedAt = Date.now();
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.LIVE_UPDATE_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deleteLiveUpdate(req, res) {
  const LiveUpdateValidSchema = Joi.object({
    id: Joi.string().required()
  })
  const validateLiveUpdateData = LiveUpdateValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateLiveUpdateData && validateLiveUpdateData.error) {
    return apiErrorRes(req, res, validateLiveUpdateData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceLiveUpdate.getLiveUpdateById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await serviceLiveUpdate.deleteLiveUpdate(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.LIVE_UPDATE_DELETE_SUCCESS);
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

async function updateLiveUpdateStatus(req, res) {
  const LiveUpdateValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateLiveUpdateData = LiveUpdateValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateLiveUpdateData && validateLiveUpdateData.error) {
    return apiErrorRes(req, res, validateLiveUpdateData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceLiveUpdate.getLiveUpdateById(req.body.id);
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
async function getLiveUpdateById(req, res) {
  let resData = await serviceLiveUpdate.getLiveUpdateById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





// router.post('/createLiveUpdate', createLiveUpdate);
router.post('/getAllLiveUpdate', getAllLiveUpdate);
router.post('/updateLiveUpdate', updateLiveUpdate);
router.post('/getFilteredLiveUpdateList', getFilteredLiveUpdateList);
router.post('/deleteLiveUpdate', deleteLiveUpdate);
router.post('/updateLiveUpdateStatus', updateLiveUpdateStatus);
router.post('/getLiveUpdateById', getLiveUpdateById);


module.exports = router;