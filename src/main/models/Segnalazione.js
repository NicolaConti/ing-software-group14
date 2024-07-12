const mongoose = require('mongoose');

const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    gravity: Number, // 1 to 5
    coordinate: [Number],
    feedbacks: [{
        username: String,
        commento: String
    }]
}, {collection: 'Segnalazioni'});

const Segnalazione = mongoose.model('Segnalazione', SegnalazioneSchema);

module.exports = Segnalazione;
