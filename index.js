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
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    // const date = new Date();
    // const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    // const newFilename = `${formattedDate}-${file.originalname}`;
    cb(null, file.originalname);  // Save file with timestamp
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


  app.get('/', async (req, res) => {
    const user = req.session.user;
    const accountType = req.session.accountType;
    const message = req.session.message || null; // Check for any message in the session

    try {
        // Fetch new instructors (limit to 5 for demonstration purposes)
        const newInstructors = await Teacher.find().sort({ dateCreated: -1 }).limit(5);

        // Fetch new courses (limit to 5 for demonstration purposes)
        const newCourses = await Course.find().sort({ dateCreated: -1 }).populate('instructor').limit(5);

        // Fetch featured instructors (this could be a subset of instructors based on criteria)
        const featuredInstructors = await Teacher.find().limit(3); // Modify query as needed

        // Fetch featured courses (this could be a subset of courses based on criteria)
        const featuredCourses = await Course.find().populate('instructor').limit(3); // Modify query as needed

        // Clear the message from the session after displaying it
        req.session.message = null;

        // Render the home page with real data
        res.render('home', {
            user,
            accountType,
            message,
            newInstructors,
            newCourses,
            featuredInstructors,
            featuredCourses
        });
    } catch (error) {
        console.error('Error fetching data for homepage:', error);
        res.status(500).send('Server Error');
    }
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

// render add course page
app.get('/addCourse', async (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  const userID = req.session.userID;

  try {
      if (accountType === 'teacher') {
          const teachers = await Teacher.findOne({ _id: userID });
          if (!teachers) {
              return res.status(404).render('addCourse', { error: 'Teacher not found', accountType, user });
          }
          res.render('addCourse', { teachers, accountType, user });
      } else {
          res.redirect('/'); // Redirect if not a teacher
      }
  } catch (err) {
      console.error(err);
      res.status(500).render('addCourse', { error: 'Cannot load the page', accountType, user });
  }
});


// Handle course form submission (POST)
app.post('/addCourse', upload.single('picture'), async (req, res) => {
  const { name, price, description, category } = req.body;
  const instructor = req.session.userID;
  const accountType = req.session.accountType; // Retrieve accountType from session
  const picture = req.file ? `/images/${req.file.filename}` : 'course.jpg';

  try {
    if (accountType === 'teacher') { // Ensure accountType is checked
      const newCourse = await Course.create({
        name,
        price,
        description,
        instructor,
        category,
        picture
      });

      // Redirect to the course details page
      res.redirect(`/coursedetail/${newCourse._id}`);
    } else {
      res.status(403).send('Only teachers can add courses.');
    }
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).send('Failed to add the course.');
  }
});



// Allow teacher role to post data from the add course form to the database
app.post('/login', async (req, res) => {
  const { email, password, accountType } = req.body;

  try {
    let user;

    // For learner account type
    if (accountType === 'learner') {
      user = await Learner.findOne({ email }).lean(); // Use lean to get a plain object
      if (!user) {
        console.log('Learner not found');
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password for learner');
        return res.status(400).render('login', { error: 'Invalid email or password for learner' });
      }
      req.session.userID = user._id;
      req.session.user = user; // Ensure this is now a plain object
      req.session.accountType = 'learner'; // Set account type
      console.log('User set in session:', req.session.user);
      return res.redirect('/');
    }

    // For teacher account type
    if (accountType === 'teacher') {
      user = await Teacher.findOne({ email }).lean(); // Use lean to get a plain object
      if (!user) {
        console.log('Teacher not found');
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password for instructor');
        return res.status(400).render('login', { error: 'Invalid email or password for instructor' });
      }
      req.session.userID = user._id;
      req.session.user = user; // Ensure this is now a plain object
      req.session.accountType = 'teacher'; // Set account type
      console.log('User set in session:', req.session.user);
      return res.redirect('/');
    }

    // If account type doesn't match, return error
    return res.status(400).render('login', { error: 'Please select the correct account type' });

  } catch (err) {
    console.error(err);
    return res.status(500).render('login', { error: 'Internal Server Error' });
  }
});


app.get('/coursedetail/:courseId', async (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType; // Get accountType from session
  const courseId = req.params.courseId;

  try {
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Pass course, accountType, and user to the template
    res.render('coursedetail', { course, accountType, user });
  } catch (err) {
    console.error('Error fetching course details:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/FAQs', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('FAQs', { user, accountType });
});

// app.get('/inprofile', async (req, res) => {
//   const accountType = req.session.accountType;
//   const userID = req.session.userID;

//   try {
//     if (accountType === 'teacher') {
//       // Fetch the teacher's details
//       const teachers = await Teacher.findOne({ _id: userID });

//       if (!teachers) {
//         return res.status(404).render('inprofile', { error: 'Teacher not found', teachers: null, courses: [] });
//       }

//       // Fetch all courses by this teacher
//       const courses = await Course.find({ instructor: userID });

//       // Render the profile page with teacher and course details
//       res.render('inprofile', { teachers, courses });
//     } else {
//       res.status(403).send('Access denied. Only teachers can view this page.');
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).render('inprofile', { error: 'Error retrieving data', teachers: null, courses: [] });
//   }
// });


app.get('/profile', async (req, res) => {
  const learner = req.session.user;  // Use req.session.user
  const accountType = req.session.accountType;

  if (!learner) {
    return res.redirect('/login');  // Redirect to login if not logged in
  }

  res.render('profile', { learner, accountType });  // Pass learner to the view
});

// app.get('/inprofile', (req, res) => {
//   const teacher = {
//     firstName: 'John',
//     lastName: 'Doe',
//     picture: 'default-avatar.jpg',
//     jobTitle: 'Instructor',
//     specialization: ['Programming', 'Web Development']
//   };

//   // Ensure the 'teacher' object is passed correctly
//   res.render('inprofile', { teacher });
// });

app.get('/inprofile/:teacherId', async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
      // Fetch the teacher's details
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
          return res.status(404).render('inprofile', { error: 'Teacher not found', teacher: null, newCourses: [], allCourses: [] });
      }

      // Fetch all courses by this teacher
      const allCourses = await Course.find({ instructor: teacherId }).sort({ dateCreated: -1 });

      // Divide into newCourses (latest 5) and allCourses
      const newCourses = allCourses.slice(0, 5);  // Get up to 5 newest courses

      // Check if the current user is the owner of this profile
      const isOwner = req.session.accountType === 'teacher' && req.session.userID.toString() === teacherId.toString();

      // Render the profile page with teacher and course details
      res.render('inprofile', { teacher, newCourses, allCourses, isOwner });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).render('inprofile', { error: 'Error retrieving data', teacher: null, newCourses: [], allCourses: [] });
  }
});


app.get('/thankyou', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;
  res.render('thankyou', { user, accountType });
});

app.get('/browseCourse', (req, res) => {
  const user = req.session.user;
  const accountType = req.session.accountType;

  // Set a default 'browseBy' value for the browseCourse page
  res.render('browseCourse', { user, accountType, browseBy: 'name', courses: [] });
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


// Signup route with picture upload
app.post('/signup', upload.single('picture'), async (req, res) => {
  const { email, password, phone, city, street, firstName, lastName, accountType, schoolName, jobTitle, specialization } = req.body;
  const address = `${street}, ${city}`;
  const picture = req.file ? `/images/${req.file.filename}` : 'profile-1.png';  // Use default if no image is uploaded

  try {
    const existingLearner = await Learner.findOne({ email });
    const existingTeacher = await Teacher.findOne({ email });

    if (existingLearner || existingTeacher) {
      return res.status(400).render('signup', { error: 'Email already exists' });
    }

    if (accountType === 'learner') {
      await Learner.create({ email, password, address, firstName, lastName, phone, picture });
    } else if (accountType === 'teacher') {
      await Teacher.create({ email, password, address, firstName, lastName, phone, picture, schoolName, jobTitle, specialization });
    }

    res.status(200).redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('signup', { error: 'Server error, please try again later' });
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
      req.session.user = user; // Store learner data in session
      req.session.accountType = 'learner'; // Store account type in session
      return res.redirect('/');
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
      req.session.user = user; // Store teacher data in session
      req.session.accountType = 'teacher'; // Store account type in session
      return res.redirect('/');
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

// Route to render the edit course form
app.get('/editCourse/:courseId', async (req, res) => {
  const courseId = req.params.courseId;
  const accountType = req.session.accountType;

  try {
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Only instructors who created the course can edit it
    if (req.session.userID.toString() !== course.instructor._id.toString()) {
      return res.status(403).send('Access denied. You can only edit your own courses.');
    }

    res.render('editCourse', { course, accountType });
  } catch (err) {
    console.error('Error fetching course for editing:', err);
    res.status(500).send('Server Error');
  }
});

// Route to handle the edit course form submission
app.post('/editCourse/:courseId', upload.single('picture'), async (req, res) => {
  const courseId = req.params.courseId;
  const { name, price, description, category } = req.body;

  try {
    let course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Only instructors who created the course can edit it
    if (req.session.userID.toString() !== course.instructor.toString()) {
      return res.status(403).send('Access denied. You can only edit your own courses.');
    }

    // Update course details
    course.name = name;
    course.price = price;
    course.description = description;
    course.category = category;

    // Update picture if a new one is uploaded
    if (req.file) {
      course.picture = `/images/${req.file.filename}`;
    }

    await course.save();
    res.redirect(`/coursedetail/${course._id}`);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).send('Server Error');
  }
});

// Route to handle course deletion
app.post('/deleteCourse/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    // Find and delete the course
    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Redirect to the homepage with a success message
    req.session.message = 'Course deleted successfully';
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/orderPlacement/:courseId', async (req, res) => {
  console.log('Session User:', req.session.user); // Log session user
  console.log('Session AccountType:', req.session.accountType); // Log account type

  const user = req.session.user;
  const accountType = req.session.accountType;

  if (!user) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }

  const courseId = req.params.courseId;

  try {
    // Find the course by ID and populate the instructor's details
    const course = await Course.findById(courseId).populate('instructor');

    if (!course) {
      return res.status(404).send('Course not found');
    }

    res.render('orderPlacement', { user, accountType, course });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/thankyou', async (req, res) => {
  const { courseId } = req.body;

  try {
      // Fetch the course data and populate instructor details
      const course = await Course.findById(courseId).populate('instructor');

      if (!course) {
          return res.status(404).send('Course not found');
      }

      // Render the thankyou page with course and instructor details
      res.render('thankyou', { course });
  } catch (error) {
      console.error('Error fetching course for thank you page:', error);
      res.status(500).send('Server Error');
  }
});


app.get('/learner/coursedetail', (req, res) => {
  res.render('coursedetail')
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});







