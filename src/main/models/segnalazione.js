const mongoose = require('mongoose');

// Definizione dello schema per il modello Segnalazione
const segnalazioneSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true
    },
    commento: String,
    data: {
        type: Date,
        default: Date.now
    },
    coordinate: {
        type: [Number], // [longitudine, latitudine]
        required: true
    },
    commenti: {
        type: [String],
        default: []
    }
});

// Creazione del modello Segnalazione utilizzando lo schema definito
const Segnalazione = mongoose.model('Segnalazione', segnalazioneSchema);

module.exports = Segnalazione;
