let express = require('express'),
    settings = require('./config/settings.json'),
    cors = require('cors');

const adminjwt = require('./routes/middlewares/adminjwt'),
    userjwt = require('./routes/middlewares/jwt'),
    errorHandler = require('./utils/errorHandler');
const path = require('path');
const dir = path.join(__dirname, '/upload');

let {
    controllerAdmin,
    controllerShorts,
    controllerEventOption,
    controllerClient,
    controllerLiveUpdate,
    controllerSlider,
    controllerPoll,
    controllerBlog,
    controllerPollOption,
    controllerAgent
} = require('./routes');
const app = express();
app.use("/upload", express.static(dir));
app.use(cors());
app.use(express.json({ limit: '400mb' }));
app.use(express.urlencoded({ extended: true, limit: '400mb' }));

// app.use(jwt());
app.use("/api/v1", userjwt(), controllerClient);

app.use("/api/agent", controllerAgent);
app.use("/api/dadmin", adminjwt(), controllerPollOption);
app.use("/api/dadmin", adminjwt(), controllerPoll);
app.use("/api/dadmin", adminjwt(), controllerSlider);
app.use("/api/dadmin", adminjwt(), controllerBlog);
app.use("/api/dadmin", adminjwt(), controllerAdmin);
app.use("/api/dadmin", adminjwt(), controllerShorts);
app.use("/api/dadmin", adminjwt(), controllerLiveUpdate);
app.use("/api/dadmin", adminjwt(), controllerEventOption);

app.use(errorHandler);
app.listen(settings.port, '0.0.0.0', function () {
    console.log('Server running on port ' + settings.port);
});