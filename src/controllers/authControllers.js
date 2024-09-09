// Import the necessary libraries and modules
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');
const Learner = require('../models/learnerModel');  // Learners and Teachers
const Teacher = require('../models/teacherModel');
const Admin = require('../models/adminModel');  // Admins

// Define the maximum age for the JWT token (3 days)
const maxAge = 3 * 24 * 60 * 60;

// Function to create a JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: maxAge,
    });
};

// Function to handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // Incorrect Email
    if (err.message === 'Incorrect email') {
        errors.email = 'That email is not registered';
    }

    // Incorrect Password
    if (err.message === 'Incorrect password') {
        errors.password = 'That password is invalid';
    }

    // Duplicate Error Code
    if (err.code == 11000) {
        errors.email = 'That email has already registered';
        return errors;
    }

    // Validation Errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

// Function for Signup (Get & Post method)
module.exports.signUpGet = (req, res) => {
    res.render('signup');
};

module.exports.signUpPost = async (req, res) => {
    const { fullName, email, password, accountType, schoolName, jobTitle, specialization } = req.body;

    try {
        let newUser;

        if (accountType === 'learner') {
            // Create a new learner
            newUser = new Learner({
                fullName,
                email,
                password,
            });
        } else if (accountType === 'instructor') {
            // Create a new teacher
            newUser = new Teacher({
                fullName,
                email,
                password,
                schoolName,
                jobTitle,
                specialization
            });
        }

        // Save User and Return
        await newUser.save();

        // Create Token for current user
        const token = createToken(newUser._id);

        // Create Cookie based on user information
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: newUser._id });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

// Function for Login (Get & Post method)
module.exports.loginGet = (req, res) => {
    res.render('login');
};

module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is either an Admin or a regular User (Learner/Teacher)
        const user = await User.login(email, password) || await Admin.login(email, password);

        if (!user) {
            throw Error('Incorrect email or password');
        }

        // Create Token for current user (Admin or regular user)
        const token = createToken(user._id);

        // Create Cookie based on user information
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

// Function for Logout (Get method)
module.exports.logoutGet = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });  // Replace with blank cookie to expire quickly
    res.redirect('/');
};
