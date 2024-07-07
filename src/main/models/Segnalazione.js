const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    id: Number,
    username: String,
    commento: String
});

const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    feedbacks: [feedbackSchema]
}, { collection: 'Segnalazioni' });

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

const feedbacks = mongoose.model('feedbacks', feedbackSchema);

module.exports = Segnalazione;
module.exports = feedbacks;