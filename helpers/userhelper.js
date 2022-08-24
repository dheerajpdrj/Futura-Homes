const { default: mongoose, Promise } = require('mongoose');
const { resolve, reject } = require('promise');
const { response } = require('../app');
const cartmodel = require('../model/cartmodel');
const couponmodel = require('../model/couponmodel');
const wishlistmodel = require('../model/wishlistmodel');
const ordermodel = require('../model/ordermodel');
const Razorpay = require('razorpay')
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



Helper = {

    addToCart: (prodId, userid) => {
        const response = {
            duplicate: false
        }

        return new Promise(async (resolve, reject) => {
            let checkCart = await cartmodel.findOne({ userId: userid })
            if (checkCart) {
                let cartProduct = await cartmodel.findOne({ userId: userid, 'cartItems.product': prodId })
                if (cartProduct) {
                    response.duplicate = true
                    resolve(response)
                } else {


                    console.log(checkCart)
                    let cartarray = { product: prodId, quantity: 1 }
                    cartmodel.findOneAndUpdate({ userId: userid },
                        {
                            $push: { cartItems: cartarray }
                        }).then((data) => {
                            resolve(response)
                        })
                }
            } else {
                console.log('new cart')
                let quantity = 1;
                let cart = new cartmodel({
                    userId: userid,
                    cartItems: [
                        {
                            product: prodId,
                            quantity
                        }
                    ]
                })

                cart.save().then((data) => {
                    resolve(response)
                })
            }


        })
    },

    getCartProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            const response = {};
            let cart = await cartmodel.findOne({ userId: userid }).populate('cartItems.product').lean()
            if (cart) {
                if (cart.cartItems.length > 0) {
                    response.cartempty = false
                    response.cart = cart
                    resolve(response)
                } else {
                    response.cartempty = true
                    response.cart = cart
                    resolve(response)
                }
            } else {
                response.cartempty = true
                resolve(response)
            }

        })
    },

    getCartCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await cartmodel.findOne({ userId: userid })
            if (cart) {
                count = cart.cartItems.length
            }
            resolve(count)
        })
    },
    quantityPlus: (proId, userid) => {
        console.log(proId)
        return new Promise((resolve, reject) => {
            cartmodel.updateOne({ userId: userid, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': 1 } }).then(async (data) => {
                let cart = await cartmodel.findOne({ userId: userid }).lean()
                let response = {}
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                response.count = count
                resolve(response)
            })
        })
    },
    quantityMinus: (proId, userid) => {
        console.log(proId)
        return new Promise((resolve, reject) => {
            cartmodel.updateOne({ userId: userid, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': -1 } }).then(async (data) => {
                let response = {}
                let cart = await cartmodel.findOne({ userId: userid }).lean()
                response.cart = cart
                console.log(cart)
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == proId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                if (count == 0) {
                    cartmodel.updateOne({ userId: userid }, {
                        $pull: {
                            cartItems:
                                { product: proId }
                        }
                    }).then((data) => {
                        response.data = data
                    })
                }
                response.count = count
                resolve(response)
            })
        })
    },


    deleteCart: (prodId, userid) => {
        return new Promise((resolve, reject) => {
            try {
                cartmodel.updateOne({ userId: userid, 'cartItems.product': prodId },
                    {
                        $pull: {
                            cartItems:
                                { product: prodId }
                        }
                    }).then((response) => {
                        resolve(response);
                    })
            } catch {
                reject(err)
            }

        })
    },

    getTotalAmount: (userid) => {
        return new Promise(async (resolve, reject) => {
            Helper.getCartProducts(userid).then((res) => {
                let response = {};
                cart = res.cart;
                let total;
                if (cart) {
                    if (cart.cartItems.length > 0) {
                        total = cart.cartItems.reduce((acc, curr) => {
                            acc += curr.product.Price * curr.quantity
                            return acc
                        }, 0)
                    }

                    
                    let shipping = 0;
                    if (total < 1000) {
                        shipping = 100;
                    }
                    response.shipping = shipping;
                    response.total = total;
                    response.grandtotal = response.total + response.shipping
                    response.cart = cart
                    resolve(response)
                }else{
                    response.cartempty = true
                    resolve(response)
                }
            })
        })
    },

    addWishlist: (userid, prodid) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let wishlist = await wishlistmodel.findOne({ userId: userid })
            if (wishlist) {
                let wishlistproducts = await wishlistmodel.findOne({ userId: userid, wishlistItems: prodid })
                if (wishlistproducts) {
                    wishlistmodel.findOneAndUpdate({ userId: userid }, {
                        $pull: { wishlistItems: prodid }
                    }).then((data) => {
                        response.added = false
                        resolve(response)
                    })

                } else {
                    wishlistmodel.findOneAndUpdate({ userId: userid }, {
                        $push: { wishlistItems: prodid }
                    }).then((data) => {
                        response.added = true
                        console.log(data);
                        resolve(response)
                    })
                }
            } else {
                let newWishlist = new wishlistmodel({
                    userId: userid,

                    wishlistItems: prodid

                })
                newWishlist.save().then((data) => {
                    response.added = true
                    resolve(response);
                })
            }
        })
    },

    getWishlistProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            // let response={};
            let wishlist = await wishlistmodel.findOne({ userId: userid }).lean().populate('wishlistItems')
            resolve(wishlist)
        })
    },

    getWishlistCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let wishlist = await wishlistmodel.findOne({ userId: userid })
            if (wishlist) {
                count = wishlist.wishlistItems.length
            }
            resolve(count);
        })
    },

    deleteWishlist: (userid, prodid) => {
        return new Promise((resolve, reject) => {
            wishlistmodel.updateOne({ userId: userid, wishlistItems: prodid }, {
                $pull: {
                    wishlistItems: prodid
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    applyCoupon: (code, userid) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            response.discount = 0;
            let coupon = await couponmodel.findOne({ Couponcode: code })
            if (coupon) {
                let couponuser = await couponmodel.findOne({
                    Couponcode: code,
                    userId: { $in: [userid] }
                })
                if (couponuser) {
                    response.status = false
                    resolve(response)
                } else {
                    response.status = true;
                    response.coupon = coupon;

                    Helper.getTotalAmount(userid).then((total) => {
                        response.discount = (total.grandtotal * coupon.Coupondiscount) / 100
                        response.grandtotal = total.grandtotal - response.discount;
                        resolve(response)
                    })
                }
            } else {
                response.status = false
                resolve(response)
            }
        })
    },

    couponuser: (userid, code) => {
        return new Promise((resolve, reject) => {
            couponmodel.findOneAndUpdate({ Couponcode: code }, {
                $push: {
                    userId: userid
                }
            }).then((response) => {
                resolve();
            })
        })
    },

    placeOrder: (userid, orderdata) => {
        let Orderstatus;
        return new Promise((resolve, reject) => {
            if (orderdata.paymentinput === 'COD') {
                Orderstatus = true
            }
            Helper.getTotalAmount(userid).then((response) => {
                if (orderdata.discount) {
                    response.grandtotal = response.grandtotal - orderdata.discount
                }
                let newOrder = new ordermodel({
                    userId: userid,
                    Orderitems: response.cart.cartItems,
                    Totalprice: response.grandtotal,
                    Deliverycharge: response.shipping,
                    Deliverydetails: orderdata.addressinput,
                    Paymentdetails: orderdata.paymentinput,
                    Orderstatus
                })

                newOrder.save().then((data) => {
                    cartmodel.findOneAndDelete({ userId: userid }).then((response) => {
                        resolve();
                    })
                    resolve(data)
                })
            })
        })
    },
    getUserOrders: (userid) => {
        return new Promise((resolve, response) => {
            ordermodel.find({ userId: userid }).lean().then((orders) => {
                resolve(orders)
            })
        })
    },

    generateRazorpay: (Order) => {
        let fund = Order.Totalprice * 100;
        return new Promise((resolve, reject) => {

            var options = {
                amount: fund,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + Order._id
            };
            instance.orders.create(options, function (err, order) {
                resolve(order);
            });
        })
    },

    verifyPayment:(paymentdetails)=>{
        return new Promise((resolve,reject)=>{
            const crypto= require('crypto');
            let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            let body= paymentdetails.payment.razorpay_order_id  + '|' + paymentdetails.payment.razorpay_payment_id;
            hmac.update(body.toString());
            hmac=hmac.digest('hex')
            if(hmac==paymentdetails.payment.razorpay_signature){
                resolve();
            }else{
                reject();
            }
        })
    },
    changePaymentStatus:(orderid)=>{
        return new Promise((resolve,reject)=>{
            ordermodel.findByIdAndUpdate({_id:orderid},{
                $set:{Deliverystatus:'Placed'}
            }).then((status)=>{
                resolve(status);
            })
        })
    }
}


module.exports = Helper;