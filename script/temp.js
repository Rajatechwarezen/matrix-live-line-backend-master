// const bcrypt = require('bcrypt')
// bcrypt.compare('kuberpe_admin_toke', '$2a$10$cFxpqdkfrZWdrEPIbFZ2LO.Ay9DpsEby9Udh7gJsHfgMtjNpl5dxq').then((result) => {
//   // result == true
//   console.log('result_____', result);
// }).catch(err => console.log('Error______', err));



// var axios = require('axios');
// var data = '{\n    "reference_id": "ea3c1fe5-d7c7-45a2-939d-1791204ac85c",\n    "consent": true,\n    "purpose": "for bank account verification",\n    "aadhaar_number": "898989898989"\n}';

// var config = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: 'https://in.decentro.tech/v2/kyc/aadhaar/otp',
//   headers: {
//     'client_id': 'kuberpe_Prod',
//     'client_secret': 'N9olyH6e2cs55iqGwWkysosIlS0BDWnI',
//     'module_secret': 'tkHW7K3TQp3oLQppR48fuiajZATk4pAG'
//   },
//   data: data
// };

// axios(config)
//   .then(function (response) {
//     console.log("***********", JSON.stringify(response.data));
//   })
//   .catch(function (error) {
//     console.log("##########", error);
//   });







const axios = require('axios');
let data = JSON.stringify({
  "reference_id": "9",
  "consent": true,
  "purpose": "for bank account verification",
  "aadhaar_number": "410736576260"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://in.staging.decentro.tech/v2/kyc/aadhaar/otp',
  headers: {
    'client_id': 'kuberpetested',
    'client_secret': 'y6iQ9BGEzosqWQ3ooeFD5gXDmaYSDM5c',
    'module_secret': 'm6AypJ6IDc2YkdMvITQcYskjSpU2Wznf',
    'Content-Type': 'application/json'
  },
  data: data
};

axios.request(config)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
