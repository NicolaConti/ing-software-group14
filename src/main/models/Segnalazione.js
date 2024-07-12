const mongoose = require('mongoose');

const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    feedbacks: [{
        username: String,
        commento: String
    }]
}, {collection: 'Segnalazioni'});

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

const SegnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    coordinate: [Number],
    gravity: Number, // 1 to 5
    feedbacks: [String]
});

const Segnalazione = mongoose.model('Segnalazione', SegnalazioneSchema);

module.exports = Segnalazione;
