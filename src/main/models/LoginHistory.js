const mongoose = require('mongoose');

// Define the schema for the 'LoginHistory' collection
const LoginHistorySchema = new mongoose.Schema( {
    username: String,
    date: String,
}, {collection: 'LoginHistory'});

// Define the model for the 'LoginHistory' collection
const LoginHistory = mongoose.model('LoginHistory', LoginHistorySchema);

module.exports = LoginHistory;