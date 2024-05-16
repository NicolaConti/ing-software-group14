var valid = document.querySelector('#register-form');

function checkCampi() {
    valid.form = document.getElementById('register-form');
    valid.formInputs = Array.from(valid.form.elements);
    valid.error_username = document.getElementById('error_username');
    valid.error_Psw = document.getElementById('error_Psw');
    valid.hasError = false;
    checkUsername();

    if(!valid.hasError){
        makeQuery();
    }
}

function checkUsername() {
    let form = document.querySelector('#formRegistrazione');
    let formValues = new FormData(form);

    //Making request to mongodb

    //Ricevo la risposta
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            //l'username è univoco
            valid.error_username.innerText = '';
        } else if (this.readyState === 4 && this.status === 409){
            //l'username esiste già
            valid.hasError = true;
            valid.error_username.innerText = 'Errore: Username già in uso';
        }
    }
}

function makeQuery() {
    //Preparing request
    let form = document.querySelector('#formRegistrazione');
    let formValues = new FormData(form);

    //Making request
    let xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'SignIn', true);
    xhttp.send(formValues);


    //Ricevo la risposta
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            console.log("Risposta: " +this.responseText);
            resetForm();
            window.location.href = 'map.html';
        } else if (this.readyState === 4 && this.status === 500){
            console.log("Registrazione fallita");
            console.log("Risposta: " +this.responseText);
        }
    }
}

function resetForm() {
    valid.form.reset();
    valid.error_username.innerText = '';
    valid.error_Psw.innerText = '';
}
