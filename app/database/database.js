const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    createTables();
  }
});

function createTables() {
  const dropTablesQueryLogs = `
    DROP TABLE IF EXISTS Logs;
  `;
  const dropTablesQueryEntity = `
    DROP TABLE IF EXISTS Entity;
  `;
  const dropTablesQueryRequest = `
    DROP TABLE IF EXISTS Request;
  `;
  const createTableQueryLogs = `
    CREATE TABLE IF NOT EXISTS Logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Titre TEXT NOT NULL,
      Description TEXT NOT NULL
    );
  `;
  const createTableQueryEntity = `
    CREATE TABLE IF NOT EXISTS Entity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Licence TEXT NOT NULL,
      Image TEXT NOT NULL
    );
  `;
  const createTableQueryRequest = `
    CREATE TABLE IF NOT EXISTS Request (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      SQL_Request TEXT NOT NULL,
      Image TEXT NOT NULL
    );
  `;

  db.serialize(() => {
    // Supprimer les tables existantes
    db.run(dropTablesQueryLogs, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression des logs :', err.message);
      } else {
        console.log('Tables Logs supprimée avec succès.');

        db.run(dropTablesQueryEntity, (err) => {
          if (err) {
            console.error('Erreur lors de la suppression des entités :', err.message);
          } else {
            console.log('Table Entity supprimée avec succès.');

            db.run(dropTablesQueryRequest, (err) => {
              if (err) {
                console.error('Erreur lors de la suppression des requêtes :', err.message);
              } else {
                console.log('Table Request supprimée avec succès.');

                // Créer les tables
                db.run(createTableQueryLogs, (err) => {
                  if (err) {
                    console.error('Erreur lors de la création de la table Logs :', err.message);
                  } else {
                    console.log('Table Logs créée avec succès.');

                    db.run(createTableQueryEntity, (err) => {
                      if (err) {
                        console.error('Erreur lors de la création de la table Entity :', err.message);
                      } else {
                        console.log('Table Entity créée avec succès.');

                        db.run(createTableQueryRequest, (err) => {
                          if (err) {
                            console.error('Erreur lors de la création de la table Request :', err.message);
                          } else {
                            console.log('Table Request créée avec succès.');

                            // Insérer les données initiales
                            insertInitialData();
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}

function insertInitialData() {
  const insertQueryLogs = `
    INSERT INTO Logs (Titre, Description) VALUES
    ('Update 1.0', 'Rien ajouté'),
    ('Update 1.1', "Ajout du choix de l'avatar"),
    ('Update 2.0', "Ajout de l'ajout");
  `;

  const insertQueryEntity = `
    INSERT INTO Entity (Name, Licence, Image) VALUES
    ('Xavier Foster', 'Inazuma Eleven', 'Xavier Foster.png'),
    ('Aitor Cazador', 'Inazuma Eleven', 'Aitor Cazador.png'),
    ("Aatrox", "League of legends", "Aatrox.png"),
    ("Ahri", "League of legends", "Ahri.png"),
    ("Akali", "League of legends", "Akali.png"),
    ("Akshan", "League of legends", "Akshan.png"),
    ("Alistar", "League of legends", "Alistar.png"),
    ("Amumu", "League of legends", "Amumu.png"),
    ("Anivia", "League of legends", "Anivia.png"),
    ("Annie", "League of legends", "Annie.png"),
    ("Aphelios", "League of legends", "Aphelios.png"),
    ("Ashe", "League of legends", "Ashe.png"),
    ("Aurelion Sol", "League of legends", "Aurelion Sol.png"),
    ("Azir", "League of legends", "Azir.png"),
    ("Bard", "League of legends", "Bard.png"),
    ("Bel'veth", "League of legends", "Bel'Veth.png"),
    ("Blitzcrank", "League of legends", "Blitzcrank.png"),
    ("Brand", "League of legends", "Brand.png"),
    ("Braum", "League of legends", "Braum.png"),
    ("Briar", "League of legends", "Briar.png"),
    ("Caitlyn", "League of legends", "Caitlyn.png"),
    ("Camille", "League of legends", "Camille.png"),
    ("Cassiopeia", "League of legends", "Cassiopeia.png"),
    ("Cho'Gath", "League of legends", "Cho'Gath.png"),
    ("Corki", "League of legends", "Corki.png"),
    ("Darius", "League of legends", "Darius.png"),
    ("Diana", "League of legends", "Diana.png"),
    ("Dr. Mundo", "League of legends", "Dr. Mundo.png"),
    ("Draven", "League of legends", "Draven.png"),
    ("Ekko", "League of legends", "Ekko.png"),
    ("Elise", "League of legends", "Elise.png"),
    ("Evelynn", "League of legends", "Evelynn.png"),
    ("Ezreal", "League of legends", "Ezreal.png"),
    ("Fiddlesticks", "League of legends", "Fiddlesticks.png"),
    ("Fiora", "League of legends", "Fiora.png"),
    ("Fizz", "League of legends", "Fizz.png"),
    ("Galio", "League of legends", "Galio.png"),
    ("Gangplank", "League of legends", "Gangplank.png"),
    ("Garen", "League of legends", "Garen.png"),
    ("Gnar", "League of legends", "Gnar.png"),
    ("Gragas", "League of legends", "Gragas.png"),
    ("Graves", "League of legends", "Graves.png"),
    ("Gwen", "League of legends", "Gwen.png"),
    ("Hecarim", "League of legends", "Hecarim.png"),
    ("Heimerdinger", "League of legends", "Heimerdinger.png"),
    ("Hwei", "League of legends", "Hwei.png"),
    ("Illaoi", "League of legends", "Illaoi.png"),
    ("Irelia", "League of legends", "Irelia.png"),
    ("Ivern", "League of legends", "Ivern.png"),
    ("Janna", "League of legends", "Janna.png"),
    ("Jarvan IV", "League of legends", "Jarvan IV.png"),
    ("Jax", "League of legends", "Jax.png"),
    ("Jayce", "League of legends", "Jayce.png"),
    ("Jhin", "League of legends", "Jhin.png"),
    ("Jinx", "League of legends", "Jinx.png"),
    ("K'santé", "League of legends", "K'santé.png"),
    ("Kai'sa", "League of legends", "Kai'sa.png"),
    ("Kalista", "League of legends", "Kalista.png"),
    ("Karma", "League of legends", "Karma.png"),
    ("Karthus", "League of legends", "Karthus.png"),
    ("Kassadin", "League of legends", "Kassadin.png"),
    ("Katarina", "League of legends", "Katarina.png"),
    ("Kayle", "League of legends", "Kayle.png"),
    ("Kayn", "League of legends", "Kayn.png"),
    ("Kennen", "League of legends", "Kennen.png");
  `;

  const insertQueryRequest = `
    INSERT INTO Request (Title, SQL_Request, Image) VALUES
    ("Tous les personnages d'Inazuma Eleven", "SELECT * FROM Entity WHERE Licence = 'Inazuma Eleven'", "inazuma.png"),
    ("Tous les champions de League of legends", "SELECT * FROM Entity WHERE Licence = 'League of legends'", "lol.png"),
    ("azrkadzd", "aozdjiazjdoia", "random.png");
  `;

  db.serialize(() => {
    db.run(insertQueryLogs, (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données initiales dans Logs :', err.message);
      } else {
        console.log('Données des Logs insérées avec succès.');
      }
    });

    db.run(insertQueryEntity, (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données initiales dans Entity :', err.message);
      } else {
        console.log('Données des Entity insérées avec succès.');
      }
    });

    db.run(insertQueryRequest, (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données initiales dans Request :', err.message);
      } else {
        console.log('Données des Request insérées avec succès.');
      }
    });
  });
}

module.exports = db;
