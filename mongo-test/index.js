"use strict";
const MongoClient = require('mongodb').MongoClient;
const dbName = 'poc';
const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;


function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri)
    .then(client => {
      cachedDb = client.db(dbName);
      return cachedDb;
    });
}


function queryDatabase (db, collection) {
  console.log('=> query database');

  return db.collection(collection).find({}).toArray()
    .then(res => { 
      console.log(res);
      return { statusCode: 200, body: JSON.stringify(res)}; 
      })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      return { statusCode: 500, body: 'error' };
    });
}

module.exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('event: ', event);

  connectToDatabase(MONGODB_URI)
    .then(db => queryDatabase(db, 'users'))
    .then(result => {
      console.log('=> returning result: ', result);
      callback(null, result);
    })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      callback(err);
    });
};