const MongoClient = require('mongodb');
const serverless = require('serverless-http');
const express = require('express');
const caBundle = require('./certs/rds-combined-ca-bundle.js');


const app = express();
let cachedDb = null;

app.get('/', (req, res) => {
    var client = connectToDatabase();
    var user = { phone: 7043346633 }
    
    client.collection("users").insertOne(user, (err, res) => {
      if(err) throw err;
      console.log("User added");
      res.send('User Added');
      db.close;
    });
  })
  
module.exports.handler = serverless(app);

function connectToDatabase() {
    if (cachedDb) {
        return Promise.resolve(cachedDb);
    }
    console.log("Connecting to client...");

    return MongoClient.connect(
        process.env.MONGODB_URI,
        { ssl: true, sslCA: caBundle, useNewUrlParser: true}
    ).then((err, db) => {
        if(err) throw err;
        cachedDb = db;
        console.log("Mongo Connected");
        return cachedDb;
    });
}