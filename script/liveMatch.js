const db = require('../db');
const settings = require('../config/settings.json');
const axios = require('axios');
const cron = require('node-cron');

let LiveUpdate = db.LiveUpdate;

cron.schedule('* * * * * *', () => {
    // axios.get(`http://172.105.48.215/apiv4/upcomingMatches/${settings.Match_Api_Key}`)
    axios.get(`http://172.105.48.215/apiv4/liveMatchList/${settings.Match_Api_Key}`)
        .then(async (data) => {
            const respArr = data.data.data;
            // const respArr = [{
            //     "matchId": "105",
            //     // "matchUpdate": "6",
            // },

            // {
            //     "matchId": "106",
            //     // "matchUpdate": "0",
            // }]
            if (respArr.length > 0) {
                console.log('respArr_________', respArr);
                for (let index = 0; index < respArr.length; index++) {
                    const element = respArr[index];
                    const saveObj = {
                        matchId: element.match_id,
                        matchData: element
                    }

                    const update = { $set: saveObj };
                    const filter = { matchId: element.match_id };
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    LiveUpdate.findOneAndUpdate(filter, update, options)
                        .then((resp) => {
                            console.log('resp_____', resp);
                        })
                        .catch((err) => {
                            console.log('err_____', err);
                        })

                }
            } else {
                console.log('________', data.data);
                // return apiErrorRes(req, res, 'Not found.', []);
            }
        })
        .catch((err) => {
            console.log('**********', err);
            // return apiErrorRes(req, res, 'Error While Hit Api', null);
        })
});



// liveMatch = async () => {
//     axios.get(`http://172.105.48.215/apiv4/upcomingMatches/${settings.Match_Api_Key}`)
//         // axios.get(`http://172.105.48.215/apiv4/liveMatchList/${settings.Match_Api_Key}`)
//         .then(async (data) => {
//             // const respArr = data.data.data;
//             const respArr = [{
//                 "matchId": "100",
//                 "matchUpdate": "6",
//             },

//             {
//                 "matchId": "102",
//                 "matchUpdate": "0",
//             }]
//             if (respArr.length > 0) {

//                 console.log('respArr_________', respArr);
//                 for (let index = 0; index < respArr.length; index++) {
//                     const element = respArr[index];
//                     const update = { $set: element };
//                     const filter = { matchId: element.matchId };
//                     const options = { upsert: true, new: true, setDefaultsOnInsert: true };
//                     LiveUpdate.findOneAndUpdate(filter, update, options)
//                         .then((resp) => {
//                             console.log('resp_____', resp);
//                         })
//                         .catch((err) => {
//                             console.log('err_____', err);
//                         })

//                 }



//                 // Unique identifier to find the document

//                 let resData = respArr.slice(startIndex, endIndex);
//                 console.log('resData________', resData);
//                 // return apiSuccessRes(req, res, CONSTANTS_MSG.SUCCESS, resData);
//             } else {
//                 console.log('________', data.data);
//                 // return apiErrorRes(req, res, 'Not found.', []);
//             }
//         })
//         .catch((err) => {
//             console.log('**********', err);
//             // return apiErrorRes(req, res, 'Error While Hit Api', null);
//         })
//     // try {
//     //     let testLiveUpdate = new LiveUpdate(data);
//     //     let responnse = await testLiveUpdate.save();
//     //     console.log("res ", responnse);
//     //     process.exit(0);
//     // }
//     // catch (error) {
//     //     console.log(error);
//     //     process.exit(0);
//     // }
// }


