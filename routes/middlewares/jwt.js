const { expressjwt } = require('express-jwt');
const settings = require('../../config/settings.json');
module.exports = userjwt;

function userjwt() {
    const secret = settings.usersecret;
    return expressjwt({
        isRevoked,
        secret,
        algorithms: ["HS256"],
    }).unless({
        path: [
            { url: "/api/v1/userRegister", methods: ['POST'] },
            { url: "/api/v1/verifyOtp", methods: ['POST'] },
            { url: "/api/v1/login", methods: ['POST'] },
            { url: "/api/v1/forgotPassword", methods: ['POST'] },
            { url: "/api/v1/verifyOtpforgotPassword", methods: ['POST'] },
        ]
    });
}
async function isRevoked(req, payload) {
    const obj = {
        userId: payload.payload.userId
    }
    req['user'] = obj;
    // req.headers['email'] = payload.email;
    // req.headers['chunk'] = payload.chunk;
    return false;
};