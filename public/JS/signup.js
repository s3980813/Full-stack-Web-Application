const container = document.getElementById('container');
const sign_up = document.querySelector('#sign_up');

sign_up.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the values from the form inputs
    const email = sign_up.email.value;
    const phone = sign_up.phone.value;
    const password = sign_up.password.value;
    const confirmPassword = sign_up.retypePassword.value;
    const firstName = sign_up.firstName.value;
    const lastName = sign_up.lastName.value;
    const address = sign_up.address.value;
    const city = sign_up.city.value;
    const zipcode = sign_up.zipcode.value;
    const country = sign_up.country.value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value; // learner or instructor

    // Get instructor-specific fields if applicable
    const schoolName = sign_up.schoolName ? sign_up.schoolName.value : '';
    const jobTitle = sign_up.jobTitle ? sign_up.jobTitle.value : '';
    const specialization = sign_up.specialization ? Array.from(sign_up.specialization.selectedOptions).map(option => option.value) : [];

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Prepare data for either learner or instructor
    let userData = {
        email,
        phone,
        password,
        firstName,
        lastName,
        address,
        city,
        zipcode,
        country,
        accountType
    };

    // Add instructor-specific fields if accountType is 'instructor'
    if (accountType === 'instructor') {
        userData = {
            ...userData,
            schoolName,
            jobTitle,
            specialization
        };
    }

    try {
        const res = await fetch('/signup', {
            method: "POST",
            body: JSON.stringify(userData),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();

        if (data.error) {
            let errorMessage = '';
            if (data.error.includes('E11000 duplicate key error')) {
                errorMessage += 'This email is already registered';
            }
            if (data.error.includes('Minimum password length is 6 characters')) {
                errorMessage += 'Password must be at least 6 characters';
            }
            alert(errorMessage);
        } else if (data.user) {
            location.assign('/');
        }

    } catch (err) {
        console.log(err);
        alert('An error occurred during registration');
    }
});



