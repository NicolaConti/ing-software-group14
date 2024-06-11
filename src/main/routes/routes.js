const express = require('express');
const router = express.Router();
const segnalazioneController = require('../models/segnalazioniController');

// Rotte per le segnalazioni
router.post('/segnalazioni', segnalazioneController.creaSegnalazione);
router.post('/segnalazioni/:id/commento', segnalazioneController.aggiungiCommento);
router.get('/segnalazioni/:id/commenti', segnalazioneController.ottieniCommenti);
router.get('/segnalazioni/:id/feedbacks', segnalazioneController.ottieniFeedbacks);
router.delete('/segnalazioni/:idSegnalazione', segnalazioneController.eliminaSegnalazione);

module.exports = router;
