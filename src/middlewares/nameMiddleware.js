// const Admin = require('../models/adminModel');  // Adjust the path as needed
// const Teacher = require('../models/teacherModel');  // Adjust the path as needed
// const Learner = require('../models/learnerModel');  // Adjust the path as needed
// const Course = require('../models/courseModel');  // Adjust the path as needed

// // Function to get any user (admin, teacher, learner) by their ID
// const getUserById = async (userId) => {
//   try {
//     // Attempt to find user in Admin, Teacher, or Learner collections
//     let user = await Admin.findById(userId) || await Teacher.findById(userId) || await Learner.findById(userId);
//     return user;
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     throw error;
//   }
// };

// // Function to get a course by its ID
// const getCourseById = async (courseId) => {
//   try {
//     const course = await Course.findById(courseId);
//     return course;
//   } catch (error) {
//     console.error('Error fetching course:', error);
//     throw error;
//   }
// };

// // Function to get teacher by ID
// const getTeacherById = async (teacherId) => {
//   try {
//     const teacher = await Teacher.findById(teacherId);
//     return teacher;
//   } catch (error) {
//     console.error('Error fetching teacher:', error);
//     throw error;
//   }
// };

// // Function to get learner by ID
// const getLearnerById = async (learnerId) => {
//   try {
//     const learner = await Learner.findById(learnerId);
//     return learner;
//   } catch (error) {
//     console.error('Error fetching learner:', error);
//     throw error;
//   }
// };

// module.exports = { getUserById, getCourseById, getTeacherById, getLearnerById };
