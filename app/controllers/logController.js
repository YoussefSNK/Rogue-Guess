const Log = require('../models/logModel');
const db = require('../database/database');

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

exports.getRequests = (req, res) => {
  Log.getRequests((err, requests) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(requests);
    }
  });
};


exports.getEntitiesBySQLRequest = (sqlRequest, callback) => {
  db.all(sqlRequest[0], (err, rows) => {
      if (err) {
          console.error('Erreur lors de la récupération des entités par requête SQL:', err);
          callback(err, null);
      } else {
          const entities = rows.map(row => row.Name);
          // console.log('Entités récupérées pour la requête SQL:', entities);
          callback(null, entities);
      }
  });
};

exports.getSQLByTheme = (theme, callback) => {
  const query = "SELECT SQL_Request FROM Request WHERE Title = ?";
  db.all(query, [theme], (err, rows) => {
      if (err) {
          console.error('Erreur lors de la récupération de la requête SQL par thème:', err);
          callback(err, null);
      } else {
          // Vous devez mapper les résultats sur la colonne SQL_Request
          const sqlRequests = rows.map(row => row.SQL_Request);
          // console.log('Requêtes SQL récupérées pour le thème', theme, ':', sqlRequests);
          callback(null, sqlRequests);
      }
  });
};


