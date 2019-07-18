const qs = require("querystring");
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const MongoClient = require('mongodb').MongoClient;
const dbName = 'poc';
const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;
let cachedClient = null;

function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri, { useNewUrlParser: true })
    .then(client => {
      cachedClient = client;
      cachedDb = cachedClient.db(dbName);
      return cachedDb;
    });
}


function queryDatabase (db, collection, queryParams = {}) {
  console.log('=> query database:', queryParams);

  return db.collection(collection).find(queryParams).toArray()
    .then(res => { 
      console.log("=> query result:", res);
      return res; 
     })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      return { statusCode: 500, body: 'error' };
    });
}

function addDocument (db, collection, document) {
  console.log('=> adding document to', collection);

  return db.collection(collection).insertOne(document).then( res => {
    console.log(res);
    return { statusCode: 200, body: "inserted doc"}
  })
  .catch(err => {
    console.log('=> an error occurred: ', err);
    return { statusCode: 500, body: 'error' };
  })
}

function getAdjustedResponseDate() {
  var d = new Date();
  if (d.getHours() < 18) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

exports.handler = function(context, event, callback) {
	context.callbackWaitsForEmptyEventLoop = false;

  const formValues = qs.parse(context.body);
  const twiml = new MessagingResponse();

  console.log(formValues);
  var query =  { number : formValues.From };

  connectToDatabase(MONGODB_URI)
    .then(db => queryDatabase(db, 'users', query))
    .then(result => {
      console.log('=> returning result: ', result);
      /* Requires a check to see if result is an empty array */

      if (result.length === 0) {
        /* User is not yet registered */

        twiml.message('Welcome to Reflect. You are now registered and set up with the default questions. Expect to receive a check in from Reflect at the next daily check in time.');

        cachedDb.collection('questions').findOne({user: 'default'}, function (err, defaultQuestions) {
          if (err) {
            console.log('=> error returning result: ', err);
          } else {
            console.log('=> default questions: ', defaultQuestions);
            var newUser = { number: formValues.From, twoFa: '', state: 10000, questions: defaultQuestions.questions };

            cachedDb.collection('users').insertOne(newUser, function (err, response) {
              
              console.log('New User Twilio message sent');
              cachedClient.close();
            });
          }
        });
        
        callback(null, {
          statusCode: 200,
          headers: {"content-type": "text/xml"},
          body: twiml.toString()
        });

      } else {

        var userDoc = result[0];
        var curState = userDoc.state;

        if (curState <= userDoc.questions.length) {
          /* In question ready state */
          twiml.message(JSON.stringify(userDoc.questions[curState].q)); /* Sends twilio message of current question */
          cachedDb.collection('users').updateOne({number : formValues.From}, {$set: { "state" : curState + 1}}); /* Updates the question state */


          if (curState == 1){
            var doc = { number : formValues.From, date: formatDate(getAdjustedResponseDate()), responses : [formValues.Body] }
            cachedDb.collection('responses').insertOne(doc);
          } else {
            cachedDb.collection('responses').updateOne({ number : formValues.From, date: formatDate(getAdjustedResponseDate()) }, { $push: { responses: formValues.Body }});
          }
        } else {
          /* All questions have been responded to for the day */
          twiml.message('All reflections have been posted for today! Please expect a check in from Reflect tomorrow.');
        }

        cachedClient.close()
        callback(null, {
          statusCode: 200,
          headers: {"content-type": "text/xml"},
          body: twiml.toString()
        });
      }

    })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      callback(err);
    });
};
