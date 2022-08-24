let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let hbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const MongodbSession = require('connect-mongodb-session')(session)
const fileupload = require('express-fileupload')

let adminRouter = require('./routes/admin');
let usersRouter = require('./routes/users');
const { quantityMinus } = require('./helpers/userhelper');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(fileupload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/',
helpers:{
  subTotal:function (price, quantity){
    return price * quantity;
  },
  total:(subtotal,discount)=>{
    return subtotal - discount
  },
  json:(obj)=>{
    return JSON.stringify(obj)
  },

} }))


//mongoose connecting

const mongoURI = "mongodb://localhost:27017/futura";
mongoose.connect(mongoURI).then((res) => {
  console.log("mongodb connected")
})
const store = new MongodbSession({
  uri: mongoURI,
  collection: 'mySessions',
})

// session
const time = 3600000;
app.use(session({
  secret: "thisismysecrctekey",
  saveUninitialized: true,
  cookie: { maxAge: time },
  resave: false,
  store: store
}));

app.use(function (req, res, next) {
  if (!req.session.userlogedin) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
