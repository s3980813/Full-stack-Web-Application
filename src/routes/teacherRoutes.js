// Import the necessary libraries
const express = require('express');
const { checkUser } = require('../middlewares/authMiddleware');
const teacherController = require('../controllers/teacherControllers');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacherModel');  // Import the Teacher model

// Initialize the Express router
const router = express.Router();

// Define the storage location and naming convention for teacher images
const teacherImageStorage = multer.diskStorage({
  // Set the destination for storing images
  destination: function(req, file, cb) {
    cb(null, 'public/images/');
  },
  // Define the filename for the uploaded image
  filename: function(req, file, cb) {
    // Extract the JWT token from the cookies
    const token = req.cookies.jwt;
    // Verify the JWT token and extract the user ID
    const decodedToken = jwt.verify(token, 'your-secret-key');
    const userId = decodedToken.id;

    // Construct the new filename using the formatted date and time, user ID, and original file name
    const newFilename = `-${userId}-${file.originalname}`;

    // Set the new filename
    cb(null, newFilename);
  }
});

// Initialize multer with the defined storage
const teacherImageUpload = multer({ storage: teacherImageStorage });

// Route to display the add course page
router.get('/add-course', async (req, res) => {
    try {
        // Assuming you have the teacher's ID stored in the session or a token
        const teacherId = req.userId;  // Assuming req.userId has the logged-in teacher's ID

        // Fetch the teacher from the database
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).send('Teacher not found');
        }

        // Render the addCourse page and pass the teacher object
        res.render('addCourse', { teacher });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
