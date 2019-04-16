const qs = require("querystring");
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const MongoClient = require('mongodb').MongoClient;
const dbName = 'poc';
const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;
let cachedClient = null;

function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri, { useNewUrlParser: true })
    .then(client => {
      cachedDb = client.db(dbName);
      cachedClient = client;
      return cachedDb;
    });
}


function queryDatabase (db, collection, queryParams = {}) {
  console.log('=> query database', queryParams);

  return db.collection(collection).find(queryParams).toArray()
    .then(res => { 
      console.log("=> query result", res);
      return { statusCode: 200, body: JSON.stringify(res)}; 
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

  connectToDatabase(MONGODB_URI)
    .then(db => queryDatabase(db, 'users'))
    .then(result => {
      console.log('=> returning result: ', result);

      cachedClient.close();
      twiml.message(JSON.stringify(result));
      
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
