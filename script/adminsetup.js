const db = require('../db');

let Admin = db.Admin;

adminCreate= async()=>{
    let data={
        userName:"admin",
        email:"admin@mailinator.com",
        password:"123456",
        isAdmin:true
    }
    let settingData={
        fullName:"NA"
    }
    try {
        let testAdmin = new Admin(data);
        let responnse =  await testAdmin.save();
        console.log("res ",responnse);
        process.exit(0);
    } 
    catch (error) {
        console.log(error);
        process.exit(0);
    }    
}

(async()=>{
   await adminCreate();
})();
