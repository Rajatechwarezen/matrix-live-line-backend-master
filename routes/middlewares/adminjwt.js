const { expressjwt } = require('express-jwt');
const settings = require('../../config/settings.json');
module.exports = adminjwt;

function adminjwt() {
    const secret = settings.adminsecret;
    return expressjwt({
        isRevoked,
        secret,
        algorithms: ["HS256"],
    }).unless({
        path: [
            { url: "/api/dadmin/adminLogin", methods: ['POST'] },
            { url: "/api/dadmin/changePassword", methods: ['POST'] },
            { url: "/api/v1/userRegister", methods: ['POST'] },
            { url: "/api/v1/userLogin", methods: ['POST'] },



        ]
    });
}
async function isRevoked(req, payload) {
    const obj = {
        userName: payload.payload.userName
    }
    req['user'] = obj;
    // req.headers['email'] = payload.email;
    // req.headers['chunk'] = payload.chunk;
    return false;
};