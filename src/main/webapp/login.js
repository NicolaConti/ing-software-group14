var form = document.querySelector('#formAccesso');
var url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/?retryWrites=true&w=majority&appName=IngSoftwareDB"
const MongoClient = require('mongoose');
/** MAIN FUNCTION **/
function logIn() {
    //preparing request

    let formValues = new FormData(form);

    //Making request to mongodb
    MongoClient.connect(url);
    const RegUser = MongoClient.model('RegUser', {
        username: { type: String },
        password: { type: String },
        email: { type: String },
        auth: { type: String },
        suspended: { type: String }
    });

    RegUser.find({username: document.username }, {password: document.password}, function (err, docs) {
        if(err)
            console.log(err);
        else
            console.log("First function call : ", docs);
            resetForm();

    })

}

/** SECONDARY FUNCTIONS **/
function resetForm() {
    form.reset();
}