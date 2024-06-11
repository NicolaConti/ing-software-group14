const Segnalazione = require('./Segnalazione');
const Counter = require('./counter');

async function getNextSequence(name) {
    const counter = await Counter.findByIdAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

exports.creaSegnalazione = async (req, res) => {
    try {
        const { tipo, commento, data, coordinate } = req.body;
        const nextId = await getNextSequence('segnalazioneid');

        const nuovaSegnalazione = new Segnalazione({
            _id: nextId,
            tipo: tipo,
            commento: commento,
            data: data,
            coordinate: coordinate
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


// Funzione per ottenere i commenti di una segnalazione
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

// Funzione per ottenere i feedback di una segnalazione
exports.ottieniFeedbacks = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.idSegnalazione);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei feedback' });
    }
};
