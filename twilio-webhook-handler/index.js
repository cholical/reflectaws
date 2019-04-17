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
  console.log('=> query database', queryParams);

  return db.collection(collection).find(queryParams).toArray()
    .then(res => { 
      console.log("=> query result", res);
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
      var userDoc = result[0];
      var curState = userDoc.state;
      
      if(curState < userDoc.questions.length){
        twiml.message(JSON.stringify(userDoc.questions[curState]));
        cachedDb.collection('users').updateOne({number : formValues.From}, {$set: { "state" : curState + 1}});
        if(curState == 0){
          var doc = { number : formValues.From, responses : [formValues.Body]}
          cachedDb.collection('responses').insertOne(doc);
        } else {
          cachedDb.collection('responses').updateOne({number : formValues.From}, { $push: { responses: formValues.Body }});
        }
      }
      


      cachedClient.close()
      
      callback(null, {
		    statusCode: 200,
		    headers: {"content-type": "text/xml"},
		    body: twiml.toString()
		  });

    })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      callback(err);
    });
};
