const mongoose = require('mongoose');

const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    gravity: Number, // 1 to 5
    feedbacks: [{
        username: String,
        commento: String
    }]
}, {collection: 'Segnalazioni'});

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

module.exports = Segnalazione;
