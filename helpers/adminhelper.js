const { resolve, reject } = require('promise');
const { response, path } = require('../app');
const addproductmodel = require('../model/addproduct');
const userSignup = require('../model/userSignup');
const bannermodel = require('../model/bannermodel');
const categorymodel = require('../model/categorymodel');
const couponmodel = require('../model/couponmodel');
const ordermodel = require('../model/ordermodel');

module.exports = {
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await userSignup.find().lean()
                resolve(users)
            } catch (err) {
                reject(err)
            }
        })
    },
    editUser: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await userSignup.findById(id).lean()
                if (user.status) {
                    userSignup.findByIdAndUpdate(id, { status: false }).then((data) => {
                        resolve(data)
                    })
                } else {
                    userSignup.findByIdAndUpdate(id, { status: true }).then((data) => {
                        resolve(data)
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },


    addProduct: (productdata) => {
        return new Promise((resolve, reject) => {
            try {
                let { Name, Stock, Price, DiscountedPrice, Category, Description } = productdata;

                let newProduct = new addproductmodel({
                    Name,
                    Stock,
                    Price,
                    DiscountedPrice,
                    Category,
                    Description

                })

                newProduct.save().then((data) => {

                    resolve(data);
                }).catch((err) => {
                    console.log(err);
                })
            } catch (err) {
                reject(err)
            }
        })
    },



    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await addproductmodel.find().populate('Category').lean();
                resolve(products)
            } catch (err) {
                reject(err)
            }
        })
    },


    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                addproductmodel.findByIdAndDelete(prodId).then((response) => {
                    resolve(response);
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                addproductmodel.findById(prodId).populate('Category').lean().then((response) => {
                    if (response) {
                        resolve(response);
                    } else (reject('Product not found'))

                }).catch((err) => {
                    reject(err)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    updateProduct: (prodId, productdata) => {
        return new Promise((resolve, reject) => {
            try {
                addproductmodel.findByIdAndUpdate(prodId, {
                    Name: productdata.Name,
                    Stock: productdata.Stock,
                    Price: productdata.Price,
                    DiscountedPrice: productdata.DiscountedPrice,
                    Category: productdata.Category
                }).then((response) => {

                    resolve(response);

                })
            } catch (err) {
                reject(err)
            }
        })
    },


    addBanner: (bannerdata) => {
        return new Promise((resolve, reject) => {
            try {
                let { Product, Heading, Description } = bannerdata

                let newBanner = new bannermodel({
                    Product,
                    Heading,
                    Description
                })

                newBanner.save().then((data) => {
                    resolve(data)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allbanner = await bannermodel.find().lean()
                resolve(allbanner)
            } catch (err) {
                reject(err)
            }
        })
    },

    deleteBanner: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                bannermodel.findByIdAndDelete(prodId).then((response) => {
                    resolve(response);
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    getBannerDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            try {
                bannermodel.findById(prodId).lean().then((response) => {
                    resolve(response)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    updateBanner: (prodId, bannerdata) => {
        return new Promise((resolve, reject) => {
            try {
                bannermodel.findByIdAndUpdate(prodId, {
                    Heading: bannerdata.Heading,
                    Description: bannerdata.Description
                }).then((data) => {
                    resolve(data)
                })
            } catch (err) {
                reject(err)
            }
        })
    },


    addCategory: (categorydata) => {
        let categoryname = categorydata.CategoryName.toUpperCase();
        return new Promise(async (resolve, reject) => {
            try{
            let categoryexist = await categorymodel.findOne({ CategoryName: categoryname }).lean()
            let response = {
                categoryexist: false,
                category: null
            }
            if (categoryexist) {
                response.categoryexist = true
                resolve(response)
            } else {
                let CategoryName = categoryname;

                let newCategory = new categorymodel({
                    CategoryName
                })

                newCategory.save().then((categorydata) => {
                    response.category = categorydata
                    resolve(response);
                }).catch((err) => {
                    console.log(err);
                })
            }
        }catch(err){
            reject(err)
        }
        })
    },

    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            try{
            let category = await categorymodel.find().lean()
            resolve(category)
            }catch(err){
                reject(err)
            }
        })
    },

    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            try{
            categorymodel.findByIdAndDelete(catId).then((response) => {
                resolve(response);
            })
        }catch(err){
            reject(err)
        }
        })
    },

    getCategorydetails: (catId) => {
        return new Promise((resolve, reject) => {
            try{
            categorymodel.findById(catId).lean().then((data) => {
                resolve(data)
            })
        }catch(err){
            reject(err)
        }
        })
    },

    editCategory: (catId, catdata) => {
        return new Promise((resolve, reject) => {
            try{
            categorymodel.findByIdAndUpdate(catId, { CategoryName: catdata.CategoryName }).then((response) => {
                resolve(response);
            })
        }catch(err){
            reject(err)
        }
        })
    },

    addCoupon: (coupondata) => {
        return new Promise((resolve, reject) => {
            try{
            let { Couponname, Couponcode, Coupondescription, Coupondiscount } = coupondata;

            let newCoupon = new couponmodel({
                Couponname,
                Couponcode,
                Coupondescription,
                Coupondiscount
            })

            newCoupon.save().then((response) => {
                resolve(response)
            })
        }catch(err){
            reject(err)
        }
        })
    },

    getallCoupon: (coupondata) => {
        return new Promise((resolve, reject) => {
            try{
            couponmodel.find().lean().then((response) => {
                resolve(response)
            })
        }catch(err){
            reject(err)
        }
        })
    },

    deleteCoupon: (couponid) => {
        return new Promise((resolve, reject) => {
            try{
            couponmodel.findByIdAndDelete(couponid).then((response) => {
                resolve(response)
            })
        }catch(err){
            reject(err)
        }
        })
    },

    editCoupon: (couponid, coupondata) => {
        return new Promise((resolve, reject) => {
            try{
            let response = {}
            couponmodel.findById(couponid).lean().then(async (coupon) => {
                let code1 = await couponmodel.findOne({ Couponcode: coupondata.Couponcode })
                if (coupon.Couponcode === coupondata.Couponcode || !code1) {
                    let code = coupondata.Couponcode.toUpperCase();
                    couponmodel.findByIdAndUpdate(couponid, {
                        Couponname: coupondata.CategoryName,
                        Couponcode: code,
                        Coupondescription: coupondata.Coupondescription,
                        Coupondiscount: coupondata.Coupondiscount
                    }).then((data) => {
                        response.data = true
                        resolve(response)
                    })
                } else {
                    response.data = false
                }
            }).catch((err) => {
                console.log(err);
            })
        }catch(err){
            reject(err)
        }
        })
    },

    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            try{
            ordermodel.find({}).populate('userId')
                .populate('Orderitems.product')
                .populate('Deliverydetails')
                .populate('Orderitems.product.Category').lean()
                .then((orders) => {
                    resolve(orders)
                })
            }catch(err){
                reject(err)
            }
        })
    },

    changeShipping: (id, shippingdata) => {
        return new Promise((resolve, reject) => {
            try{
            ordermodel.findByIdAndUpdate(id, {
                Deliverystatus: shippingdata.shipping
            }).then((status) => {
                resolve(status)
            })
        }catch(err){
            reject(err)
        }
        })
    }

}
