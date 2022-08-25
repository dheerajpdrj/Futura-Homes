let usermodel = require('../model/userSignup');
let Promise = require('promise');
const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const e = require('express');
const addressmodel = require('../model/addressmodel');
const { response } = require('../app');

module.exports = {
    doSignup: (userdata) => {
        return new Promise(async (resolve, reject) => {
            let { Fname, Lname, Email, Mobile, Password } = userdata;
            Password = await bcrypt.hash(Password, 10)
            let status = true;
            const newUser = new usermodel({
                Fname,
                Lname,
                Email,
                Mobile,
                Password,
                status
            });

            newUser.save().then((data) => {
                resolve(data);
            }).catch((err) => {
                console.log(err);
            })
        })

    },


    dologin: (logindata) => {
        const { Email, Password } = logindata;
        return new Promise(async (resolve, reject) => {

            let response = {
                loginstatus: false
            };

            let user = await usermodel.findOne({ Email });

            console.log(user);

            if (user) {
                bcrypt.compare(Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user;
                        response.loginstatus = true
                        resolve(response);
                    } else {
                        console.log('login failed');

                        resolve(response)
                    }
                })
            } else {
                console.log('login failed notfound');

                resolve(response)

            }



        })

    },


    userexist: (userdata) => {

        return new Promise(async (resolve, reject) => {
            let { Fname, Lname, Email, Mobile, Password } = userdata

            let response = {}
            console.log(Email);
            let user = await usermodel.findOne({ Email })
            console.log(user);

            if (user) {
                response.alreadyRegistered = true
                resolve(response)

            } else {

                response.alreadyRegistered = false
                resolve(response)

            }
        })


    },

    mobileexist: (Mobile) => {
        return new Promise(async (resolve, reject) => {

            let response = {};
            let user = await usermodel.findOne({ Mobile })

            if (user) {
                response.user = user
                response.mobilealreadyexist = true
                resolve(response);
            } else {
                resolve(response);

            }


        })
    },

    getUserdata: (userid) => {
        return new Promise((resolve, reject) => {
            usermodel.findById(userid).lean().then((user) => {
                resolve(user)
            })
        })
    },


    editUser: (userid, data) => {
        return new Promise((resolve, reject) => {
            usermodel.findByIdAndUpdate(userid, {
                Fname: data.fname,
                Lname: data.lname,
                Emaile: data.email,
                Mobile: data.mobilenumber,
                AltMobile: data.altmobnumber

            }).then((data) => {
                resolve(data);
            })
        })
    },

    addAddress: (userid, details) => {
        return new Promise((resolve, reject) => {
            let newaddress = new addressmodel({
                userId: userid,
                name: details.name,
                number: details.number,
                address1: details.address1,
                address2: details.address2,
                district: details.district,
                state: details.state,
                country: details.country,
                pincode: details.pincode
            })

            newaddress.save().then((response)=>{
                resolve(response);
            })
        })

    },

    getAdress:(userid)=>{
        return new Promise(async(resolve,reject)=>{
          let data=await  addressmodel.find({userId:userid}).lean()
                resolve(data)
            
        })
    },

    deleteAddress:(addressid)=>{
        return new Promise((resolve,reject)=>{
            addressmodel.findByIdAndDelete(addressid).then((response)=>{
                resolve(response);
            })
        })
    },

    editAddress:(addressId,addressdata)=>{
        return new Promise((resolve,reject)=>{
            addressmodel.findByIdAndUpdate(addressId,{
                name:addressdata.name,
                number:addressdata.number,
                address1:addressdata.address1,
                address2:addressdata.address2,
                district:addressdata.district,
                state:addressdata.state,
                country:addressdata.country,
                pincode:addressdata.pincode
            }).then((response)=>{
                resolve(response);
            })
        })
    }


}