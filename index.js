#!/usr/bin/env node

var serviceAccount = require("./_firebase-service-account-key.json");

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

fs.createReadStream('_gEditMembers.csv')
  .pipe(csv())
  .on('data', async (row) => {
    //console.log(`${counter.toString()}.  ${row.firstname} ${row.lastname} <${row.email}>`);
    //insert the user object into the db


    const strPhotoURL = 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png';



    //create the new user
    const createUserResult = await admin.auth().createUser({
      email: row.email,
      emailVerified: false,
      password: '',
      displayName: row.firstname + " " + row.lastname,
      photoURL: strPhotoURL,
      disabled: false
    })
      .then(async (userRecord) => {
        //console.log(`userRecord is this: ${userRecord}`);
        if (userRecord) {
          //user creation wroked
          userID = userRecord.uid;
          console.log("Successfully created new user: " + userID);


          // derive phone number from multiple fields
          const phoneNumber = (row.phone) ? row.phone : row.custom.businessphone_number;

          // derive country  from multiple fields
          let currentCountry = '';
          if (custom.business_location.country) {
            currentCountry = custom.business_location.country;
          }
          else if (custom.iahsp_country) {
            currentCountry = custom.iahsp_country;
          }
          else if (custom.iahsp_location) {
            currentCountry = custom.iahsp_location;
          }

          // normalize the date
          tmpDateParts = row.membership_expires.split('/');

          let dateYYYY = '';
          if (tmpDateParts[2].length <= 2) {
            dateYYYY = `20${tmpDateParts[2]}`;
          } else {
            dateYYYY = tmpDateParts[2];
          }

          const dateMM = tmpDateParts[0];
          const dateDD = tmpDateParts[1];

          const dateString = `${dateYYYY}-${dateMM}-${dateDD}`; 

          // normalize the dob
          tmpDateParts = row.membership_expires.split('/');

          let dateYYYY = '';
          if (tmpDateParts[2].length <= 2) {
            dateYYYY = `20${tmpDateParts[2]}`;
          } else {
            dateYYYY = tmpDateParts[2];
          }

          const dateMM = tmpDateParts[0];
          const dateDD = tmpDateParts[1];

          const dateString = `${dateYYYY}-${dateMM}-${dateDD}`; 

          // derive business name
          // organisation/custom.business_name/company/custom.iahsp_organisation_name
          let currentBusinessName = '';
          if (row.organisation) {
            currentBusinessName = row.organisation;
          }
          else if (row.custom.business_name) {
            currentBusinessName = row.custom.business_name;
          }
          else if (row.company) {
            currentBusinessName = row.company;
          }
          else if (row.custom.iahsp_organisation_name) {
            currentBusinessName = row.custom.iahsp_organisation_name;
          }

          // derive business email
          let currentBusinessEmail = row.email;
          if (row.custom.business_email) {
            currentBusinessEmail = row.custom.business_email;
          }
          else if (row.custom.iahsp_email) {
            currentBusinessEmail = row.custom.iahsp_email;
          }

          // derive urls
          let urlWeb = '';
          let urlLinkedIn = '';
          let urlFacebook = '';
          let urlInstagram = '';
          let urlPinterest = '';

          if (custom.business_website) {
            urlWeb = custom.business_website;
          }
          else if (custom.iahsp_website) {
            urlWeb = custom.iahsp_website;
          }

          if (custom.business_linkedin) {
            urlLinkedIn = custom.business_linkedin;
          }
          else if (custom.iahsp_linkedin) {
            urlLinkedIn = custom.iahsp_linkedin;
          }

          if (custom.business_facebook) {
            urlFacebook = custom.business_facebook;
          }
          else if (custom.iahsp_facebook) {
            urlFacebook = custom.iahsp_facebook;
          }

          if (custom.business_instagram) {
            urlInstagram = custom.business_instagram;
          }
          else if (custom.iahsp_instagram) {
            urlInstagram = custom.iahsp_instagram;
          }

          if (custom.business_pinterest) {
            urlPinterest = custom.business_pinterest;
          }
          else if (custom.iahsp_pinterest) {
            urlPinterest = custom.iahsp_pinterest;
          }






          const usersRef = db.collection('users');
          setDoc = await usersRef.doc(userRecord.uid).set({
            displayName: userRecord.displayName,
            email: userRecord.email,
            photoURL : strPhotoURL,

            // Additional meta.
            milliToken: Date.now().toString(),
            photosWorkExampleCount: 0,
            firstName: row.firstname,
            lastName: row.lastname,
            phone: phoneNumber,
            vatNumber: row.custom.vat_number,
            address1: row.custom.business_location.line1,
            address2: row.custom.business_location.line2,
            city: row.custom.business_location.city,
            zip: row.custom.business_location.postcode,
            countryCustom: currentCountry,
            country: currentCountry,
            isAdmin: false,
            isDisabled: false,
            isApproved: true,
            expiration: dateString,
            euHomeStagingCourse: row.custom.which_homestaging_course,
            description: '',

            showPhone: false,

            businessName: currentBusinessName,
            businessEmail: currentBusinessEmail,
            urlWeb: urlWeb,
            urlLinkedIn: urlLinkedIn,
            urlFacebook: urlFacebook,
            urlInstagram: urlInstagram,
            urlPinterest: urlPinterest,
            dob: '',
            euAffilicatedAssociation: userData.euAffilicatedAssociation,
            checkboxEthicsCode: userData.checkboxEthicsCode,
            checkboxStatue: userData.checkboxStatue,
            checkboxTermsConditions: userData.checkboxTermsConditions,
            checkboxPrivacyPolicy: userData.checkboxPrivacyPolicy,
            txtHowFoundUs: userData.txtHowFoundUs,
            txtYearsInBusiness: userData.txtYearsInBusiness,
            initialSignUp: userData.initialSignUp,

            // ASP Info
            isASP: false,
            aspid: null
          });

          isSuccess = true;

          finalResults['status'] = isSuccess;
          finalResults['payload'] = userID;

          return finalResults;
        } else {
          //user creation gracefully failed
          //console.log(`the .then was executed even though the user was not created...`);
          finalResults['status'] = false;
          finalResults['payload'] = null;
          return finalResults;
        }
      })
      .catch((err) => {
        this.currentError = `Error creating User, because: ${err}`;
        console.log(this.currentError);
        finalResults['status'] = false;
        finalResults['payload'] = this.currentError;
        return finalResults;
      }); // admin.auth().createUser()





    //await db.collection("users").doc(idx).set(userObj);

    counter++;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

console.log('please wait while the users are imported...');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const start = async () => {
  await asyncForEach(Object.keys(users), async (idx) => {
    //await waitFor(50);
    console.log(idx + ": inserting: " + users[idx].firstName + " " + users[idx].lastName);
    //await db.collection('users').add(users[idx]);
    await db.collection("users").doc(idx).set(users[idx]);
  });
  console.log('Done');
}

//start();
