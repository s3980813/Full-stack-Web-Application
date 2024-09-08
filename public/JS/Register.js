document.addEventListener("DOMContentLoaded", function () {
    // Toggle visibility of instructor fields based on selected account type
    const accountTypeRadios = document.getElementsByName("accountType");
    const instructorFields = document.getElementById("instructorFields");
    const sign_up = document.querySelector('#sign_up');
    const fs = require('fs');
    const countrySelect = document.getElementById('country');
    const selectedCountry = document.getElementById('selectedCountry');

    countrySelect.addEventListener('change', function () {
        const selectedValue = countrySelect.options[countrySelect.selectedIndex].text;
        selectedCountry.textContent = `Selected Country: ${selectedValue}`;
    });


    function toggleInstructorFields() {
        const selectedAccountType = document.querySelector('input[name="accountType"]:checked').value;
        if (selectedAccountType === "instructor") {
            instructorFields.style.display = "block";
        } else {
            instructorFields.style.display = "none";
        }
    }

    accountTypeRadios.forEach(radio => {
        radio.addEventListener("change", toggleInstructorFields);
    });


    // Form validation
    sign_up.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = sign_up.firstName.value;
        const lastName = sign_up.lastName.value;
        const email = sign_up.email.value;
        const phoneNumber = sign_up.phoneNumber.value;
        const password = sign_up.password.value;
        const confirmPassword = sign_up.confirmPassword.value;
        const address = sign_up.address.value;
        const city = sign_up.city.value;
        const zipcode = sign_up.zipcode.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('/signup', {
                method: "POST",
                body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, address, city, zipcode }),
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
        }
    });
    const registrationForm = document.getElementById("registrationForm");
    registrationForm.addEventListener("submit", function (event) {
        const password = document.getElementById("password").value;
        const retypePassword = document.getElementById("retypePassword").value;

        // Check if passwords match
        if (password !== retypePassword) {
            alert("Passwords do not match!");
            event.preventDefault(); // Prevent form submission
        }

    });
});



