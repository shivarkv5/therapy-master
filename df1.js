var jwt = require('jsonwebtoken');
var { google } = require("googleapis")
const key = require('./serviceAccount.json');
const https = require('https');

exports.getDFResult = async function(phone, session_id, user_query) {

  let query = {
    query_input: {
      text: {
        text: user_query,
        language_code: 'en-US'
      }
    },
    query_params:{
      payload:{
        data: {
            From: phone
        },
        telephony: {
          caller_id: phone
        }
      }
    }
  }

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
        path: '/v2/projects/therapybot-rjkwcd/agent/sessions/'+session_id+':detectIntent',
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
          // console.log("=> DF response body: ", body);
          var jsonBody = JSON.parse(body);
          resolve(jsonBody.queryResult);
        });
        res.on('error', (error) => {
          // console.log(`Error calling dialogflow API: ${error}`)
          reject(error);
        });
      });
      req.write(JSON.stringify(query));
      req.end();
    });
  });
  // });

}
 console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
exports.getDFResult('+14084718676','session1','It has been botherming. I have a love failure problem').then(function(result){
    console.log(result);
});