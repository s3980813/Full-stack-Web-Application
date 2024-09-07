const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Course schema
const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    picture: {
        type: String,
        required: true,
        default: 'default-course.jpg' // Placeholder image if none is provided
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        minlength: 10
    },
    dateStart: {
        type: Date,
        required: true
    },
    instructor: {
        type: Schema.Types.ObjectId, // Refers to the User model (Instructor)
        ref: 'User',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Export the Course model
module.exports = mongoose.model('Course', courseSchema);
