const asyncRedis = require("async-redis");

const client = asyncRedis.createClient();
const global_fun = require('../../utils/globalFunction'),
    CONSTANTS = require('../../utils/constants');
let resultdb = global_fun.resultdb;

let getKey = async (key) => {
    try {
        const value = await client.get(key.toString());
        if (value === null) {
            return resultdb(CONSTANTS.NOT_FOUND)
        } else {
            return resultdb(CONSTANTS.SUCCESS, value)
        }

    } catch (error) {
        console.error("Unable to get key from redis, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let setKey = async (key, value) => {
    try {
        await client.set(key, value, 'EX', 60 * 10);
        return resultdb(CONSTANTS.SUCCESS)
    } catch (error) {
        console.error("Unable to set key in redis, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let setKeyNoTime = async (key, value) => {
    try {
        await client.set(key, value);
        return resultdb(CONSTANTS.SUCCESS)
    } catch (error) {
        console.error("Unable to set key no time in redis, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let setKeyWithTime = async (key, value, time = 5) => {
    try {
        await client.set(key, value, 'EX', 60 * time);
        return resultdb(CONSTANTS.SUCCESS)
    } catch (error) {
        console.log(error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
let removeKey = async (key) => {
    try {
        const value = await client.del(key.toString());
        if (value === null) {
            return resultdb(CONSTANTS.NOT_FOUND)
        } else {
            return resultdb(CONSTANTS.SUCCESS, value)
        }

    } catch (error) {
        console.error("Unable to remove key in redis, Query", error);
        return resultdb(CONSTANTS.SERVER_ERROR, CONSTANTS.DATA_NULL)
    }
};
module.exports = {
    getKey,
    setKeyNoTime,
    removeKey,
    setKeyWithTime,
    setKey
};