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

function createTables() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Titre TEXT NOT NULL,
      Description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Entity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Licence TEXT NOT NULL,
      Image TEXT NOT NULL
    );
  `;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table:', err.message);
    } else {
      console.log('Table Logs et Entity créées avec succès.');
      insertInitialData();
    }
  });
}

function insertInitialData() {
  const insertQuery = `
    INSERT INTO Logs (Titre, Description) VALUES
    ('Update 1.0', 'Rien ajouté'),
    ('Update 1.1', "Ajout du choix de l'avatar"),
    ('Update 2.0', "Ajout de l'ajout");

    INSERT INTO Entity (Name, Licence, Image) VALUES
    ('Xavier Foster', 'Inazuma Eleven', 'Xavier Foster.png'),
    ('Aitor Cazador', 'Inazuma Eleven', 'Aitor Cazador.png'),
    ("Veigar", "League of legends", "Veigar.png");
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
