const users = [
    {
        email: "vinhkhang@gmail.com",
        phone: "123456",
        password: "123456",
        fullName: "Vinh Khang",
        profilePicture: "profile picture.png"
    },

];

document.addEventListener("DOMContentLoaded", () => {
    const loggedIn = false;

    if (loggedIn) {
        document.getElementById('profile').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    } else {
        document.getElementById('profile').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }
});

function login() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    if (usernameInput === '' || passwordInput === '') {
        alert("Please enter both username and password.");
        return;
    }

    const user = users.find(u => (u.email === usernameInput || u.phone === usernameInput) && u.password === passwordInput);

    if (user) {
        // Successful login
        document.getElementById('fullName').textContent = user.fullName;
        document.getElementById('email').textContent = user.email;
        document.getElementById('phone').textContent = user.phone;
        document.querySelector('.profile img').src = user.profilePicture;

        // Show profile, hide login form
        document.getElementById('profile').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    } else {
        // Failed login
        alert("Incorrect username or password.Please try again.");
    }
}

// function login() {
//     // Redirect to the dashboard page
//     window.location.href = "Browse Course/index.html";
// }
