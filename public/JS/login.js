const users = [
    {
        email: "vinhkhang@gmail.com",
        phone: "123456",
        password: "123456",
        fullName: "Vinh Khang",
        profilePicture: "profile picture.png"
    },

];

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            alert("Login Successful!");
            // Optionally redirect the user to another page
        } else {
            alert("Login Failed: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});