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
    instructor: {
        type: Schema.Types.ObjectId, // Refers to the Teacher model
        ref: 'Teacher',
        required: true
    },
    category: {
        type: String, // Add the category field
        required: true, // Make it required
        enum: ['Programming', 'Design', 'Marketing', 'Business', 'Other'], // Example categories
        default: 'Other'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);