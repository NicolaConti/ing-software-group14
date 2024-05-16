var form = document.querySelector('#formAccesso');
/** MAIN FUNCTION **/
function logIn() {
    //preparing request

    let formValues = new FormData(form);

    //Making request to mongodb

    //Ricevo la risposta
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let responseJSON = JSON.parse(this.response);
            resetForm();
        }
    }
}

/** SECONDARY FUNCTIONS **/
function resetForm() {
    form.reset();
}