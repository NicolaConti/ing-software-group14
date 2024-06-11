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

module.exports = Segnalazione;
