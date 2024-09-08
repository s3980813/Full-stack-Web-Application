const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Includes Learner and Teacher
const Admin = require('../models/adminModel');  // Import Admin model

// Middleware to require authentication for any route
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'your-secret-key', async (err, decodedToken) => {
      if (err) {
        console.error(err.message);
        res.redirect('/login');  // Redirect to login if the token is invalid
      } else {
        req.userId = decodedToken.id;  // Attach userId to the request object
        next();  // Continue to the next middleware or route handler
      }
    });
  } else {
    res.redirect('/login');  // Redirect to login if no token is present
  }
};

// Middleware to check if the current user exists and populate res.locals.user
const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'your-secret-key', async (err, decodedToken) => {
      if (err) {
        console.error(err.message);
        res.locals.user = null;
        next();
      } else {
        // Check if the user is either an Admin or a regular User (Learner/Teacher)
        const user = await User.findById(decodedToken.id) || await Admin.findById(decodedToken.id);
        res.locals.user = user;  // Make the user available in views
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();  // Proceed for pages that do not require authentication
  }
};

// Middleware to check if the user is an admin
const requireAdmin = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'your-secret-key', async (err, decodedToken) => {
      if (err) {
        console.error(err.message);
        res.redirect('/login');  // Redirect to login if the token is invalid
      } else {
        const admin = await Admin.findById(decodedToken.id);
        if (admin && admin.role === 'admin') {
          req.admin = admin;  // Attach admin to request for further use
          next();  // Continue to the next middleware or route handler
        } else {
          res.status(403).send('Access Denied: Admins only');
        }
      }
    });
  } else {
    res.redirect('/login');  // Redirect to login if no token is present
  }
};

module.exports = { requireAuth, checkUser, requireAdmin };
