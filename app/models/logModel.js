const db = require('../database/database');

// Fonction pour insérer un log
exports.createLog = (titre, description, callback) => {
  const query = 'INSERT INTO Logs (Titre, Description) VALUES (?, ?)';
  db.run(query, [titre, description], function(err) {
    callback(err, this.lastID);
  });
};

// Fonction pour obtenir tous les logs
exports.getLogs = (callback) => {
  const query = 'SELECT * FROM Logs';
  db.all(query, [], (err, rows) => {
    callback(err, rows);
  });
};
