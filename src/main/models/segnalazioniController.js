const Segnalazione = require('./segnalazione');
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
        const { tipo, commento, coordinate } = req.body;
        const nextId = await getNextSequence('segnalazioneid');

        const nuovaSegnalazione = new Segnalazione({
            _id: nextId,
            tipo: tipo,
            commento: commento,
            data: new Date(), // Aggiungi la data corrente
            coordinate: coordinate,
            feedbacks: []
        });

        const segnalazioneSalvata = await nuovaSegnalazione.save();

        res.status(201).json(segnalazioneSalvata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
    }
};

exports.aggiungiCommento = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.id);

        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }

        const nuovoCommento = {
            username: req.body.username,
            commento: req.body.commento,
            data: new Date()
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
        const segnalazione = await Segnalazione.findById(req.params.id);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei commenti' });
    }
};

exports.ottieniFeedbacks = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.id);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json(segnalazione.feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei feedback' });
    }
};

exports.eliminaSegnalazione = async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findByIdAndDelete(req.params.idSegnalazione);
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }
        res.json({ message: 'Segnalazione eliminata con successo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione della segnalazione' });
    }
};
