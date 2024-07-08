const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema({
    id: Number,
    username: String,
    commento: String
}, { collection: 'feedbacks' });

const segnalazioneSchema = new Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    feedbacks: [feedbackSchema]
}, { collection: 'Segnalazioni' });

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

module.exports = Segnalazione;
