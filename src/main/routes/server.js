const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const SegnalazioniController = require('./controllers/segnalazioniController');

// Inizializzazione dell'app Express
const app = express();

// Middleware per il parsing del body delle richieste
app.use(bodyParser.json());

// Connessione al database MongoDB
mongoose.connect('mongodb://localhost:27017/segnalazioniDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware per servire i file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

// Definizione delle rotte
app.post('/api/segnalazioni', SegnalazioniController.create);
app.get('/api/segnalazioni', SegnalazioniController.getAll);
app.get('/api/segnalazioni/:id', SegnalazioniController.getById);
app.post('/api/segnalazioni/:id/commenti', SegnalazioniController.addComment);

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
