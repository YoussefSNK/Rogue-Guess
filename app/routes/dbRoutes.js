const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');

router.get('/forms', dbController.getForms);

module.exports = router;