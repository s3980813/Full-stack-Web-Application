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

// Importing routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');

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

// Database Connection
const mongoURI = 'mongodb+srv://Creasic:wY3v3xh7FuM059vM@cluster0.c0ofkzi.mongodb.net/test';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.log(error.message));

// Middleware for image upload
const userImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/images/');
  },
  filename: function (req, file, cb) {
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, 'your-secret-key');
    const userId = decodedToken.id;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const newFilename = `${formattedDate}-${userId}-${file.originalname}`;
    cb(null, newFilename);
  }
});

const userImgUpload = multer({ storage: userImgStorage });

app.get('/', (req, res) => {
  res.render("home");
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});