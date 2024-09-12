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


// Importing models
const Learner = require('./src/models/learnerModel');
const Teacher = require('./src/models/teacherModel');
const Course = require('./src/models/courseModel');
const { errorMonitor } = require('events');


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


// // Checking user for all routes
// app.get('*', checkUser);

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
// app.use(authRoutes);
// app.use(courseRoutes);
// app.use(learnerRoutes);
// app.use('/teacher',teacherRoutes);


// Database Connection
const mongoURI = 'mongodb+srv://Creasic:wY3v3xh7FuM059vM@cluster0.c0ofkzi.mongodb.net/test';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.log(error.message));


app.get('/', (req, res) => {
  res.render("home");
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/aboutUs', (req, res) => {
  res.render('aboutUs');
});

app.get('/addCourse', (req, res) => {
  res.render('addCourse');
});

app.get('/coursedetail', (req, res) => {
  res.render('coursedetail');
});

app.get('/FAQs', (req, res) => {
  res.render('FAQs');
});

app.get('/inprofile', (req, res) => {
  res.render('inprofile');
});

app.get('/profile', async (req, res) => {
  try {
    const learners = await Learner.find({});
    res.render('profile', { learners: learners });
  } catch (err) {
    res.status(400).render('profile', { error: "cannot display data" });
  }
});

app.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});
// app.post('/login',(req,res)=>{
//   // var type = req.body.type
//   var email = req.body.email
//   var password = req.body.password
//   console.log(email,password)
//   Learner.findOne({
//     email:email,
//     password:password
//   }).then(()=>{
//     res.render('home')
//   }).catch(err=>{
//     console.log(err)
//     res.json("wrong")
//   })
// })

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  // Assuming the user in session is either a learner or a teacher
  const learner = req.session.user;  // Retrieve the logged-in user from the session

  // Pass the user to the profile template
  res.render('/', { learner });
});

app.post('/signup', async (req, res) => {
  const { email, password, phone, city, street, firstName, lastName, accountType, country, schoolName, jobTitle, specialization } = req.body;
  const address = street + " " + city;

  try {
    // Check if the email already exists in either Learner or Teacher collection
    const existingLearner = await Learner.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });

    if (existingLearner || existingTeacher) {
      // Email already exists, re-render signup page with error
      return res.status(400).render('signup', { error: 'Email already exists' });
    }

    // Proceed with creating learner or teacher
    if (accountType === 'learner') {
      await Learner.create({ email, password, address, firstName, lastName, phone });
    } else if (accountType === 'teacher') {
      await Teacher.create({ email, password, address, firstName, lastName, phone, schoolName, jobTitle, specialization });
    }

    res.status(200).redirect('/login');  // Redirect to login page after successful signup
  } catch (err) {
    console.log(err);
    return res.status(500).render('signup', { error: 'Server error, please try again later' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password, accountType } = req.body;

  try {
    let user;

    if (accountType === 'learner') {
      user = await Learner.findOne({ email });
      if (!user) {
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      req.session.user = user; // Store learner in session
      return res.redirect('/');  // Redirect to profile page
    }

    if (accountType === 'teacher') {
      user = await Teacher.findOne({ email });
      if (!user) {
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      req.session.user = user; // Store teacher in session
      return res.redirect('/inhome');  // Redirect to profile page
    }

    // If account type doesn't match, return error
    return res.status(400).render('login', { error: 'Please select the correct account type' });

  } catch (err) {
    console.error(err);
    return res.status(500).render('login', { error: 'Internal Server Error' });
  }
});




app.get('/learner/coursedetail', (req, res) => {
  res.render('coursedetail')
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



// / Middleware for image upload
// const userImgStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/images/');
//   },
//   filename: function (req, file, cb) {
//     const token = req.cookies.jwt;
//     const decodedToken = jwt.verify(token, 'your-secret-key');
//     const userId = decodedToken.id;
//     const date = new Date();
//     const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
//     const newFilename = `${formattedDate}-${file.originalname}`;
//     cb(null, newFilename);
//   }
// });
// const userImgUpload = multer({ storage: userImgStorage });


// app.get('/register', (req, res) => {
//   res.render('register');
// });

// app.post('/register', (req, res) => {
//   var password = req.body.password
//   var email = req.body.email
//   // var phone = req.body.phone
//   // var address = req.body.address
//   // var picture = req.body.profilePicture
//   var type = req.body.accountType
//   // var firstName = req.body.firstName
//   // var lastName = req.body.lastName
//   console.log(email, password, type)
//   if (type === 'learner') {
//     Learner.findOne({
//       email: email
//     })
//       .then(data => {
//         if (data) {
//           res.send("tài khoản đã tồn tại")
//         } else {
//           return Learner.create({password: password, email: email})
//         }
//       })//thay vì viết .then trong user.create thì xài return thì nguyên function data.then res.json thành công
//       .then(data => {
//         res.json("tạo tài khoản thành công")
//       })
//       .catch(err => {
//         res.json("thất bại")
//       })
//   }
//   if (type === 'instructor') {
//     Teacher.findOne({
//       email: email
//     })
//       .then(data => {
//         if (data) {
//           res.send("tài khoản đã tồn tại")
//         } else {
//           return Teacher.create({ password: password, email: email })
//         }
//       })//thay vì viết .then trong user.create thì xài return thì nguyên function data.then res.json thành công
//       .then(data => {
//         res.json("tạo tài khoản thành công")
//       })
//       .catch(err => {
//         res.json("thất bại")
//       })
//   }
// });


// app.get('/teacher/:id', async (req, res) => {
//   try {
//       const teacher = await Teacher.findById(req.params.id);

//       if (!teacher) {
//           return res.status(404).send('Teacher not found');
//       }

//       console.log(teacher);  // Log the teacher object

//       const newCourses = await Course.find({ instructor: teacher._id }).sort({ dateCreated: -1 }).limit(5);
//       const allCourses = await Course.find({ instructor: teacher._id });

//       res.render('inprofile', { teacher, newCourses, allCourses });
//   } catch (error) {
//       console.error(error);
//       res.status(500).send('Server Error');
//   }
// });






