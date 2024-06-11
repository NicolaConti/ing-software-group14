const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema( {
    username: String,
    date: String
}, {collection: 'LoginHistory'});

const LoginHistory = mongoose.model('LoginHistory', LoginHistorySchema);

module.exports = LoginHistory;