document.addEventListener('DOMContentLoaded', function() {
    // Simulated user status (could be 'learner', 'instructor', or 'guest')
    const userStatus = 'learner';  // Change this to 'instructor' or 'guest' to see different views

    const actionButtons = document.getElementById('actionButtons');

    if (userStatus === 'learner') {
        actionButtons.innerHTML = `
            <button class="trial-button" onclick="startTrial()">Trial For 2-Day</button>
            <button class="enroll-button" onclick="enrollCourse()">Enroll</button>
        `;
    } else if (userStatus === 'instructor') {
        actionButtons.innerHTML = `
            <button class="edit-button" onclick="editCourse()">Edit Course</button>
            <button class="delete-button" onclick="deleteCourse()">Delete Course</button>
        `;
    } else if (userStatus === 'guest') {
        // No action buttons for guests, only course title and description are shown
        document.getElementById('courseInstructor').style.display = 'none';
        document.getElementById('coursePrice').style.display = 'none';
    }
});

// Functions for learners
function startTrial() {
    alert('You have started a 2-day trial for this course.');
    // Add logic to handle trial subscription
}

function enrollCourse() {
    window.location.href = 'order-placement.html';  // Redirect to order placement page
}

// Functions for instructors
function editCourse() {
    alert('You are now editing this course.');
    // Add logic to redirect to the edit course page
}

function deleteCourse() {
    if (confirm('Are you sure you want to delete this course?')) {
      // Send a POST request to delete the course
      fetch(`/deleteCourse/<%= course._id %>`, {
        method: 'POST',
      })
      .then(response => {
        if (response.ok) {
          alert('Course deleted successfully.');
          window.location.href = '/';  // Redirect to homepage
        } else {
          alert('Error deleting course.');
        }
      })
      .catch(error => {
        console.error('Error deleting course:', error);
      });
    }
  }
