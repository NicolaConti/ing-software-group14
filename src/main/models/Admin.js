const mongoose = require('mongoose');

// Define the schema for the 'Admin' collection
const adminSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    auth: String,
}, {collection: 'Admin'});

// Define the model for the 'Admin' collection
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;