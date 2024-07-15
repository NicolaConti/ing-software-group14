const mongoose = require('mongoose');

// Define the schema for the 'Feedback' subcollection
const feedbackSchema = new mongoose.Schema({
    username: String,
    commento: String
}, { _id: true }); // Enable automatic _id for subdocuments

// Define the schema for the 'Segnalazioni' collection
const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    data: Date,
    coordinate: [Number],
    gravity: Number, // 1 to 5
    feedbacks: [feedbackSchema]
}, { collection: 'Segnalazioni' });

// Define the model for the 'Segnalazioni' collection
const Segnalazione = mongoose.model('Segnalazioni', segnalazioneSchema);

module.exports = Segnalazione;
