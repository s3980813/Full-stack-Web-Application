const container = document.getElementById('container');
const sign_in = document.querySelector('#sign_in');

sign_in.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = sign_in.email.value;
    const password = sign_in.password.value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;

    try {
        const res = await fetch('/login', {
            method: "POST",
            body: JSON.stringify({ email, password, accountType }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.redirected) {
            window.location.href = res.url;  // Redirect to home or instructor page on success
        } else {
            const data = await res.json();
            if (data.error) {
                alert(data.error);  // Alert if there’s an error message returned by the server
            }
        }
    } catch (err) {
        console.log(err);
        alert('An error occurred during login');
    }
});
