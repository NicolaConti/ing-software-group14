function checkCampi(event) {
    event.preventDefault(); // Prevent form submission
    valid.form = document.getElementById('register-form');
    valid.error_username = document.getElementById('error_username');
    valid.error_email = document.getElementById('error_email');
    valid.error_password = document.getElementById('error_password');
    valid.hasError = false;
    checkUsername();
}

function checkUsername() {
    let username = document.getElementById('username').value;
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', `/check-username?username=${encodeURIComponent(username)}`, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText);
            if (response.exists) {
                valid.hasError = true;
                valid.error_username.innerText = 'Errore: Username già in uso';
            } else {
                valid.error_username.innerText = '';
                checkEmail();
            }
        }
    };
    xhttp.send();
}

function checkEmail() {
    let email = document.getElementById('email').value;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        valid.hasError = true;
        valid.error_email.innerText = 'Errore: Formato email non valido';
    } else {
        valid.error_email.innerText = '';
        checkPassword();
    }
}


function checkPassword() {
    let password = document.getElementById('password').value;
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!re.test(password)) {
        valid.hasError = true;
        valid.error_password.innerText = 'Errore: La password deve contenere almeno 8 caratteri, lettere e numeri';
    } else {
        valid.error_password.innerText = '';
        makeQuery();
    }
}

function makeQuery() {
    if (valid.hasError) {
        return;
    }
    // Preparing request
    let form = document.querySelector('#register-form');
    let formValues = new FormData(form);

    // Log the form values
    for (let [key, value] of formValues.entries()) {
        console.log(key, value);
    }

    // Making request
    let xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/SignIn', true);
    xhttp.send(formValues);

    // Receive response
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                console.log("Risposta: " + this.responseText);
                resetForm();
                window.location.href = 'map.html';
            } else if (this.status === 401) {
                valid.error_username.innerText = 'Errore: Username già in uso';
            } else if (this.status === 400) {
                let response = this.responseText;
                if (response.includes('email already taken')) {
                    valid.error_email.innerText = 'Errore: Email già in uso';
                } else if (response.includes('wrong email format')) {
                    valid.error_email.innerText = 'Errore: Formato email non valido';
                } else if (response.includes('wrong password format')) {
                    valid.error_password.innerText = 'Errore: Formato password non valido';
                } else {
                    console.log("Registrazione fallita");
                    console.log("Risposta: " + this.responseText);
                }
            } else if (this.status === 500) {
                console.log("Registrazione fallita");
                console.log("Risposta: " + this.responseText);
            }
        }
    };
}


function resetForm() {
    valid.form.reset();
    valid.error_username.innerText = '';
    valid.error_email.innerText = '';
    valid.error_password.innerText = '';
}
