// Import the necessary libraries
const express = require('express');
const { getLearnerProfile } = require('../middlewares/learnerMiddleware'); // Assuming you have learner-specific middleware
const router = express.Router();

// Profile route for learners
router.get('/profile', getLearnerProfile, (req, res) => {
    const learner = res.locals.learner;  // Learner data from middleware
    res.render('profile', { learner });
});

// Other learner-specific routes can go here (e.g., learner's courses, settings)
router.get('/learner-courses', (req, res) => {
    // Logic for fetching learner courses
    res.render('learnerCourses', { courses: [] });  // Example, replace with real data
});

router.post('/learner-update', (req, res) => {
    // Logic for updating learner profile information
    res.send('Learner profile updated');
});

// Export the router
module.exports = router;
