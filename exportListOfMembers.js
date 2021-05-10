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

const usersRef = db.collection('users').where('isAdmin', '==', false);

console.log(`"id","email","initialSignUp"`);
usersRef.get()
  .then((querySnapshop) => {
    querySnapshop.forEach((doc) => {
      console.log(`"${doc.id}","${doc.data().email}","${doc.data().initialSignUp}"`);

    });
  });
