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

fs.createReadStream('_gEditMembers.csv')
  .pipe(csv())
  .on('data', async (row) => {
    //console.log(`${counter.toString()}.  ${row.firstname} ${row.lastname} <${row.email}>`);
    //insert the user object into the db


    const strPhotoURL = 'https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png';

    const tmpPW = makeTmpPW(10);
    //console.log(`generated tmpPW: ${tmpPW} for ${row.email}`);



    //create the new user
    const createUserResult = await admin.auth().createUser({
      email: row.email,
      emailVerified: false,
      password: tmpPW,
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
          const phoneNumber = (row.phone) ? row.phone : row['custom.business_phone_number'];

          // derive country  from multiple fields
          let currentCountry = '';
          if (row['custom.business_location.country']) {
            currentCountry = row['custom.business_location.country'];
          }
          else if (row['custom.iahsp_country']) {
            currentCountry = row['custom.iahsp_country'];
          }
          else if (row['custom.iahsp_location']) {
            currentCountry = row['custom.iahsp_location'];
          }

          // normalize the date
          const tmpDateParts = row.membership_expires.split('/');

          let dateYYYY = '';
          if (tmpDateParts[2].length <= 2) {
            dateYYYY = `20${tmpDateParts[2]}`;
          } else {
            dateYYYY = tmpDateParts[2];
          }

          const dateMM = tmpDateParts[0];
          const dateDD = tmpDateParts[1];

          const dateString = `${dateYYYY}-${dateMM}-${dateDD}`; 

          // normalize the signup date
          if (row.signup_at) {
            tmpSignUpStr = row.signup_at;
          } else {
            tmpSignUpStr = row.createdAt;
          }
          let tmpSignupDateParts = tmpSignUpStr.split('/');

          let signupDateYYYY = '';
          if (tmpSignupDateParts[2].length <= 2) {
            signupDateYYYY = `20${tmpSignupDateParts[2]}`;
          } else {
            signupDateYYYY = tmpSignupDateParts[2];
          }

          const signupDateMM = tmpSignupDateParts[0];
          const signupDateDD = tmpSignupDateParts[1];

          const signupDateString = `${signupDateYYYY}-${signupDateMM}-${signupDateDD}`; 

          // derive business name
          // organisation/custom.business_name/company/custom.iahsp_organisation_name
          let currentBusinessName = '';
          if (row.organisation) {
            currentBusinessName = row.organisation;
          }
          else if (row['custom.business_name']) {
            currentBusinessName = row['custom.business_name'];
          }
          else if (row.company) {
            currentBusinessName = row.company;
          }
          else if (row['custom.iahsp_organisation_name']) {
            currentBusinessName = row['custom.iahsp_organisation_name'];
          }

          // derive business email
          let currentBusinessEmail = row.email;
          if (row['custom.business_email']) {
            currentBusinessEmail = row['custom.business_email'];
          }
          else if (row['custom.iahsp_email']) {
            currentBusinessEmail = row['custom.iahsp_email'];
          }

          // derive urls
          let urlWeb = '';
          let urlLinkedIn = '';
          let urlFacebook = '';
          let urlInstagram = '';
          let urlPinterest = '';

          if (row['custom.business_website']) {
            urlWeb = row['custom.business_website'];
          }
          else if (row['custom.iahsp_website']) {
            urlWeb = row['custom.iahsp_website'];
          }

          if (row['custom.business_linkedin']) {
            urlLinkedIn = row['custom.business_linkedin'];
          }
          else if (row['custom.iahsp_linkedin']) {
            urlLinkedIn = row['custom.iahsp_linkedin'];
          }

          if (row['custom.business_facebook']) {
            urlFacebook = row['custom.business_facebook'];
          }
          else if (row['custom.iahsp_facebook']) {
            urlFacebook = row['custom.iahsp_facebook'];
          }

          if (row['custom.business_instagram']) {
            urlInstagram = row['custom.business_instagram'];
          }
          else if (row['custom.iahsp_instagram']) {
            urlInstagram = row['custom.iahsp_instagram'];
          }

          if (row['custom.business_pinterest']) {
            urlPinterest = row['custom.business_pinterest'];
          }
          else if (row['custom.iahsp_pinterest']) {
            urlPinterest = row['custom.iahsp_pinterest'];
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
            vatNumber: row['custom.vat_number'],
            address1: row['custom.business_location.line1'],
            address2: row['custom.business_location.line2'],
            city: row['custom.business_location.city'],
            zip: row['custom.business_location.postcode'],
            countryCustom: currentCountry,
            country: currentCountry,
            isAdmin: false,
            isDisabled: false,
            isApproved: true,
            expiration: dateString,
            euHomeStagingCourse: row['custom.which_homestaging_course'],
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
            euAffilicatedAssociation: row['custom.national_association'],
            checkboxEthicsCode: (row['custom.ethics_code']) ? 'true' : '',
            checkboxStatue: (row['custom.statute']) ? 'true' : '',
            checkboxTermsConditions: (row.termsandconditions) ? 'true' : '',
            checkboxPrivacyPolicy: (row.privacypolicy) ? 'true' : '',
            txtHowFoundUs: row['custom.how_did_you_find_us'],
            txtYearsInBusiness: row['custom.how_many_years_in_business'],
            initialSignUp: signupDateString,

            // ASP Info
            isASP: false,
            aspid: null
          });

          return true;

        } else {
          //user creation gracefully failed
          console.log(`the .then was executed even though the user was not created...`);

          return false;
        }
      })
      .catch((err) => {
        this.currentError = `Error creating User, because: ${err}`;
        console.log(this.currentError);

        return false;;
      }); // admin.auth().createUser()





    //await db.collection("users").doc(idx).set(userObj);

    counter++;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

console.log('please wait while the users are imported...');


const makeTmpPW = (length) => {
    const result           = [];
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   return result.join('');
}

