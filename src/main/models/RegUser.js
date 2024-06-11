const mongoose = require('mongoose');

// Define the schema for the 'RegUser' collection
const regUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    auth: String,
    suspended: String
}, { collection: 'RegisteredUser' });

// Define the model for the 'RegUser' collection
const RegUser = mongoose.model('RegUser', regUserSchema);

// Esporta la funzione getNextId
module.exports = RegUser;