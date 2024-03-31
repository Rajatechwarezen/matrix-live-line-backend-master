const mongoose = require('mongoose');
const settings = require('../config/settings.json')
mongoose.connect(settings.mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
module.exports = {
    Admin: require('./models/Admin'),
    User: require('./models/User'),
    Shorts: require('./models/Shorts'),
    LiveUpdate: require('./models/LiveUpdate'),
    EventOption: require('./models/EventOption'),
    Kyc: require('./models/Kyc'),
    Slider: require('./models/Slider'),
    Blog: require('./models/Blog'),
    DeviceId: require('./models/DeviceId'),
    Poll: require('./models/Poll'),
    PollOption: require('./models/PollOption'),
    PollAnswer: require('./models/PollAnswer'),
    Agent: require('./models/Agent'),
    LoginHistory: require('./models/LoginHistory'),
};