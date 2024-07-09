const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    id: { type: String, required: true },
    seq: { type: Number, default: 0 },
}, { collection: 'Counter' });

const Counter = mongoose.model('Counter', counterSchema);

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

module.exports = Counter;
module.exports = getNextSequence;
