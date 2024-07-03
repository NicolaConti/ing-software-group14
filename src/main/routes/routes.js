const express = require('express');
const router = express.Router();
const segnalazioneController = require('../models/segnalazioniController');

// Rotte per le segnalazioni
router.post('/segnalazioni', segnalazioneController.creaSegnalazione);
router.post('/segnalazioni/:idSegnalazione/commento', segnalazioneController.aggiungiCommento);
router.get('/segnalazioni/:idSegnalazione/commenti', segnalazioneController.ottieniCommenti);

// Assicurati di aver incluso questo router nel tuo file server principale
// app.use('/api', router);

module.exports = router;
