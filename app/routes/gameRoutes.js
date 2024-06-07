// gameRoutes.js
const express = require('express');
const router = express.Router();
//const gameController = require('../controllers/gameController');


router.get('/', (req, res) => {
    res.render('game'); // Rendre la page game.ejs depuis le dossier views/
});

module.exports = router;