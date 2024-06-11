const express = require('express');
const router = express.Router();
const segnalazioniController = require('../models/segnalazioniController'); // Modificato per puntare al controller

// Rotte per le segnalazioni
router.post('/segnalazioni', segnalazioniController.creaSegnalazione);
router.post('/segnalazioni/:idSegnalazione/commento', segnalazioniController.aggiungiCommento);
router.get('/segnalazioni/:idSegnalazione/commenti', segnalazioniController.ottieniCommenti);
//router.delete('/segnalazioni/:idSegnalazione', segnalazioniController.eliminaSegnalazione);

module.exports = router;
