const mongoose = require('mongoose');

const segnalazioneSchema = new mongoose.Schema({
    _id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    feedbacks: [{
        username: String,
        commento: String
    }]
});

const Segnalazione = mongoose.model('Segnalazione', segnalazioneSchema);

module.exports = Segnalazione;
