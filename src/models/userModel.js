const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,  // Ensure each user has a unique email (used as username)
        match: [/.+\@.+\..+/, 'Please enter a valid email address']  // Basic email validation
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{9,11}$/, 'Please enter a valid phone number with 9 to 11 digits']  // Ensure it's a valid phone number
    },
    password: {
        type: String,
        required: true,
        minlength: 6  // You can customize this based on your security needs
    },
    picture: {
        type: String,
        default: 'default-avatar.jpg'  // A default picture if none is uploaded
    },
    address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        country: { type: String, required: false }
    },
    role: {
        type: String,
        enum: ['learner', 'teacher', 'admin'],  // Define roles for users
        default: 'learner'  // Default role is learner
    },
    dateCreated: {
        type: Date,
        default: Date.now  // Automatically track when the user is created
    }
}, { timestamps: true });

// Export the User model
module.exports = mongoose.model('User', userSchema);
