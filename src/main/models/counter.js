const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
}, {collection: "Counter"});

const Counter = mongoose.model('Counter', counterSchema);

async function getNextId(counterName) {
    const result = await Counter.findOneAndUpdate(
        { name: counterName },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );

    return result.value;
}

// Esporta la funzione getNextId
module.exports = { getNextId };
