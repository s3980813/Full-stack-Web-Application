const express = require('express');
const { getCourseById } = require('../middleware/nameMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');

const router = express.Router();

// Route to get course details (accessible to all authenticated users)
router.get('/courses/:id', requireAuth, courseController.getCourseDetails);

// Route to allow teacher to post a new course
router.post('/courses', requireAuth, courseController.createCourse);

module.exports = router;
