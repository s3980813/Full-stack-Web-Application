const { getCourseById } = require('../middlewares/nameMiddleware');

// Controller for fetching course details
const getCourseDetails = async (req, res) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.render('courseDetails', { course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for creating a new course (for teachers)
const createCourse = async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;
    // Assuming you have a Course model
    const newCourse = new Course({
      title,
      description,
      teacher: teacherId, // The teacher's ID should come from req.body or req.user if it's authenticated
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCourseDetails, createCourse };
