const qs = require("querystring");
const MessagingResponse = require('twilio').twiml.MessagingResponse;

exports.handler = function(context, event, callback) {
  const twiml = new MessagingResponse();
  const formValues = qs.parse(context.body);

  twiml.message('you said: ' + formValues.Body);

  callback(null, {
    statusCode: 200,
    headers: {"content-type": "text/xml"},
    body: twiml.toString()
  });
};
