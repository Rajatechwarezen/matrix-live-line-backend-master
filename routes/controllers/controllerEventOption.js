const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const jwt = require('jsonwebtoken');
const serviceEventOption = require('../services/serviceEventOption');
// const serviceEvent = require('../services/serviceEvent');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function createEventOption(req, res) {
  const EventOptionValidSchema = Joi.object({
    eventId: Joi.string().required(),
    option: Joi.string().required().valid("YES", "NO"),
    price: Joi.string().required(),
    quantity: Joi.number().required(),
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceEvent.getEventById(req.body.eventId);
  if (modelData.statusCode === CONSTANTS.SUCCESS && modelData.data.isDisable == true) {
    return apiErrorRes(req, res, CONSTANTS_MSG.EVENT_END, CONSTANTS.DATA_NULL);
  } else if (modelData.statusCode == CONSTANTS.SUCCESS) {
    let modeldataInnerData = await serviceEventOption.getEventOptionByPrice(req.body);
    console.log('modeldataInnerData________', modeldataInnerData);
    if (modeldataInnerData.statusCode === CONSTANTS.SUCCESS) {
      return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST, CONSTANTS.DATA_NULL);
    } else if (modeldataInnerData.statusCode === CONSTANTS.NOT_FOUND) {
      let modeldataRes = await serviceEventOption.saveEventOption(req.body);
      if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
        return apiSuccessRes(req, res, CONSTANTS_MSG.EVENT_OPTION_CREATE_SUCCESS, modeldataRes.data);
      } else if (modeldataRes.statusCode == 11000) {
        return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST);
      } else {
        return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
      }
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }

  } else if (modelData.statusCode == CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND, CONSTANTS.DATA_NULL);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function getEventOptionListByEventId(req, res) {
  const EventOptionValidSchema = Joi.object({
    eventId: Joi.string().required(),
    option: Joi.string().valid("YES", "NO", null, ""),
    keyWord: Joi.string().empty(""),
    pageNo: Joi.number().integer().min(1),
    size: Joi.number().integer().min(1),
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceEventOption.getEventOptionList(req.body);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function getAllEventOptionByEventId(req, res) {
  const EventOptionValidSchema = Joi.object({
    eventId: Joi.string().required(),
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let resData = await serviceEventOption.getAllEventOptionByEventId(req.body.eventId);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateEventOption(req, res) {
  const EventOptionValidSchema = Joi.object({
    id: Joi.string().required(),
    eventId: Joi.string().required(),
    option: Joi.string().required().valid("YES", "NO"),
    price: Joi.string().required(),
    quantity: Joi.number().required(),
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceEventOption.getEventOptionById(req.body.id);
  console.log('modelDatamodelDatamodelData', modelData);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.eventId = req.body.eventId;
    modelData.data.option = req.body.option;
    modelData.data.price = req.body.price;
    modelData.data.quantity = req.body.quantity;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.EVENT_OPTION_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deleteEventOption(req, res) {
  const EventOptionValidSchema = Joi.object({
    id: Joi.string().required()
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceEventOption.getEventOptionById(req.body.id);
  console.log('modelData_____', modelData);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await serviceEventOption.deleteEventOption(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.EVENT_OPTION_DELETE_SUCCESS);
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

async function updateEventOptionStatus(req, res) {
  const EventOptionValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateEventOptionData = EventOptionValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateEventOptionData && validateEventOptionData.error) {
    return apiErrorRes(req, res, validateEventOptionData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceEventOption.getEventOptionById(req.body.id);
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
async function getEventOptionById(req, res) {
  let resData = await serviceEventOption.getEventOptionById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createEventOption', createEventOption);
router.post('/getAllEventOptionByEventId', getAllEventOptionByEventId);
router.post('/updateEventOption', updateEventOption);
router.post('/getEventOptionListByEventId', getEventOptionListByEventId);
router.post('/deleteEventOption', deleteEventOption);
router.post('/updateEventOptionStatus', updateEventOptionStatus);
router.post('/getEventOptionById', getEventOptionById);


module.exports = router;