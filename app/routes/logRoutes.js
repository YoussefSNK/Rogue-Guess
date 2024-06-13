const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Route pour créer un log
router.post('/logs', logController.createLog);

// Route pour obtenir tous les logs
router.get('/logs', logController.getLogs);

module.exports = router;
