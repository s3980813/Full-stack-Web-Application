document.addEventListener('DOMContentLoaded', function() {
    // Simulated data (in a real app, this data would come from a backend API)
    const newCourses = [
        { name: 'React for Beginners', image: 'react-course.jpg', price: '$49.99', link: '#' },
        { name: 'Advanced JavaScript', image: 'js-course.jpg', price: '$59.99', link: '#' },
        { name: 'Node.js Essentials', image: 'node-course.jpg', price: '$39.99', link: '#' },
        { name: 'CSS Masterclass', image: 'css-course.jpg', price: '$29.99', link: '#' },
        { name: 'HTML5 & CSS3', image: 'html-course.jpg', price: '$19.99', link: '#' },
    ];

    const allCourses = [
        { name: 'React for Beginners', image: 'react-course.jpg', price: '$49.99', link: '#' },
        { name: 'Advanced JavaScript', image: 'js-course.jpg', price: '$59.99', link: '#' },
        { name: 'Node.js Essentials', image: 'node-course.jpg', price: '$39.99', link: '#' },
        { name: 'CSS Masterclass', image: 'css-course.jpg', price: '$29.99', link: '#' },
        { name: 'HTML5 & CSS3', image: 'html-course.jpg', price: '$19.99', link: '#' },
        { name: 'Full-Stack Development', image: 'fullstack-course.jpg', price: '$99.99', link: '#' },
        { name: 'Web Accessibility', image: 'accessibility-course.jpg', price: '$24.99', link: '#' },
    ];

    // Function to generate course cards
    function generateCourseCards(courses, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card');

            courseCard.innerHTML = `
                <a href="${course.link}">
                    <img src="course.jpg" alt="${course.name}">
                    <h3>${course.name}</h3>
                </a>
                <p>${course.price}</p>
            `;

            container.appendChild(courseCard);
        });
    }

    // Load new courses and all courses
    generateCourseCards(newCourses, 'newCourses');
    generateCourseCards(allCourses, 'allCourses');
});

// Redirect to the Add Course page
function redirectToAddCourse() {
    window.location.href = 'add-course.html';  // Change this to the actual URL of your Add Course page
}
