const { default: mongoose, Promise } = require('mongoose');
const { resolve, reject } = require('promise');
const { response } = require('../app');
const cartmodel = require('../model/cartmodel');
const couponmodel = require('../model/couponmodel');
const wishlistmodel = require('../model/wishlistmodel');
const ordermodel = require('../model/ordermodel');
const Razorpay = require('razorpay')
const env = require("dotenv").config();
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



Helper = {

    addToCart: (prodId, userid) => {
        return new Promise(async (resolve, reject) => {
            const response = {
                duplicate: false
            }
            try {
                let checkCart = await cartmodel.findOne({ userId: userid })
                if (checkCart) {
                    let cartProduct = await cartmodel.findOne({ userId: userid, 'cartItems.product': prodId })
                    if (cartProduct) {
                        cartmodel.updateOne({ userId: userid, 'cartItems.product': prodId }, { $inc: { 'cartItems.$.quantity': 1 } }).then((data) => {
                            response.inc = true
                            resolve(response)
                        })
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

            } catch {
                reject(err)
            }
        })
    },

    getCartProducts: (userid) => {

        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err)
            }
        })
    },

    getCartCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                let cart = await cartmodel.findOne({ userId: userid })
                if (cart) {
                    count = cart.cartItems.length
                }
                resolve(count)
            } catch (err) {
                reject(err)
            }
        })

    },

    quantityPlus: (proId, userid) => {
        return new Promise((resolve, reject) => {
            try {
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
            } catch {
                reject(err)
            }
        })
    },
    quantityMinus: (proId, userid) => {
        return new Promise((resolve, reject) => {
            try {
                cartmodel.updateOne({ userId: userid, 'cartItems.product': proId }, { $inc: { 'cartItems.$.quantity': -1 } }).then(async (data) => {
                    let response = {}
                    let cart = await cartmodel.findOne({ userId: userid }).lean()
                    response.cart = cart
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
            } catch {
                reject(err)
            }
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
            try {
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
                    } else {
                        response.cartempty = true
                        resolve(response)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    addWishlist: (userid, prodid) => {
        return new Promise(async (resolve, reject) => {
            try {
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
                    }).catch((err) => {
                        reject(err);
                    })
                }
            } catch (err) {
                reject(err)
            }
        })
    },

    getWishlistProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            try {
                // let response={};
                let wishlist = await wishlistmodel.findOne({ userId: userid }).lean().populate('wishlistItems')
                resolve(wishlist)
            } catch (err) {
                reject(err)
            }
        })
    },

    getWishlistCount: (userid) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                let wishlist = await wishlistmodel.findOne({ userId: userid })
                if (wishlist) {
                    count = wishlist.wishlistItems.length
                }
                resolve(count);
            } catch (err) {
                reject(err)
            }
        })
    },

    deleteWishlist: (userid, prodid) => {
        return new Promise((resolve, reject) => {
            try {
                wishlistmodel.updateOne({ userId: userid, wishlistItems: prodid }, {
                    $pull: {
                        wishlistItems: prodid
                    }
                }).then((response) => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    checkwishlist: (userid, prodid) => {
        return new Promise((resolve, reject) => {
            try {
                let wishlist = null
                wishlistmodel.find({
                    userId: userid,
                    wishlistItems: prodid
                }).then((data) => {
                    if (data.length > 0) {
                        wishlist = true
                    }
                    resolve(wishlist)
                }).catch((err) => {
                    reject(err)
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    applyCoupon: (code, userid) => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err)
            }
        })
    },

    couponuser: (userid, code) => {
        return new Promise((resolve, reject) => {
            try {
                couponmodel.findOneAndUpdate({ Couponcode: code }, {
                    $push: {
                        userId: userid
                    }
                }).then((response) => {
                    resolve();
                })
            } catch (err) {
                reject(err)
            }
        })
    },

    placeOrder: (userid, orderdata) => {
        return new Promise((resolve, reject) => {
            try {
                let Orderstatus
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
                        Deliverystatus: 'Pending',
                        Orderstatus
                    })

                    newOrder.save().then((data) => {
                        if (data.Paymentdetails === "COD") {
                            cartmodel.findOneAndDelete({ userId: userid }).then((response) => {
                                resolve();
                            })
                        }
                        resolve(data)
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    },
    getUserOrders: (userid) => {
        return new Promise((resolve, response) => {
            try {
                ordermodel.find({ userId: userid }).populate('Orderitems.product')
                    .lean().then((orders) => {
                        resolve(orders)
                    })
            } catch (err) {
                reject(err)
            }
        })
    },

    getOrder: (orderid) => {
        return new Promise((resolve, reject) => {
            try {
                ordermodel.findOne({ _id: orderid })
                    .populate('Orderitems.product')
                    .populate('Deliverydetails')
                    .populate('Orderitems.product.Category')
                    .lean().then((orderdetails) => {
                        if (orderdetails) {
                            resolve(orderdetails)
                        } else {
                            reject(true)
                        }
                    }).catch((err) => {
                        reject(err)
                    })
            } catch (err) {
                reject(err);
            }
        })
    },

    generateRazorpay: (Order) => {

        return new Promise((resolve, reject) => {
            try {
                let fund = Order.Totalprice * 100;

                var options = {
                    amount: fund,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + Order._id
                };
                instance.orders.create(options, function (err, order) {
                    resolve(order);
                });
            } catch (err) {
                reject(err)
            }
        })

    },

    verifyPayment: (paymentdetails) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
                let body = paymentdetails.payment.razorpay_order_id + '|' + paymentdetails.payment.razorpay_payment_id;
                hmac.update(body.toString());
                hmac = hmac.digest('hex')
                if (hmac == paymentdetails.payment.razorpay_signature) {
                    resolve();
                } else {
                    reject();
                }
            } catch (err) {
                reject(err)
            }
        })
    },
    changeOrderStatus: (orderid, status, userid) => {
        return new Promise((resolve, reject) => {
            try {
                ordermodel.findByIdAndUpdate({ _id: orderid }, {
                    $set: { Orderstatus: status, Deliverystatus: "Processing" }
                }).then((status) => {
                    cartmodel.findOneAndDelete({ userId: userid }).then((response) => {
                        resolve(status);
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    }
}


module.exports = Helper;