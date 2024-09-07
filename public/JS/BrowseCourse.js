const express = require('express');
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the "public" folder
app.use('/public', express.static('public'));

// Sample course data to render dynamically
const courses = [
  {
    title: "AI Puzzle",
    description: [
      "Train a model to solve CAPTCHA with Google.",
      "Focuses on AI applications using Python and Google Colab.",
      "Object detection with TensorFlow."
    ],
    image: "https://cdn.glitch.global/a8735179-2600-4365-b449-07d7da34204c/AI-puzzle-Lottie-JSON-animation.gif?v=1724823890046"
  },
  {
    title: "Web Development",
    description: [
      "Learn to build web pages with HTML, CSS, and JavaScript.",
      "Perfect for beginners entering web development."
    ],
    image: "https://cdn.glitch.me/a8735179-2600-4365-b449-07d7da34204c/Java.gif?v=1724836630307"
  },
  {
    title: "App Development",
    description: [
      "Learn mobile app development for iOS and Android.",
      "Covers fundamentals of app design, coding, and deployment."
    ],
    image: "https://cdn.glitch.global/a8735179-2600-4365-b449-07d7da34204c/2019-10-01-13-58-44-5d935b94dd6b5-app-development.gif?v=1724822662135"
  },
  {
    title: "Artificial Intelligence and Machine Learning",
    description: [
      "Explore AI and Machine Learning through projects and expert guidance.",
      "Covers neural networks, NLP, and computer vision."
    ],
    image: "https://cdn.glitch.global/a8735179-2600-4365-b449-07d7da34204c/imgpsh_fullsize_anim.gif?v=1724822883626"
  },
  {
    title: "Basic JavaScript",
    description: [
      "Learn the fundamentals of JavaScript, including variables, functions, and events.",
      "Includes practice exercises to master JavaScript."
    ],
    image: "https://cdn.glitch.global/a8735179-2600-4365-b449-07d7da34204c/Java.gif?v=1724836151020"
  }
];

// Route to render the EJS template and pass the courses data
app.get('/', (req, res) => {
  res.render('index', { courses: courses });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
