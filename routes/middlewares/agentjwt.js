const { expressjwt } = require('express-jwt');
const settings = require('../../config/settings.json');
module.exports = agentjwt;

function agentjwt() {
    const secret = settings.agentsecret;
    return expressjwt({
        isRevoked,
        secret,
        algorithms: ["HS256"],
    }).unless({
        path: [
            { url: "/api/dadmin/agentLogin", methods: ['POST'] },
        ]
    });
}
async function isRevoked(req, payload) {
    const obj = {
        mobile: payload.payload.mobile
    }
    req['user'] = obj;
    return false;
};