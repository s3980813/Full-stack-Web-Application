// Import the necessary libraries
const express = require('express');
const authController = require('../controllers/authControllers');

// Initialize the Express router
const router = express.Router();

// Define the routes for user registration
// GET route for displaying the signup page
router.get('/signup', authController.signUpGet);
router.post('/signup', authController.signUpPost);

// Define the routes for user login
// GET route for displaying the login page
router.get('/login', authController.loginGet);
// POST route for submitting the login form
router.post('/login', authController.loginPost);

// Define the route for user logout
// GET route for logging out the user
router.get('/logout', authController.logoutGet);

// Assuming you have middleware that checks if a user is logged in
router.get('/profile', (req, res) => {
    // Check if the user is logged in
    const isLoggedIn = req.cookies.jwt ? true : false;  // Example with JWT cookie

    // Assuming `user` is attached to the request by a middleware
    const user = req.user || null;

    if (!user) {
        return res.redirect('/login');  // Redirect if the user is not logged in
    }

    // Render the profile page and pass isLoggedIn and user data
    res.render('profile', {
        isLoggedIn,
        user
    });
});

// Export the router
module.exports = router;
