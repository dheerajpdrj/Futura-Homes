const { reject, resolve } = require('promise')
let adminmodel = require('../model/adminmodel')
let bcrypt = require('bcrypt')
const { response } = require('../app')
const userSignup = require('../model/userSignup')
const { default: mongoose } = require('mongoose')


module.exports = {
    // adminSignup:(admindata)=>{
    //     console.log(admindata);
    //     return new Promise(async (resolve,reject)=>{
    //         let {email,password}=admindata;
    //       password = await bcrypt.hash(password,10)
    //         const newadmin= new adminmodel({
    //             email,
    //             password
    //         });

    //         newadmin.save().then((data)=>{
    //             resolve(data)
    //         }).catch((err)=>{
    //             console.log(err);
    //         })

    //     })
    // }


    adminlogin: (admindata) => {
        return new Promise(async (resolve, reject) => {
            let { email, password } = admindata;
            let response = {
                loginstatus: false
            }
            admin = await adminmodel.findOne({ email })

            if (admin) {
                bcrypt.compare(password, admin.password).then((status) => {
                    if (status) {
                        response.admin = admin
                        response.loginstatus = true
                        resolve(response)
                    } else {
                        resolve(response)
                    }
                })
            } else {
                resolve(response)
            }
        })
    },
   

}