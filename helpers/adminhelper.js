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
            let users = await userSignup.find().lean()
            resolve(users)
        })
    },
    editUser: (id) => {
        return new Promise(async (resolve, reject) => {
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
        })
    },


    addProduct: (productdata) => {
        return new Promise((resolve, reject) => {
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
        })
    },



    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await addproductmodel.find().populate('Category').lean();
            resolve(products)
        })
    },


    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            addproductmodel.findByIdAndDelete(prodId).then((response) => {
                resolve(response);
            })
        })
    },

    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            addproductmodel.findById(prodId).populate('Category').lean().then((response) => {
                if (response) {
                    console.log(response, 'dsssss');
                    resolve(response);
                } else (reject('Product not found'))

            }).catch(() => {
                reject('product not found')
            })
        })
    },

    updateProduct: (prodId, productdata) => {
        return new Promise((resolve, reject) => {
            addproductmodel.findByIdAndUpdate(prodId, {
                Name: productdata.Name,
                Stock: productdata.Stock,
                Price: productdata.Price,
                DiscountedPrice: productdata.DiscountedPrice,
                Category: productdata.Category
            }).then((response) => {

                resolve(response);

            })
        })
    },


    addBanner: (bannerdata) => {
        return new Promise((resolve, reject) => {
            let { Product, Heading, Description } = bannerdata

            let newBanner = new bannermodel({
                Product,
                Heading,
                Description
            })

            newBanner.save().then((data) => {
                resolve(data)
            })
        })
    },

    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let allbanner = await bannermodel.find().lean()
            resolve(allbanner)
        })
    },

    deleteBanner: (prodId) => {
        return new Promise((resolve, reject) => {
            bannermodel.findByIdAndDelete(prodId).then((response) => {
                resolve(response);
            })
        })
    },

    getBannerDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            bannermodel.findById(prodId).lean().then((response) => {
                resolve(response)
            })
        })
    },

    updateBanner: (prodId, bannerdata) => {
        return new Promise((resolve, reject) => {
            bannermodel.findByIdAndUpdate(prodId, {
                Heading: bannerdata.Heading,
                Description: bannerdata.Description
            }).then((data) => {
                resolve(data)
            })
        })
    },


    addCategory: (categorydata) => {
        let categoryname= categorydata.CategoryName.toUpperCase();
        return new Promise(async (resolve, reject) => {
            let categoryexist = await categorymodel.findOne({ CategoryName: categoryname}).lean()
            let response = {
                categoryexist: false,
                category:null
            }
            if (categoryexist) {
                response.categoryexist=true
                resolve(response)
            } else {
                let  CategoryName  = categoryname;

                let newCategory = new categorymodel({
                    CategoryName
                })

                newCategory.save().then((categorydata) => {
                    response.category=categorydata
                    resolve(response);
                }).catch((err) => {
                    console.log(err);
                })
            }
        })
    },

    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await categorymodel.find().lean()
            resolve(category)
        })
    },

    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            categorymodel.findByIdAndDelete(catId).then((response) => {
                resolve(response);
            })
        })
    },

    getCategorydetails: (catId) => {
        return new Promise((resolve, reject) => {
            categorymodel.findById(catId).lean().then((data) => {
                resolve(data)
            })
        })
    },

    editCategory: (catId, catdata) => {
        return new Promise((resolve, reject) => {
            categorymodel.findByIdAndUpdate(catId, { CategoryName: catdata.CategoryName }).then((response) => {
                resolve(response);
            })
        })
    },

    addCoupon: (coupondata) => {
        return new Promise((resolve, reject) => {
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
        })
    },

    getallCoupon: (coupondata) => {
        return new Promise((resolve, reject) => {
            couponmodel.find().lean().then((response) => {
                resolve(response)
            })
        })
    },

    deleteCoupon: (couponid) => {
        return new Promise((resolve, reject) => {
            couponmodel.findByIdAndDelete(couponid).then((response) => {
                resolve(response)
            })
        })
    },

    editCoupon: (couponid, coupondata) => {
        return new Promise((resolve, reject) => {
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
        })
    },

    getAllOrders:()=>{
        return new Promise((resolve,reject)=>{
            ordermodel.find({}).populate('userId')
            .populate('Orderitems.product')
            .populate('Deliverydetails')
            .populate('Orderitems.product.Category').lean()
            .then((orders)=>{
                resolve(orders)
            })

        })
    }

}
