const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: String,
    commento: String,
    data: { type: Date, default: Date.now }
});

const segnalazioneSchema = new mongoose.Schema({
    _id: Number,
    tipo: String,
    commento: String,
    data: { type: Date, default: Date.now },
    coordinate: String,
    feedbacks: [feedbackSchema]
});

module.exports = mongoose.model('Segnalazione', segnalazioneSchema);
