const express = require('express');
const router = express.Router();
const Joi = require('joi');
const globalFunction = require('../../utils/globalFunction');
const serviceBlog = require('../services/serviceBlog');
const CONSTANTS = require('../../utils/constants');
const CONSTANTS_MSG = require('../../utils/constantsMessage');
const apiSuccessRes = globalFunction.apiSuccessRes;
const apiErrorRes = globalFunction.apiErrorRes;


async function createBlog(req, res) {
  const userValidSchema = Joi.object({
    title: Joi.string().required(),
    desc: Joi.string().required(),
    image: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceBlog.getBlogByTitle(req.body.title);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST, CONSTANTS.DATA_NULL);
  } else if (modelData.statusCode === CONSTANTS.SUCCESS) {
    return apiErrorRes(req, res, CONSTANTS_MSG.ALREADY_EXIST);
  } else if (modelData.data == null) {
    let modeldataRes = await serviceBlog.saveBlog(req.body);
    if (modeldataRes.statusCode == CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.BLOG_CREATE_SUCCESS, modeldataRes.data);
    } else if (modeldataRes.statusCode == 11000) {
      return apiErrorRes(req, res, CONSTANTS_MSG.Blog_ALREADY_EXIST);
    } else {
      return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
    }
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
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

async function getAllBlog(req, res) {
  let resData = await serviceBlog.getAllBlog();
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', []);
  }
}

async function updateBlog(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    desc: Joi.string().required(),
    image: Joi.string(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceBlog.getBlogById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    modelData.data.title = req.body.title;
    modelData.data.desc = req.body.desc;
    modelData.data.image = req.body.image;
    await modelData.data.save();
    return apiSuccessRes(req, res, CONSTANTS_MSG.BLOG_UPDATE_SUCCESS, modelData.data);
  } else if (modelData.statusCode === CONSTANTS.NOT_FOUND) {
    return apiErrorRes(req, res, CONSTANTS_MSG.NOT_FOUND);
  } else {
    return apiErrorRes(req, res, CONSTANTS_MSG.FAILURE);
  }
}

async function deleteBlog(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceBlog.getBlogById(req.body.id);
  if (modelData.statusCode === CONSTANTS.SUCCESS) {
    let modelDataInner = await serviceBlog.deleteBlog(req.body.id);
    if (modelDataInner.statusCode === CONSTANTS.SUCCESS) {
      return apiSuccessRes(req, res, CONSTANTS_MSG.BLOG_DELETE_SUCCESS);
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

async function updateBlogStatus(req, res) {
  const userValidSchema = Joi.object({
    id: Joi.string().required(),
  })
  const validateUserData = userValidSchema.validate(req.body, {
    abortEarly: true
  })
  if (validateUserData && validateUserData.error) {
    return apiErrorRes(req, res, validateUserData.error.details[0].message.replace(/\"/g, ""), CONSTANTS.DATA_NULL);
  }
  let modelData = await serviceBlog.getBlogById(req.body.id);
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
async function getBlogById(req, res) {
  let resData = await serviceBlog.getBlogById(req.body.id);
  if (resData.statusCode === CONSTANTS.SUCCESS) {
    return apiSuccessRes(req, res, 'Success', resData.data);
  } else {
    return apiErrorRes(req, res, 'Not found.', {});
  }
}





router.post('/createBlog', createBlog);
router.get('/getAllBlog', getAllBlog);
router.post('/updateBlog', updateBlog);
router.post('/getBlogList', getBlogList);
router.post('/deleteBlog', deleteBlog);
router.post('/updateBlogStatus', updateBlogStatus);
router.post('/getBlogById', getBlogById);


module.exports = router;