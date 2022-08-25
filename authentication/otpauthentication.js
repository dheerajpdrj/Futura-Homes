const { resolve, reject } = require('promise')
const { response } = require('../app')
const env= require("dotenv").config();

var config = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    serviceSid: process.env.TWILIO_SERVICE_SID
}

const client = require('twilio')(config.accountSid, config.authToken)




module.exports = {
    getotp: (number) => {
        console.log(number);

        number = '+91' + number

        return new Promise((resolve, reject) => {


            client.verify.v2.services(config.serviceSid)
                .verifications
                .create({ to: number, channel: 'sms' })
                .then((response) => {
                    console.log(response);
                    resolve(response)

                    console.log("Promise Done");
                });
        })

    },




    checkotp: (otp, number) => {
  
        return new Promise((resolve, reject) => {
            number = '+91' + number
            console.log(otp,number);
            client.verify.v2.services(config.serviceSid)
                .verificationChecks
                .create({ to: number, code: otp })
                .then((verification_check) => {
                    console.log(verification_check.status)
                    resolve(verification_check.status)
                });
        })
    }

}