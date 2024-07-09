const Segnalazione = require('./Segnalazione');
const Counter = require('./counter');

exports.creaSegnalazione = async (req, res) => {
    try {
        const { tipo, commento, data, coordinate } = req.body;
        const nextId = await getNextSequence('segnalazioneid');

        const nuovaSegnalazione = new Segnalazione({
            id: nextId,
            tipo,
            commento,
            data,
            coordinate
        });

        const segnalazioneSalvata = await nuovaSegnalazione.save();
        res.status(201).json(segnalazioneSalvata);
    } catch (error) {
        console.error('Errore durante la creazione della segnalazione:', error);
        res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
    }
};

exports.aggiungiCommento = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({ id: req.params.idSegnalazione });

        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }

        const nuovoCommento = {
            username: req.body.username,
            commento: req.body.commento,
            reportId: req.params.idSegnalazione
        };

        segnalazione.feedbacks.push(nuovoCommento);

        const segnalazioneAggiornata = await segnalazione.save();
        res.json(segnalazioneAggiornata);
    } catch (error) {
        console.error('Errore durante l\'aggiunta del commento:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta del commento' });
    }
};

exports.ottieniCommenti = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({ id: req.params.idSegnalazione });
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error('Errore durante il recupero dei commenti:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei commenti' });
    }
};
