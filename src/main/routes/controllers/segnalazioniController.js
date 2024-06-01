
const Segnalazione = require('../models/segnalazione');

// Funzione per creare una nuova segnalazione
exports.creaSegnalazione = async (req, res) => {
    try {
        // Estrarre i dati dalla richiesta
        const { tipo, commento, data, coordinate } = req.body;

        // Creare una nuova istanza di Segnalazione
        const nuovaSegnalazione = new Segnalazione({
            tipo: tipo,
            commento: commento,
            data: data,
            coordinate: coordinate
        });

        // Salvare la nuova segnalazione nel database
        const segnalazioneSalvata = await nuovaSegnalazione.save();

        // Rispondere con la nuova segnalazione creata
        res.status(201).json(segnalazioneSalvata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
    }
};

// Funzione per aggiungere un commento a una segnalazione esistente
exports.aggiungiCommento = async (req, res) => {
    try {
        // Trovare la segnalazione tramite l'id nel parametro della richiesta
        const segnalazione = await Segnalazione.findById(req.params.idSegnalazione);

        // Se la segnalazione non è stata trovata, restituire un errore 404
        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }

        // Aggiungere il commento alla segnalazione
        segnalazione.commenti.push(req.body.commento);

        // Salvare la segnalazione aggiornata nel database
        const segnalazioneAggiornata = await segnalazione.save();

        // Rispondere con la segnalazione aggiornata
        res.json(segnalazioneAggiornata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta del commento' });
    }
};
