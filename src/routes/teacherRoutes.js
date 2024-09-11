// // Import the necessary libraries
// const express = require('express');
// const { checkUser } = require('../middlewares/authMiddleware');
// const teacherController = require('../controllers/teacherControllers');
// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// const Teacher = require('../models/teacherModel');  // Import the Teacher model
// // import { Course } from '../models/courseModel.js'

// // Initialize the Express router
// const router = express.Router();

// // Define the storage location and naming convention for teacher images
// const teacherImageStorage = multer.diskStorage({
//   // Set the destination for storing images
//   destination: function (req, file, cb) {
//     cb(null, 'public/images/');
//   },
//   // Define the filename for the uploaded image
//   filename: function (req, file, cb) {
//     // Extract the JWT token from the cookies
//     const token = req.cookies.jwt;
//     // Verify the JWT token and extract the user ID
//     const decodedToken = jwt.verify(token, 'your-secret-key');
//     const userId = decodedToken.id;

//     // Construct the new filename using the formatted date and time, user ID, and original file name
//     const newFilename = `-${userId}-${file.originalname}`;

//     // Set the new filename
//     cb(null, newFilename);
//   }
// });

// // Initialize multer with the defined storage
// const teacherImageUpload = multer({ storage: teacherImageStorage });

// // Route to display the add course page
// router.get('/add-course', async (req, res) => {
//   try {
//     // Assuming you have the teacher's ID stored in the session or a token
//     const teacherId = req.userId;  // Assuming req.userId has the logged-in teacher's ID

//     // Fetch the teacher from the database
//     const teacher = await Teacher.findById(teacherId);

//     if (!teacher) {
//       return res.status(404).send('Teacher not found');
//     }

//     // Render the addCourse page and pass the teacher object
//     res.render('addCourse', { teacher });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// router.get('/:id', teacherController.getInstructorProfile);

// module.exports = router;


// call lecture
// call course
// them_course form post
// route index router.post(form detail) router.get(render addcourse)
// course se phai luu id lecture

// lectureRouter.post("/addCourse", async (req, res) => {
//   const courseData = req.body;
//   const instructor = req.user;
//   const actionUrl = `/users/vendor/newCourse`
//   const formAction = 'Create!'
//   // console.log(productData.tags);

//   // error checking
//   let errors = []

//   if (!courseData.name) {
//     errors.push({ msg: "Product name cant be empty" })
//   }

//   if (!courseData.price) {
//     errors.push({ msg: "Price cant be empty" })
//   }

//   if (courseData.price < 0) {
//     errors.push({ msg: "Price cant be a negative number" })
//   }

//   if (!courseData.description) {
//     errors.push({ msg: "Description cant be empty" })
//   }

//   if (!courseData.stock) {
//     errors.push({ msg: "Stock cant be empty" })
//   }

//   // Add new course
//   try {
//     if (errors.length > 0) throw new Error("Failed adding new course")
//     const newCourse = await Course.create({
//       name: courseData.name,
//       price: courseData.price,
//       description: courseData.description,
//       picture: courseData.picture,
//       Instructor: instructor,
//     })
//     saveCourseCover(newCourse, courseData.image)
//     await courseData.save()

//     res.redirect("/users/vendor")
//   } catch (e) {
//     errors.splice(0, 0, { msg: e.message })
//     res.render("", {
//       courseData, picture,
//       price,
//       description,
//       errors,
//       actions: {
//         actionUrl,
//         formAction
//       }
//     })
//   }
// });





