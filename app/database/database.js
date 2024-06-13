const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Créer/ouvrir la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    createTables();
  }
});

// Créer la table Logs si elle n'existe pas déjà et insérer des données
function createTables() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Titre TEXT NOT NULL,
      Description TEXT NOT NULL
    );
  `;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table:', err.message);
    } else {
      console.log('Table Logs créée avec succès.');
      insertInitialData();
    }
  });
}

// Insérer des données initiales dans la table Logs
function insertInitialData() {
  const insertQuery = `
    INSERT INTO Logs (Titre, Description) VALUES
    ('Titre 1', 'Description 1'),
    ('Titre 2', 'Description 2'),
    ('Titre 3', 'Description 3');
  `;
  
  db.run(insertQuery, (err) => {
    if (err) {
      console.error('Erreur lors de l\'insertion des données initiales:', err.message);
    } else {
      console.log('Données initiales insérées avec succès.');
    }
  });
}

module.exports = db;
