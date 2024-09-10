const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Agenda = require('agenda');
const bodyParser = require('body-parser')

// Importing routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const learnerRoutes = require('./src/routes/learnerRoutes');
const teacherRoutes = require('./src/routes/teacherRoutes');

// Importing middleware
const { requireAuth, checkUser } = require('./src/middlewares/authMiddleware');
const { getUserById, getCourseById, getTeacherById, getLearnerById } = require('./src/middlewares/nameMiddleware');



// Importing models
const Learner = require('./src/models/learnerModel');
const Teacher = require('./src/models/teacherModel');
const Admin = require('./src/models/adminModel');
const Course = require('./src/models/courseModel');


const app = express();
const port = 8000;

// Setting up Body-Parser for reading form
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));


// Checking user for all routes
app.get('*', checkUser);

// Setting up session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 24 * 24 * 7,
      secure: false
    },
  })
);

// Setting up routes
app.use(authRoutes);
app.use(courseRoutes);
app.use(learnerRoutes);


// Database Connection
const mongoURI = 'mongodb+srv://Creasic:wY3v3xh7FuM059vM@cluster0.c0ofkzi.mongodb.net/test';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.log(error.message));

// Middleware for image upload
const userImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, 'your-secret-key');
    const userId = decodedToken.id;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const newFilename = `${formattedDate}-${file.originalname}`;
    cb(null, newFilename);
  }
});
const userImgUpload = multer({ storage: userImgStorage });

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  var password = req.body.password
  var email = req.body.email
  var phone = req.body.phone
  var address = req.body.address
  var picture = req.body.profilePicture
  var type = req.body.accountType
  var firstName = req.body.firstName
  var lastName = req.body.lastName
  console.log(email, password, type)
  if (type === 'learner') {
    Learner.findOne({
      email: email
    })
      .then(data => {
        if (data) {
          res.send("tài khoản đã tồn tại")
        } else {
          return Learner.create({ firstName: firstName, lastName: lastName, password: password, email: email, phone: phone, picture: picture, address: address })
        }
      })//thay vì viết .then trong user.create thì xài return thì nguyên function data.then res.json thành công
      .then(data => {
        res.json("tạo tài khoản thành công")
      })
      .catch(err => {
        res.json("thất bại")
      })
  }
  if (type === 'instructor') {
    Teacher.findOne({
      email: email
    })
      .then(data => {
        if (data) {
          res.send("tài khoản đã tồn tại")
        } else {
          return Teacher.create({ firstName: firstName, lastName: lastName, password: password, email: email, phone: phone, picture: picture, address: address })
        }
      })//thay vì viết .then trong user.create thì xài return thì nguyên function data.then res.json thành công
      .then(data => {
        res.json("tạo tài khoản thành công")
      })
      .catch(err => {
        res.json("thất bại")
      })
  }
});
app.get('/aboutUs', (req, res) => {
  res.render('aboutUs');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
