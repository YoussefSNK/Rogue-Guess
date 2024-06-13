const Log = require('../models/logModel');

// Créer un nouveau log
exports.createLog = (req, res) => {
  const { titre, description } = req.body;
  Log.createLog(titre, description, (err, logId) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(201).json({ id: logId });
    }
  });
};

// Obtenir tous les logs
exports.getLogs = (req, res) => {
  Log.getLogs((err, logs) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(logs);
    }
  });
};
