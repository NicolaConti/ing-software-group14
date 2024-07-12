const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const segnalazioneSchema = new Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    gravity: Number,
    feedbacks: [{
        username: String,
        commento: String
    }]
}, {collection: 'Segnalazioni'});

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

module.exports = Segnalazione;