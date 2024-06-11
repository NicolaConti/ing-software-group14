const Segnalazione = require('../models/Segnalazione');
const { getNextId } = require('../models/counter');

exports.creaSegnalazione = async (req, res) => {
    try {
        const { tipo, commento, coordinate } = req.body;
        const newId = await getNextId('segnalazioneId'); // Utilizza la funzione per ottenere il prossimo ID

        const nuovaSegnalazione = new Segnalazione({
            id: newId, // Usa il nuovo ID generato
            tipo,
            commento,
            coordinate,
            feedbacks: []
        });

        await nuovaSegnalazione.save();
        res.status(201).json(nuovaSegnalazione);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
    }
};

exports.aggiungiCommento = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.idSegnalazione);

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

exports.ottieniCommenti = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.idSegnalazione);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei commenti' });
    }
};
