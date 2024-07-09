const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    id: Number,
    username: String,
    commento: String
}, { collection: 'feedbacks' });

const Feedback = mongoose.model('feedbacks', feedbackSchema);

module.exports = Feedback;