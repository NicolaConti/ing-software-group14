const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: String,
    commento: String
}, { _id: true }); // Enable automatic _id for subdocuments

const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    username: String,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    gravity: Number, // 1 to 5
    feedbacks: [feedbackSchema]
}, { collection: 'Segnalazioni' });

const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

module.exports = Segnalazione;
