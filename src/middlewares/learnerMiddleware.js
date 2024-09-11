// const jwt = require('jsonwebtoken');
// const Learner = require('../models/learnerModel'); // Adjust the path to your learner model

// // Middleware to fetch learner profile data
// const getLearnerProfile = async (req, res, next) => {
//     try {
//         // Extract the token from the cookies
//         const token = req.cookies.jwt;

//         if (!token) {
//             return res.status(401).json({ message: 'Authentication token missing' });
//         }

//         // Verify the token and extract the learner's ID
//         const decodedToken = jwt.verify(token, 'your-secret-key');
//         const learnerId = decodedToken.id;

//         // Fetch learner data from the database
//         const learner = await Learner.findById(learnerId);

//         if (!learner) {
//             return res.status(404).json({ message: 'Learner not found' });
//         }

//         // Attach the learner data to the response locals
//         res.locals.learner = learner;
        
//         // Proceed to the next middleware or route handler
//         next();
//     } catch (error) {
//         console.error('Error fetching learner profile:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// module.exports = { getLearnerProfile };

