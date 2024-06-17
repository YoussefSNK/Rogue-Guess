const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

const db = require('../database/database');



// Route pour créer un log
router.post('/logs', logController.createLog);

// Route pour obtenir tous les logs
router.get('/logs', logController.getLogs);

router.get('/requests', logController.getRequests);

router.get('/images', (req, res) => {
    const query = 'SELECT Image FROM Request';
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des images:', err.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des images' });
      } else {
        res.json(rows);
      }
    });
  });

module.exports = router;
