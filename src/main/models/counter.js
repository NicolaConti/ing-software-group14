const mongoose = require('mongoose');

// Define the schema for the 'Counter' collection
const counterSchema = new mongoose.Schema({
    id: { type: String, required: true },
    seq: { type: Number, default: 0 },
}, { collection: 'Counter' });

// Define the model for the 'Counter' collection
const Counter = mongoose.model('Counter', counterSchema);

//funzione per recuperare il numero successivo della sequenza (per l'ID della segnalazione)
async function getNextSequence(name) {
    try {
        const counter = await Counter.findOneAndUpdate(
            { id: name },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return counter.seq;
    } catch (error) {
        console.error('Error getting next sequence:', error);
        throw error;
    }
}

module.exports = { Counter, getNextSequence };
