const db = require('../db');

let Agent = db.Agent;

agentCreate = async () => {
    let data = {
        userName: "agent",
        mobile: "9898989898",
        password: "123456",
        isAgent: true
    }
    let settingData = {
        fullName: "NA"
    }
    try {
        let testAgent = new Agent(data);
        let responnse = await testAgent.save();
        console.log("res ", responnse);
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        process.exit(0);
    }
}

(async () => {
    await agentCreate();
})();
