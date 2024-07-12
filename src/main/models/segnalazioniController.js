const Segnalazione = require('./Segnalazione');
const { getNextSequence } = require('../models/counter');

exports.creaSegnalazione = async (req, res) => {
    try {
        const { tipo, commento, data, coordinate, gravity } = req.body;
        const nextId = await getNextSequence('segnalazioneId');

        const nuovaSegnalazione = new Segnalazione({
            id: nextId,
            tipo: tipo,
            commento: commento,
            data: data,
            coordinate: coordinate,
            gravity: gravity
        });

        const segnalazioneSalvata = await nuovaSegnalazione.save();

        res.status(201).json(segnalazioneSalvata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
    }
};


// Funzione per aggiungere un commento a una segnalazione esistente
exports.aggiungiCommento = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({id: req.params.id}, null, null);

        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }

        const nuovoCommento = {
            username: req.body.username,
            commento: req.body.commento
        };

        segnalazione.feedbacks.push(nuovoCommento);

        const segnalazioneAggiornata = await segnalazione.save();

        res.json(segnalazioneAggiornata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta del commento' });
    }
};


// Funzione per ottenere i commenti di una segnalazione
exports.ottieniCommenti = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({id: req.params.id}, null, null);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei commenti' });
    }
};

// Funzione per ottenere i feedback di una segnalazione
exports.ottieniFeedbacks = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({id: req.params.id}, null, null);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei feedback' });
    }
};