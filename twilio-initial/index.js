// const twilio = require('twilio')(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// const service = twilio.notify.services(process.env.TWILIO_NOTIFY_SERVICE_SID);
// const MongoClient = require('mongodb').MongoClient;
// const dbName = 'poc';
// const MONGODB_URI = process.env.MONGODB_URI;

// let cachedDb = null;
// let cachedClient = null;

// function connectToDatabase (uri) {
//   console.log('=> connect to database');

//   if (cachedDb && cachedDb.serverConfig.isConnected()) {
//     console.log('=> using cached database instance');
//     return Promise.resolve(cachedDb);
//   }

//   return MongoClient.connect(uri, { useNewUrlParser: true })
//     .then(client => {
//       cachedClient = client;
//       cachedDb = cachedClient.db(dbName);
//       return cachedDb;
//     });
// }


// function queryDatabase (db, collection, queryParams = {}) {
//   console.log('=> query database:', queryParams);

//   return db.collection(collection).find(queryParams).toArray()
//     .then(res => { 
//       console.log("=> query result:", res);
//       return res; 
//      })
//     .catch(err => {
//       console.log('=> an error occurred: ', err);
//       return { statusCode: 500, body: 'error' };
//     });
// }

// function addDocument (db, collection, document) {
//   console.log('=> adding document to', collection);

//   return db.collection(collection).insertOne(document).then( res => {
//     console.log(res);
//     return { statusCode: 200, body: "inserted doc"}
//   })
//   .catch(err => {
//     console.log('=> an error occurred: ', err);
//     return { statusCode: 500, body: 'error' };
//   })
// }

const twilio = require('twilio')('AC85863d0f33921d924277c72a096e0689', '3e4b58fd99c59e1d8e5023bd369cb440');


exports.handler = function(event, context, callback) {
  

  const numbers = ['+19194577058'];
  const body = 'Test Twilio Initial Message';

  const bindings = numbers.map(number => {
    return JSON.stringify({ binding_type: 'sms', address: number });
  });

  console.log('=> bindings: ', bindings);

    const service = twilio.notify.services('IS3576ea44c8386d3babaa5eed28ad5602');

    console.log('=> creating notification');
    service.notifications
      .create({
        toBinding: bindings,
        body: body
      })
      .then(() => {
        console.log('Messages sent!');
        callback(null, 'success msg')
      })
      .catch(err => {
        console.error(err);
        callback(new Error('failure'))
      })
      .done();

}

// exports.handler = function(context, event, callback) {
// 	context.callbackWaitsForEmptyEventLoop = false;

//   connectToDatabase(MONGODB_URI)
//     .then(db => queryDatabase(db, 'users', {}))
//     .then(result => {
//       console.log('=> returning result: ', result);

//       const numbers = ['+19194577058'];
//       const body = 'Test Twilio Initial Message';
      
//       console.log('Point A');

//       const bindings = numbers.map(number => {
//         return JSON.stringify({ binding_type: 'sms', address: number });
//       });

//       console.log('bindings: ', bindings);

//       console.log('Point B');

//       service.notifications
//       .create({
//         toBinding: bindings,
//         body: body
//       })
//       .then(() => {
//         console.log('Messages sent!');
//       })
//       .catch(err => {
//         console.error(err);
//       })
//       .done();


//     })
//     .catch(err => {
//       console.log('=> an error occurred: ', err);
//       callback(err);
//     });
// };
