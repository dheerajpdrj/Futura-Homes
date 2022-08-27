let express = require('express');
const { response, addListener } = require('../app');
let router = express.Router();
let adminauthentication = require('../authentication/adminauthentication');
const adminhelper = require('../helpers/adminhelper');
const categorymodel = require('../model/categorymodel');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.adminloggedin) {
    res.render('admin/adminhome', { layout: 'adminlayout' })
  } else {
    res.redirect('/admin/login')
  }
});


router.get('/login', (req, res) => {

  if (req.session.adminloggedin) {
    res.redirect('/admin/')
  } else {
    let error = req.session.loginerr
    req.session.loginerr = null
    res.render('admin/adminLogin', { error, usertemplate: true });
  }

})

router.post('/login', (req, res) => {
  // adminauthentication.adminSignup(req.body).then((response)=>{
  //   res.redirect('/admin/adminhome')
  // })

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
})


router.get("/usermanagement", (req, res) => {
  adminhelper.getAllUser().then((users) => {
    console.log(users);
    res.render("admin/usermanagement", { users, layout: 'adminlayout' })
  })
})

router.get('/change-status/:id', (req, res) => {
  adminhelper.editUser(req.params.id).then((response) => {
    res.redirect('/admin/usermanagement')
  })
})


router.get('/products', (req, res) => {


  adminhelper.getAllProducts().then((allproducts) => {
    adminhelper.getAllCategory().then((category) => {
      console.log(category)
      res.render('admin/viewProduct', { allproducts, category, layout: 'adminlayout' })
    })
  })
})

router.post('/products/addproduct', (req, res) => {
  adminhelper.addProduct(req.body).then((data) => {
    let image = req.files.Image
    image.mv('public/product-images/' + data._id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/products')
      } else {
        console.log(err);
      }
    })

  })
});


router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id
  adminhelper.deleteProduct(prodId).then((response) => {
    res.redirect('/admin/products')
  })

})


// router.get('/editproduct/:id', async (req, res) => {
//   adminhelper.getProductDetails(req.params.id).then((product) => {
//     adminhelper.getAllCategory().then((category) => {
//       res.render('admin/edit-Product', { product, category, layout: 'adminlayout' })
//     })
//   })

// })

router.post('/editproduct/:id', (req, res) => {
  let image = req.files.Image
  let id = req.params.id
  console.log(req.body);
  console.log(req.params.i);
  adminhelper.updateProduct(id, req.body).then((response) => {
    if (req.files.Image) {
      image.mv('public/product-images/' + id + '.jpg')
    }
    res.redirect('/admin/products')
  })
})

router.get('/banner', (req, res) => {
  adminhelper.getAllBanner().then((allbanner) => {
    adminhelper.getAllProducts().then((product) => {
      res.render('admin/banner', { allbanner, product, layout: 'adminlayout' })
    })

  })

})


router.post('/addbanner', (req, res) => {
  adminhelper.addBanner(req.body).then((response) => {
    let image = req.files.Image
    image.mv('public/product-images/' + response._id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/banner')
      } else {
        console.log(err);
      }
    })
  })

})



router.get('/deletebanner/:id', (req, res) => {
  let id = req.params.id
  adminhelper.deleteBanner(id).then((response) => {
    res.redirect('/admin/banner')
  })
})

// router.get('/editbanner/:id', (req, res) => {
//   let id = req.params.id
//   adminhelper.getBannerDetails(id).then((bannerdata) => {
//     res.render('admin/edit-banner', { bannerdata, layout: 'adminlayout' })
//   })
// })


router.post('/editbanner/:id', (req, res) => {
  let id = req.params.id;
  let image = req.files.Image;
  adminhelper.updateBanner(id, req.body).then((response) => {
    res.redirect('/admin/banner')
    if (image) {
      image.mv('public/product-images/' + id + '.jpg')
    }

  })
})




// ..................Category.....................

router.get('/category', (req, res) => {
  adminhelper.getAllCategory().then((response) => {
    let categoryerror=req.session.categoryexist
    req.session.categoryexist=null
    res.render('admin/category', { categoryerror, response, layout: 'adminlayout' })
  })

})

router.post('/category', (req, res) => {
  let image = req.files.CategoryImage;
  adminhelper.addCategory(req.body).then((response) => {
    if (response.categoryexist) {
      req.session.categoryexist=true;
      res.redirect('/admin/category')
    } else {
      console.log(response);
      res.redirect('/admin/category')
      if (image) {
        image.mv('public/product-images/' + response.category._id + '.jpg')
      }
    }
  })
})

router.get('/deletecategory/:id', (req, res) => {
  let id = req.params.id
  adminhelper.deleteCategory(id).then((response) => {
    res.redirect('/admin/category')
  })
})


// router.get('/editcategory/:id',(req,res)=>{
//   let id= req.params.id
//   adminhelper.getCategorydetails(id).then((categorydetail)=>{
//     console.log((categorydetail));

//     res.render('admin/edit-category',{ admintemplate:true,categorydetail,layout:'adminlayout'})
//   })
// })


router.post('/editcategory/:id', (req, res) => {
 
  let id = req.params.id;
  let image = req.files.Image;
  console.log(image);
  console.log(id);
  adminhelper.editCategory(id, req.body).then((response) => {
    if (image) {
      image.mv('public/product-images/' + response._id + '.jpg')
    }
    res.redirect('/admin/category')
  })
})

router.get('/coupon', (req, res) => {
  adminhelper.getallCoupon().then((allcoupons) => {
    res.render('admin/coupon', { admintemplate: true, allcoupons, layout: 'adminlayout' })
  })
})

router.post('/coupon', (req, res) => {
  adminhelper.addCoupon(req.body).then((response) => {
    res.redirect('/admin/coupon')
  })
})

router.get('/deletecoupon/:id', (req, res) => {
  adminhelper.deleteCoupon(req.params.id).then((response) => {
    res.redirect('/admin/coupon')
  })
})

router.post('/editcoupon/:id', (req, res) => {
  adminhelper.editCoupon(req.params.id, req.body).then((coupon) => {
    res.redirect('/admin/coupon')
  })
})

router.get('/orders',(req,res)=>{
  adminhelper.getAllOrders().then((allorders)=>{
    console.log(allorders,'geoooooooo');
    res.render('admin/ordermanagement',{layout:'adminlayout', allorders})
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
})

module.exports = router;
