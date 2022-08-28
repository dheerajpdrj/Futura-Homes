let express = require('express');
const { response, addListener } = require('../app');
let router = express.Router();
let adminauthentication = require('../authentication/adminauthentication');
const adminhelper = require('../helpers/adminhelper');
const categorymodel = require('../model/categorymodel');

/* GET home page. */
router.get('/', function (req, res, next) {
  try {
    if (req.session.adminloggedin) {
      res.render('admin/adminhome', { layout: 'adminlayout' })
    } else {
      res.redirect('/admin/login')
    }
  } catch (err) {
    err.admin = true
    next(err)
  }
});


router.get('/login', (req, res, next) => {
  try {
    if (req.session.adminloggedin) {
      res.redirect('/admin/')
    } else {
      let error = req.session.loginerr
      req.session.loginerr = null
      res.render('admin/adminLogin', { error, usertemplate: true });
    }
  } catch (err) {
    err.admin = true
    next(err)
  }
})

router.post('/login', (req, res, next) => {
  // adminauthentication.adminSignup(req.body).then((response)=>{
  //   res.redirect('/admin/adminhome')
  // })
  try {
    adminauthentication.adminlogin(req.body).then((response) => {
      if (response.loginstatus) {
        req.session.adminloggedin = true
        req.session.admin = response.admin
        res.redirect('/admin')
      } else {
        req.session.loginerr = 'Invalid Username or Password'
        res.redirect('/admin/login')
      }
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})


router.get("/usermanagement", (req, res, next) => {
  try {
    adminhelper.getAllUser().then((users) => {
      console.log(users);
      res.render("admin/usermanagement", { users, layout: 'adminlayout' })
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})

router.get('/change-status/:id', (req, res, next) => {
  try {
    adminhelper.editUser(req.params.id).then((response) => {
      res.redirect('/admin/usermanagement')
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})


router.get('/products', (req, res, next) => {
  try {
    adminhelper.getAllProducts().then((allproducts) => {
      adminhelper.getAllCategory().then((category) => {
        console.log(category)
        res.render('admin/viewProduct', { allproducts, category, layout: 'adminlayout' })
      })
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})

router.post('/products/addproduct', (req, res, next) => {
  try {
    adminhelper.addProduct(req.body).then((data) => {
      let image = req.files.Image
      if (req.files) {
        if (image) {
          image.mv('public/product-images/' + data._id + '.jpg', (err, done) => {
            if (!err) {
              res.redirect('/admin/products')
            } else {
              console.log(err);
            }
          })
        }
      }
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
});


router.get('/delete-product/:id', (req, res, next) => {
  try {
    let prodId = req.params.id
    adminhelper.deleteProduct(prodId).then((response) => {
      res.redirect('/admin/products')
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})


// router.get('/editproduct/:id', async (req, res, next) => {
//   adminhelper.getProductDetails(req.params.id).then((product) => {
//     adminhelper.getAllCategory().then((category) => {
//       res.render('admin/edit-Product', { product, category, layout: 'adminlayout' })
//     })
//   })

// })

router.post('/editproduct/:id', (req, res, next) => {
  try {
    let image = req.files.Image
    let id = req.params.id
    console.log(req.body);
    console.log(req.params.i);
    adminhelper.updateProduct(id, req.body).then((response) => {
      if (req.files) {
        if (image) {
          image.mv('public/product-images/' + id + '.jpg')
        }
      }
      res.redirect('/admin/products')
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})

router.get('/banner', (req, res, next) => {
  try {
    adminhelper.getAllBanner().then((allbanner) => {
      adminhelper.getAllProducts().then((product) => {
        res.render('admin/banner', { allbanner, product, layout: 'adminlayout' })
      })
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})


router.post('/addbanner', (req, res, next) => {
  adminhelper.addBanner(req.body).then((response) => {
    try {
      let image = req.files.Image
      if (req.files) {
        image.mv('public/product-images/' + response._id + '.jpg', (err, done) => {
          if (!err) {
            res.redirect('/admin/banner')
          } else {
            console.log(err);
          }
        })
      }
    } catch {
      err.admin = true
    next(err)
    }
  })

})



router.get('/deletebanner/:id', (req, res, next) => {
  try {
    let id = req.params.id
    adminhelper.deleteBanner(id).then((response) => {
      res.redirect('/admin/banner')
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})

// router.get('/editbanner/:id', (req, res, next) => {
//   let id = req.params.id
//   adminhelper.getBannerDetails(id).then((bannerdata) => {
//     res.render('admin/edit-banner', { bannerdata, layout: 'adminlayout' })
//   })
// })


router.post('/editbanner/:id', (req, res, next) => {
  try {
    let id = req.params.id;
    let image = req.files.Image;
    adminhelper.updateBanner(id, req.body).then((response) => {
      res.redirect('/admin/banner')
      if (req.files) {
        if (image) {
          image.mv('public/product-images/' + id + '.jpg')
        }
      }
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})




// ..................Category.....................

router.get('/category', (req, res, next) => {
  try {
    adminhelper.getAllCategory().then((response) => {
      let categoryerror = req.session.categoryexist
      req.session.categoryexist = null
      res.render('admin/category', { categoryerror, response, layout: 'adminlayout' })
    })
  } catch (err) {
    err.admin = true
    next(err)
  }
})

router.post('/category', (req, res, next) => {
  try{
  let image = req.files.CategoryImage;
  adminhelper.addCategory(req.body).then((response) => {
    if (response.categoryexist) {
      req.session.categoryexist = true;
      res.redirect('/admin/category')
    } else {
      console.log(response);
      res.redirect('/admin/category')
      if (req.files) {
        if (image) {
          image.mv('public/product-images/' + response.category._id + '.jpg')
        }
      }
    }
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.get('/deletecategory/:id', (req, res, next) => {
  try{
  let id = req.params.id
  adminhelper.deleteCategory(id).then((response) => {
    res.redirect('/admin/category')
  })
}catch(err){
  err.admin = true
    next(err)
}
})


// router.get('/editcategory/:id',(req,res)=>{
//   let id= req.params.id
//   adminhelper.getCategorydetails(id).then((categorydetail)=>{
//     console.log((categorydetail));

//     res.render('admin/edit-category',{ admintemplate:true,categorydetail,layout:'adminlayout'})
//   })
// })


router.post('/editcategory/:id', (req, res, next) => {
try{
  let id = req.params.id;
  let image = req.files.Image;
  adminhelper.editCategory(id, req.body).then((response) => {
    if (req.files) {
      if (image) {
        image.mv('public/product-images/' + response._id + '.jpg')
      }
    }
    res.redirect('/admin/category')
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.get('/coupon', (req, res, next) => {
  try{
  adminhelper.getallCoupon().then((allcoupons) => {
    res.render('admin/coupon', { admintemplate: true, allcoupons, layout: 'adminlayout' })
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.post('/coupon', (req, res, next) => {
  try{
  adminhelper.addCoupon(req.body).then((response) => {
    res.redirect('/admin/coupon')
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.get('/deletecoupon/:id', (req, res, next) => {
  try{
  adminhelper.deleteCoupon(req.params.id).then((response) => {
    res.redirect('/admin/coupon')
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.post('/editcoupon/:id', (req, res, next) => {
  try{
  adminhelper.editCoupon(req.params.id, req.body).then((coupon) => {
    res.redirect('/admin/coupon')
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.get('/orders', (req, res, next) => {
  try{
  adminhelper.getAllOrders().then((allorders) => {
    res.render('admin/ordermanagement', { layout: 'adminlayout', allorders })
  })
}catch(err){
  err.admin = true
    next(err)
}
})

router.post('/changeShipping/:id', (req, res, next) => {
  try{
  let id = req.params.id
  adminhelper.changeShipping(id, req.body).then((response) => {
    res.redirect('/admin/orders')
  })
}catch(err){
  err.admin = true
    next(err)
}
})


router.get("/salesReportChart", (req, res, next) => {
  try{
  adminhelper.getAllOrders().then((orders) => {
    res.json({ orders });
  });
}catch(err){
  err.admin = true
    next(err)
}
});

router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/admin')
})

router.use((req,res,next)=>{
  let err={}
  err.admin = true
  next(err)
})

module.exports = router;
