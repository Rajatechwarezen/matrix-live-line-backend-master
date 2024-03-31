const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const serviceSlider = require('../services/serviceSlider');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function createSlider(req, res) {
  const userValidSchema = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().required(),
    image: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceSlider.getSliderByName(req.body.name);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST, CONSTANTS.DATA_NULL);
  } else if (modelData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST);
  } else if (modelData.data == null) {
    let modeldataRes = await serviceSlider.saveSlider(req.body);
    if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.SLIDER_CREATE_SUCCESS, modeldataRes.data);
    } else if (modeldataRes.statusCode == 11000) {
      return apiErrorRes(req, res, CONSTANTS_MSG.Slider_ALREADY_EXIST);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getSliderList(req, res) {
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
  let resData = await serviceSlider.getSliderList(req.body);

  if (resData.statusCode === CONSTANTS.SUCCESS) {

    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getAllSlider(req, res) {
  let resData = await serviceSlider.getAllSlider();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateSlider(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    image: Joi.string(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceSlider.getSliderById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.name = req.body.name;
    modelData.data.url = req.body.url;
    modelData.data.image = req.body.image;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.SLIDER_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deleteSlider(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceSlider.getSliderById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await serviceSlider.deleteSlider(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.SLIDER_DELETE_SUCCESS);
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

async function updateSliderStatus(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceSlider.getSliderById(req.body.id);
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
async function getSliderById(req, res) {
  let resData = await serviceSlider.getSliderById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createSlider', createSlider);
router.get('/getAllSlider', getAllSlider);
router.post('/updateSlider', updateSlider);
router.post('/getSliderList', getSliderList);
router.post('/deleteSlider', deleteSlider);
router.post('/updateSliderStatus', updateSliderStatus);
router.post('/getSliderById', getSliderById);


module.exports = router;