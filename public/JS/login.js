const container = document.getElementById('container');
const sign_in = document.querySelector('#sign_in');

sign_in.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = sign_in.email.value;
    const password = sign_in.password.value;

    try {
        const res = await fetch('/login', {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (!data) {
            throw new Error('No response data');
        }
        if (data.error) {
            let errorMessage = '';
            if (data.error.email || data.error.password) {
                errorMessage += 'Invalid email or password';
            }
            alert(errorMessage);
        }
        if (data.user) {
            location.assign('/');
        }
    } catch (err) {
        console.log(err);
        alert(err);
    }
});