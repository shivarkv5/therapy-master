var jwt = require('jsonwebtoken');
var { google } = require("googleapis")
const key = require('./serviceAccount.json');
const https = require('https');

exports.getDFResult = function(queryRequest, session_id) {

  
  let jwtClient = new google.auth.JWT(
    key.client_email, null, key.private_key,
    ['https://www.googleapis.com/auth/dialogflow'],
    null
  );
  let credentials = jwtClient.authorize();
  return credentials.then((cred) => {
    return new Promise((resolve, reject) => {
      let options = {
        host: 'dialogflow.googleapis.com',
        path: '/v2/projects/firstmd-35f3d/agent/sessions/'+session_id+':detectIntent',
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + cred.access_token
        }
      }
      var req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
          //console.log('--2');
          // console.log(body);
          var jsonBody = JSON.parse(body);
          //console.log(jsonBody)
          resolve(jsonBody);
        });
        res.on('error', (error) => {
          console.log(`Error calling dialogflow API: ${error}`)
          reject(error);
        });
      });
      req.write(JSON.stringify(queryRequest));
      req.end();
    });
  });
  // });

}
// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
// exports.getDFResult('session1','hello').then(function(result){
// console.log(result);
// });