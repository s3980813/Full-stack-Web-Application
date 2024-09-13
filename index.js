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

// Set up storage and file naming for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/Images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Save file with timestamp
  }
});

// File upload middleware
const upload = multer({ storage: storage });

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
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('home', { user, accountType });  // Pass user and accountType to the home page
});

app.get('/contact', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('contact', { user, accountType });
});

app.get('/aboutUs', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('aboutUs', { user, accountType });
});

//render add course page
app.get('/addCourse', upload.single('picture'), async (req, res) => {
  accountType = req.session.accountType
  userID = req.session.userID
  try {
    if (accountType === 'teacher') {
      const teachers = await Teacher.findOne({ _id: req.session.userID });
      res.render('addCourse', { teachers: teachers });
    }
  } catch (err) {
    res.status(400).render('addCourse', { error: "cannot display data" });
  }
});


//Allow teacher role to post data from the add course form to the database
app.post('/addCourse', async (req, res) => {
  const { name, price, description, instructor, category } = req.body;

  // Access uploaded file
  const picture = req.file ? `/Images/${req.file.filename}` : null;

  if (!picture) {
    return res.status(400).send("Course image (picture) is required.");
  }

  const newCourse = new Course({
    name,
    picture,
    price,
    description,
    instructor: req.session.userID,
    category
  });
  try {
    await newCourse.save();
    res.send("Course added successfully!");
    res.redirect('/coursedetail');
  } catch (err) {
    console.error(err);
    res.send("Failed to add the course.");
  }
})

app.get('/coursedetail', (req, res) => {
  res.render('coursedetail');
});

app.get('/FAQs', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('FAQs', { user, accountType });
});

app.get('/inprofile', async (req, res) => {
  const accountType = req.session.accountType;
  const userID = req.session.userID;

  try {
    if (accountType === 'teacher') {
      // Fetch the teacher's details
      const teachers = await Teacher.findOne({ _id: userID });

      if (!teachers) {
        return res.status(404).render('inprofile', { error: 'Teacher not found', teachers: null, courses: [] });
      }

      // Fetch all courses by this teacher
      const courses = await Course.find({ instructor: userID });

      // Render the profile page with teacher and course details
      res.render('inprofile', { teachers, courses });
    } else {
      res.status(403).send('Access denied. Only teachers can view this page.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('inprofile', { error: 'Error retrieving data', teachers: null, courses: [] });
  }
});

// app.get('/profile', async (req, res) => {
//   userID = req.session.userID
//   accountType = req.session.accountType
//   try {
//     if (accountType === 'learner') {
//       const learners = await Learner.findOne({ _id: req.session.userID });
//       res.render('profile', { learners: learners });
//     }
//   } catch (err) {
//     res.status(400).render('profile', { error: "cannot display data" });
//   }
// });

app.get('/profile', async (req, res) => {
  const learners = req.session.learners;  // Get learner data from session
  const accountType = req.session.accountType;

  if (!learners) {
    return res.redirect('/login');  // Redirect to login if not logged in
  }

  res.render('profile', { learners, accountType });  // Pass learners and accountType
});

app.get('/inprofile', async (req, res) => {
  const teachers = req.session.teachers;  // Get learner data from session
  const accountType = req.session.accountType;

  if (!teachers) {
    return res.redirect('/login');  // Redirect to login if not logged in
  }

  res.render('inprofile', { teachers, accountType });  // Pass learners and accountType
});

app.get('/thankyou', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('thankyou', { user, accountType });
});

app.get('/browseCourse', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('browseCourse', { user, accountType });
});

app.get('/signup', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('signup', { user, accountType });
});

app.get('/login', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('login', { user, accountType });
});

app.get('/profile', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;

  if (!user) {
    return res.redirect('/login');  // Redirect to login if not logged in
  }

  res.render('profile', { learner: user, user, accountType });  // Pass user and accountType
});

// app.post('/signup', async (req, res) => {
//   const { email, password, phone, city, street, firstName, lastName, accountType, country, schoolName, jobTitle, specialization } = req.body;
//   const address = street + " " + city;

//   try {
//     // Check if the email already exists in either Learner or Teacher collection
//     const existingLearner = await Learner.findOne({ email });
//     const existingTeacher = await Teacher.findOne({ email });

//     if (existingLearner || existingTeacher) {
//       // Email already exists, re-render signup page with error
//       return res.status(400).render('signup', { error: 'Email already exists' });
//     }

//     // Proceed with creating learner or teacher
//     if (accountType === 'learner') {
//       await Learner.create({ email, password, address, firstName, lastName, phone });
//     } else if (accountType === 'teacher') {
//       await Teacher.create({ email, password, address, firstName, lastName, phone, schoolName, jobTitle, specialization });
//     }

//     res.status(200).redirect('/login');  // Redirect to login page after successful signup
//   } catch (err) {
//     console.log(err);
//     return res.status(500).render('signup', { error: 'Server error, please try again later' });
//   }
// });

// Signup route with picture upload
app.post('/signup', upload.single('picture'), async (req, res) => {
  const { email, password, phone, city, street, firstName, lastName, accountType } = req.body;
  const address = `${street}, ${city}`;
  const picture = req.file ? `/images/${req.file.filename}` : 'profile-1.png';

  try {
    const existingLearner = await Learner.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });

    if (existingLearner || existingTeacher) {
      return res.status(400).render('signup', { error: 'Email already exists' });
    }

    if (accountType === 'learner') {
      await Learner.create({ email, password, address, firstName, lastName, phone, picture });
    } else if (accountType === 'teacher') {
      // Handle teacher registration here
    }

    res.status(200).redirect('/login');
  } catch (err) {
    console.log(err);
    return res.status(500).render('signup', { error: 'Server error, please try again later' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password, accountType } = req.body;

  try {
    let user;

    // Check if the account type is learner
    if (accountType === 'learner') {
      user = await Learner.findOne({ email });
      if (!user) {
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      req.session.userID = user._id;
      req.session.learners = user; // Store learner data in session
      req.session.accountType = 'learner'; // Store account type in session
      console.log(req.session.accountType)
      return res.redirect('/');  // Redirect to homepage after login
    }

    // Check if the account type is teacher
    if (accountType === 'teacher') {
      user = await Teacher.findOne({ email });
      if (!user) {
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      req.session.userID = user._id;
      req.session.teachers = user; // Store teacher data in session
      req.session.accountType = 'teacher'; // Store account type in session
      console.log(req.session.accountType)
      return res.redirect('/');  // Redirect to homepage after login
    }

    // If account type doesn't match, return error
    return res.status(400).render('login', { error: 'Please select the correct account type' });

  } catch (err) {
    console.error(err);
    return res.status(500).render('login', { error: 'Internal Server Error' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  // Destroy the session and redirect to homepage
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/'); // Redirect to homepage
  });
});

// Route to browse courses by name
app.get('/browse/name', async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 }); // Sort courses alphabetically by name
    res.render('browseCourse', { courses, browseBy: 'name', user: req.session.user, accountType: req.session.accountType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching courses');
  }
});

// Route to browse courses by category
app.get('/browse/category', async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor'); // Fetch courses with instructor details
    // Group courses by category
    const categories = {};
    courses.forEach(course => {
      const category = course.category || 'Uncategorized'; // Handle missing category
      if (!categories[category]) categories[category] = [];
      categories[category].push(course);
    });
    res.render('browseCourse', { categories, browseBy: 'category', user: req.session.user, accountType: req.session.accountType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching courses');
  }
});

// Forgot password route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    let user = await Learner.findOne({ email }) || await Teacher.findOne({ email });

    if (!user) {
      // Render the styled error message page
      return res.render('errorMessage', { errorMessage: "No account associated with that email address." });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ email }, 'your-secret-key', { expiresIn: '1h' });
    const resetLink = `http://localhost:${port}/reset-password/${resetToken}`;

    // Render a styled page with the reset link
    res.render('resetLink', { resetLink });
  } catch (error) {
    console.error(error);
    res.status(500).render('errorMessage', { errorMessage: "Error generating reset link." });
  }
});

// Reset password route (for demonstration purposes, this will just display the link)
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    const email = decoded.email;

    // For demonstration, just display the decoded email
    res.send(`Password reset for email: ${email}. You can now change your password.`);
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired reset token.");
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






