const { response } = require('express');
let express = require('express');
let router = express.Router();
let userauthentication = require('../authentication/userauthentication');
let otpauthentication = require('../authentication/otpauthentication');
const adminhelper = require('../helpers/adminhelper');
const userhelper = require('../helpers/userhelper');
const { route } = require('./admin');
const session = require('express-session');

function verify(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    let cartcount = null;
    if (req.session.user) {
      cartcount = await userhelper.getCartCount(req.session.user._id)
    }
    adminhelper.getAllProducts().then((allproducts) => {
      adminhelper.getAllBanner().then((allbanner) => {
        adminhelper.getAllCategory().then((category) => {
          let session = req.session.user;
          let loggedIn = req.session.userLoggedin
          res.render('user/userHome', { userDisplay: true, userfooter: true, session, allproducts, allbanner, category, cartcount, loggedIn })
        })
      })
    })
  } catch (err) {
    next(err)
  }
})


router.get('/login', (req, res, next) => {
  try {
    if (req.session.userLoggedin) {

      res.redirect('/')

    } else {
      let error = req.session.loginErr
      req.session.loginErr = null
      let errorMobile = req.session.mobilenoalreadyfound
      req.session.mobilenoalreadyfound = null
      let blocked = req.session.blocked
      res.render('user/userLogin', { error, errorMobile, blocked })
    }
  } catch (err) {
    next(err)
  }
})



router.get('/signup', (req, res, next) => {
  try {
    if (req.session.userLoggedin) {
      res.redirect('/')
    } else {
      let userexist = req.session.userexist
      req.session.userexist = null
      res.render('user/userSignup', { userexist })
    }
  } catch (err) {
    next(err)
  }
})


router.post('/signup', (req, res, next) => {
  try {
    req.session.user = req.body;
    userauthentication.userexist(req.body).then((response) => {
      if (response.alreadyRegistered) {
        req.session.userexist = true
        res.redirect('/signup')

      } else {
        req.session.userexist = false
        otpauthentication.getotp(req.body.Mobile).then((response) => {
          console.log('Otp working');
          res.redirect('/otppage')
        })
      }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/otppage', (req, res, next) => {
  try {
    if(req.session.userLoggedin){
      res.redirect('/')
    }else{
      let userdetails = req.session.user
      let error = req.session.otperror
      res.render('user/otppage', { userdetails, error })
    }
  } catch (err) {
    next(err)
  }
})


router.post('/check-otp', (req, res, next) => {
  try {
    otpauthentication.checkotp(req.body.otp, req.body.number).then((response) => {
      if (response === 'approved') {
        userauthentication.doSignup(req.session.user).then((response) => {
          req.session.user = response
          req.session.userLoggedin = true
          res.redirect('/')
        })
      } else {
        req.session.otperror = 'Invalid otp'
        res.redirect('/otppage')
      }
    })
  } catch (err) {
    next(err)
  }
})




router.post('/login', (req, res, next) => {
  try {
    userauthentication.dologin(req.body).then((response) => {

      if (response.loginstatus) {

        if (response.user.status) {

          req.session.userLoggedin = true
          req.session.user = response.user

          console.log('login sucess');
          res.redirect('/')
        } else {
          req.session.blocked = 'You are Blocked by admin'
          res.redirect('/login')
        }

      } else {
        req.session.loginErr = "Invalid Username or Password"
        res.redirect('/login')
      }
    })
  } catch (err) {
    next(err)
  }
})


router.post('/loginwithotp', (req, res, next) => {
  try {
    userauthentication.mobileexist(req.body.number).then((response) => {
      if (!response.mobilealreadyexist) {
        req.session.mobilenoalreadyfound = 'User Does Not Exist'
        res.redirect('/login')
      } else {
        req.session.user = response.user
        otpauthentication.getotp(req.body.number).then((response) => {
          console.log('otp working');
          res.redirect('/loginwithotp')
        })
      }
    })
  } catch (err) {
    next(err)
  }

})

router.get('/loginwithotp', (req, res, next) => {
  try {
    if(req.session.userLoggedin){
      res.redirect('/')
    }
    else{
      let userdetails = req.session.user
      let error = req.session.otperror
      res.render('user/loginotppage', { userdetails, error })
      
    }
  } catch (err) {
    next(err)
  }
})



router.post('/validate-otp', (req, res, next) => {
  try {
    otpauthentication.checkotp(req.body.otp, req.body.number).then((response) => {

      if (response === 'approved') {
        req.session.userLoggedin=true
        console.log('Login success');
        res.redirect('/')
      } else {
        req.session.otperror = 'Invalid otp'

        res.redirect('/loginwithotp')
      }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/productdetails/:id', verify, (req, res, next) => {
  let session = req.session.user;
  adminhelper.getProductDetails(req.params.id).then((product) => {
    res.render('user/singleProduct', { userDisplay: true, userfooter: true, product, session })
  }).catch((err) => {
    next(err)
  })
})

router.get('/allproducts', verify, async (req, res, next) => {
  try {
    let category = await adminhelper.getAllCategory()
    let session = req.session.user
    let loggedIn = req.session.userLoggedin
    adminhelper.getAllProducts().then((products) => {
      res.render('user/allproducts', { userDisplay: true, userfooter: true, products, category, session, loggedIn })
    })
  } catch (err) {
    next(err)
  }
})


router.get('/userprofile', verify, (req, res, next) => {
  try {
    let session = req.session.user;
    userauthentication.getUserdata(req.session.user._id).then((user) => {
      res.render('user/userprofile', { userDisplay: true, session, user })
    })
  } catch (err) {
    next(err)
  }

})


router.get('/edituser', verify, (req, res, next) => {
  try {
    let session = req.session.user;
    userauthentication.getUserdata(req.session.user._id).then((userdata) => {
      res.render('user/edit-profile', { userDisplay: true, session, userdata })
    })
  } catch (err) {
    next(err)
  }

})

router.post('/edituser', verify, (req, res, next) => {
  try {
    let profilepic = req.files.profilepic;
    userauthentication.editUser(req.session.user._id, req.body).then((editeduser) => {
      profilepic.mv('public/profilepic/' + req.session.user._id + '.jpg')
      res.redirect('/userprofile')
    })
  } catch (err) {
    next(err)
  }
})

router.get('/address', verify, (req, res, next) => {
  try {
    let session=req.session.user
    userauthentication.getAdress(req.session.user._id).then((address) => {
      res.render('user/address', { userDisplay: true, address,session })
    })
  } catch (err) {
    next(err)
  }

})

router.post('/address', verify, (req, res, next) => {
  try {
    userauthentication.addAddress(req.session.user._id, req.body).then((response) => {
      res.redirect('/address')
    })
  } catch (err) {
    next(err)
  }
})

router.get('/delete-address/:id', verify, (req, res, next) => {
  let addressId = req.params.id
  userauthentication.deleteAddress(addressId).then((response) => {
    res.redirect('/address')
  }).catch((err) => {
    next(err)
  })
})

router.post('/edit-address/:id', verify, (req, res, next) => {
  let addressid = req.params.id
  userauthentication.editAddress(addressid, req.body).then((response) => {
    res.redirect('/address')
  }).catch((err) => {
    next(err)
  })
})

router.post('/addressCheckout', verify, async (req, res, next) => {
  try {
    let addaddress = await userauthentication.addAddress(req.session.user._id, req.body)
    res.redirect('/checkout');
  } catch (err) {
    next(err)
  }
})


router.get('/cart', verify, (req, res, next) => {
  try {
    let session = req.session.user;
    userhelper.getCartProducts(req.session.user._id).then(async (response) => {
      cart = response.cart
      cartempty = response.cartempty
      req.session.coupon = null
      req.session.discount = null
      let totalamount = await userhelper.getTotalAmount(req.session.user._id)
      res.render('user/cart', { userDisplay: true, userfooter: true, session, cart, totalamount, cartempty });

    })
  } catch (err) {
    next(err)
  }

})

router.post('/addToCart/:id', verify, (req, res, next) => {
  const id = req.params.id
  userhelper.addToCart(id, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => {
    next(err)
  })
})


router.get('/cartCount', verify, async (req, res, next) => {
  try {
    let cartcount = 0
    if (req.session.user) {
      cartcount = await userhelper.getCartCount(req.session.user._id)
    }
    res.json({ cartcount })
  } catch (err) {
    next(err)
  }
})

// router.post('/deleteCartcount/:id',(req,res)=>{
//   let id=req.params.id;
//   userhelper.deleteCart(id).then((response)=>{
//     res.json({response})
//   })
// })



router.post('/quantityPlus/:id', verify, (req, res, next) => {
  userhelper.quantityPlus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => {
    next(err)
  })
})

router.post('/quantityMinus/:id', verify, (req, res, next) => {
  userhelper.quantityMinus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => {
    next(err)
  })
})


router.get('/delete-cart/:id', verify, (req, res, next) => {
  userhelper.deleteCart(req.params.id, req.session.user._id).then((response) => {
    res.redirect('/cart');
  }).catch((err) => {
    next(err);
  })
})

router.get('/wishlist', verify, (req, res, next) => {
  try {
    let session = req.session.user
    userhelper.getWishlistProducts(req.session.user._id).then((wishlist) => {
      res.render('user/wishlist', { userDisplay: true, userfooter: true, wishlist, session })
    })
  } catch (err) {
    next(err)
  }
})

router.post('/wishlist/:id', verify, (req, res, next) => {
  userhelper.addWishlist(req.session.user._id, req.params.id).then((response) => {
    res.json({ response });
  }).catch((err) => {
    next(err)
  })
})

router.get('/wishlistcount', verify, (req, res, next) => {
  try {
    let wishlistcount = 0;
    if (req.session.user) {
      userhelper.getWishlistCount(req.session.user._id).then((count) => {
        wishlistcount = count;
        res.json({ wishlistcount });
      })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/deletewishlist/:id', verify, (req, res, next) => {
  userhelper.deleteWishlist(req.session.user._id, req.params.id).then((response) => {
    res.redirect('/wishlist')
  }).catch((err) => {
    next(err)
  })
})

router.get('/checkWishlist/:id', verify, (req, res, next) => {
  userhelper.checkwishlist(req.session.user._id, req.params.id).then((wishlist) => {
    res.json({ wishlist })
  }).catch((err) => {
    next(err)
  })
})

router.get('/checkout', verify, (req, res, next) => {
  try {
    let session = req.session.user
    discount = req.session.discount
    userauthentication.getAdress(req.session.user._id).then(async (address) => {
      let cartproducts = await userhelper.getCartProducts(req.session.user._id)
      let totalamount = await userhelper.getTotalAmount(req.session.user._id)
      if (req.session.discount) {
        totalamount.grandtotal = totalamount.grandtotal - req.session.discount;
      }
      res.render('user/checkout', { userDisplay: true, userfooter: true, address, totalamount, discount, cartproducts, session })
    })
  } catch (err) {
    next(err)
  }
})

router.post('/applycoupon', verify, (req, res, next) => {
  try {
    userhelper.applyCoupon(req.body.couponCode, req.session.user._id).then((response) => {
      if (response.status) {
        req.session.coupon = response.coupon
        req.session.discount = response.discount
        res.json({ response })
      } else {
        res.json({ response })
      }

    })
  } catch (err) {
    next(err)
  }
})

router.post('/placeorder', verify, (req, res, next) => {
  try {
    let orderdetails = req.body
    let userid = req.session.user._id
    if (req.session.coupon) {
      orderdetails.discount = req.session.discount
    }
    userhelper.placeOrder(userid, orderdetails).then(async (order) => {
      if (order.Paymentdetails === 'COD') {
        if (req.session.coupon) {
          await userhelper.couponuser(req.session.user._id, req.session.coupon.Couponcode)
        }
        userhelper.changeOrderStatus(order._id).then(() => {
          res.json({ order })
        })
      } else {
        userhelper.generateRazorpay(order).then((response) => {
          res.json({ response })
        })
      }

    })
  } catch (err) {
    next(err)
  }
})

router.post('/verifypayment', verify, (req, res, next) => {
  try {
    userhelper.verifyPayment(req.body).then((response) => {
      let status = true
      userhelper.changeOrderStatus(req.body.order.receipt, status,req.session.user._id).then(() => {
        res.json({ status: true })
      })
    }).catch((err) => {
      let status = false
      userhelper.changeOrderStatus(req.body.order.receipt, status).then(() => {
        res.json({ status: false })
      })
      console.log(err);
      res.json({ status: false })
    })
  } catch (err) {
    next(err)
  }
})

router.get('/ordersuccess/:id', verify, (req, res, next) => {
  try{
    let orderid = req.params.id
    let session = req.session.user
    userhelper.getOrder(orderid).then((orderdetails) => {
      res.render('user/ordersuccess', { userDisplay: true, userfooter: true, session, orderdetails })
    }).catch((err)=>{
      next(err)
    })
  }catch(err){
    next(err)
  }
})

router.get('/userorders', verify, async (req, res,next) => {
  try{
  let userorders = await userhelper.getUserOrders(req.session.user._id)
  let session = req.session.user
  res.render('user/userorders', { userDisplay: true, userfooter: true, userorders, session })
  }catch(err){
    next(err)
  }
})


router.get('/orderdetails/:id', verify, (req, res, next) => {
  let orderid = req.params.id
  let session = req.session.user
  userhelper.getOrder(orderid).then((orderdetails) => {
    res.render('user/orderdetails', { userDisplay: true, userfooter: true, session, orderdetails })
  }).catch((err) => {
    next(err)
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
})

router.get('/error',(req,res)=>{
  res.render('error',{layout:false})
})

module.exports = router;
