const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connessione al database MongoDB
mongoose.connect('mongodb://localhost:27017/segnalazioni', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modello Segnalazione
const Segnalazione = mongoose.model('Segnalazione', new mongoose.Schema({
    tipo: String,
    commento: String,
    coordinate: [Number]
}));

// Rotte API
app.get('/api/segnalazioni', async (req, res) => {
    const segnalazioni = await Segnalazione.find();
    res.json(segnalazioni);
});

app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate } = req.body;
    const segnalazione = new Segnalazione({ tipo, commento, coordinate });
    await segnalazione.save();
    res.json(segnalazione);
});

app.delete('/api/segnalazioni/:id', async (req, res) => {
    const { id } = req.params;
    await Segnalazione.findByIdAndDelete(id);
    res.json({ message: 'Segnalazione eliminata' });
});

app.post('/api/segnalazioni/:id/commento', async (req, res) => {
    const { id } = req.params;
    const { commento } = req.body;
    const segnalazione = await Segnalazione.findById(id);
    segnalazione.commento = commento;
    await segnalazione.save();
    res.json(segnalazione);
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
