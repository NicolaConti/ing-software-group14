const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('webapp'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/segnalazioni', { useNewUrlParser: true, useUnifiedTopology: true });

const Segnalazione = mongoose.model('Segnalazione', new mongoose.Schema({
    tipo: String,
    commento: String,
    coordinate: {
        type: [Number],
        index: '2dsphere'
    },
    dataOra: { type: Date, default: Date.now }
}));

// Rotte API
app.post('/api/segnalazioni', (req, res) => {
    const { tipo, commento, coordinate } = req.body;
    const segnalazione = new Segnalazione({ tipo, commento, coordinate });
    segnalazione.save((err, segnalazioneSalvata) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(segnalazioneSalvata);
    });
});

app.get('/api/segnalazioni', (req, res) => {
    Segnalazione.find({}, (err, segnalazioni) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(segnalazioni);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
