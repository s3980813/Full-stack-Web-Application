// const Teacher = require('../models/teacherModel');
// const Course = require('../models/courseModel');

// module.exports.getInstructorProfile = async (req, res) => {
//     try {
//         const teacherId = req.params.id; // Assuming the instructor ID is passed in the URL
//         const teacher = await Teacher.findById(teacherId); // Fetch instructor data

//         if (!teacher) {
//             return res.status(404).send('Instructor not found');
//         }

//         // Fetch up to 5 new courses (sorted by most recent)
//         const newCourses = await Course.find({ instructor: teacherId })
//             .sort({ dateCreated: -1 })
//             .limit(5);

//         // Fetch all courses by the instructor
//         const allCourses = await Course.find({ instructor: teacherId });

//         // Render the instructor profile page with real data
//         res.render('inprofile', {
//             teacher,   // Pass teacher instead of instructor
//             newCourses,
//             allCourses
//         });
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// };

