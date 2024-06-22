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



router.get('/entities/:theme', (req, res) => {
  const theme = req.params.theme;
  const query = 'SELECT Name FROM Entity WHERE Licence = ?';
  
  db.all(query, [theme], (err, rows) => {
      if (err) {
          console.error('Erreur lors de la récupération des entités:', err.message);
          res.status(500).json({ error: 'Erreur lors de la récupération des entités' });
      } else {
          res.json(rows.map(row => row.Name));
      }
  });
});


router.get('/sqlrequest/:theme', (req, res) => {
  const theme = req.params.theme;
  const query = 'SELECT SQL_Request FROM Request WHERE Image = ?';
  
  db.all(query, [theme], (err, rows) => {
      if (err) {
          console.error('Erreur de con:', err.message);
          res.status(500).json({ error: 'Erreur de con 2' });
      } else {
          res.json(rows.map(row => row.Name));
      }
  });
});




module.exports = router;
