#!/usr/bin/env node

var serviceAccount = require("./_firebase-service-account-key.json");
var otherSecrets  = require("./_other-secrets.json");

require('dotenv').config(); //loads the secrets set in the .env file, into process.env
const fs = require('fs');
const csv = require('csv-parser');
const firebase = require('firebase');
const admin = require("firebase-admin");

firebase.initializeApp({
  projectId: process.env.PROJECTID,
  apiKey: process.env.APIKEY
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: otherSecrets.database_url
});

//const db = firebase.firestore();
const db = admin.firestore();


let counter = 0;

fs.createReadStream('_updateList.csv')
  .pipe(csv())
  .on('data', async (row) => {
    //console.log(row.initialSignUp);

    const tmpDateParts = row.initialSignUp.split('-');

    const dateYYYY = tmpDateParts[0];

    const dateMM = tmpDateParts[2];
    const dateDD = tmpDateParts[1];

    const dateString = `${dateYYYY}-${dateMM}-${dateDD}`; 

    console.log(`${row.initialSignUp} updated to ${dateString} for user ${row.id}\n`);

    const usersRef = db.collection('users');
    setDoc = await usersRef.doc(row.id).update({
      initialSignUp: dateString,
    });

    counter++;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

console.log('please wait while the users are updated...');



