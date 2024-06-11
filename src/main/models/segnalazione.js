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
    feedbacks: {
        type: [{
            username: String,
            commento: String,
            data: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    }
});

// Controlla se il modello è già stato definito, altrimenti lo definisce
const Segnalazione = mongoose.models.Segnalazione || mongoose.model('Segnalazione', segnalazioneSchema);

module.exports = Segnalazione;
