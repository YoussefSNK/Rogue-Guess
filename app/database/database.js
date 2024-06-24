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
    
    ("Mark Evans", "Inazuma Eleven", "Mark Evans.png"),
    ("Nathan Swift", "Inazuma Eleven", "Nathan Swift.png"),  
    ("Jack Wallside", "Inazuma Eleven", "Jack Wallside.png"),    
    ("Jim Wraith", "Inazuma Eleven", "Jim Wraith.png"),
    ("Tod Ironside", "Inazuma Eleven", "Tod Ironside.png"),      
    ("Steve Grim", "Inazuma Eleven", "Steve Grim.png"),
    ("Timmy Saunders", "Inazuma Eleven", "Timmy Saunders.png"),  
    ("Sam Kincaid", "Inazuma Eleven", "Sam Kincaid.png"),        
    ("Maxwell Carson", "Inazuma Eleven", "Maxwell Carson.png"),  
    ("Axel Blaze", "Inazuma Eleven", "Axel Blaze.png"),
    ("Kevin Dragonfly", "Inazuma Eleven", "Kevin Dragonfly.png"),
    ("William Glass", "Inazuma Eleven", "William Glass.png"),    
    ("Bobby Shearer", "Inazuma Eleven", "Bobby Shearer.png"),    
    ("Jude Sharp", "Inazuma Eleven", "Jude Sharp.png"),
    ("Erik Eagle", "Inazuma Eleven", "Erik Eagle.png"),
    ("Shadow Cimmerian", "Inazuma Eleven", "Shadow Cimmerian.png"),
    ("Byron Love", "Inazuma Eleven", "Byron Love.png"),
    ("Shawn Froste", "Inazuma Eleven", "Shawn Froste.png"),
    ("Scotty Banyan", "Inazuma Eleven", "Scotty Banyan.png"),
    ("Suzette Hartland", "Inazuma Eleven", "Suzette Hartland.png"),
    ("Darren LaChance", "Inazuma Eleven", "Darren LaChance.png"),
    ("Hurley Kane", "Inazuma Eleven", "Hurley Kane.png"),
    ("Archer Hawkins", "Inazuma Eleven", "Archer Hawkins.png"),
    ("Thor Stoutberg", "Inazuma Eleven", "Thor Stoutberg.png"),
    ("Austin Hobbes", "Inazuma Eleven", "Austin Hobbes.png"),
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
    ("Kennen", "League of legends", "Kennen.png"),
        
        
    ("Kha'Zix", "League of legends", "Kha'Zix.png"),
    ("Kindred", "League of legends", "Kindred.png"),
    ("Kled", "League of legends", "Kled.png"),
    ("Kog'Maw", "League of legends", "Kog'Maw.png"),
    ("Leblanc", "League of legends", "Leblanc.png"),
    ("Lee Sin", "League of legends", "Lee Sin.png"),
    ("Leona", "League of legends", "Leona.png"),
    ("Lillia", "League of legends", "Lillia.png"),
    ("Lissandra", "League of legends", "Lissandra.png"),
    ("Lucian", "League of legends", "Lucian.png"),
    ("Lulu", "League of legends", "Lulu.png"),
    ("Lux", "League of legends", "Lux.png"),
    ("Malphite", "League of legends", "Malphite.png"),
    ("Malzahar", "League of legends", "Malzahar.png"),
    ("Maokai", "League of legends", "Maokai.png"),
    ("Maître Yi", "League of legends", "Maître Yi.png"),
    ("Milio", "League of legends", "Milio.png"),
    ("Miss Fortune", "League of legends", "Miss Fortune.png"),
    ("Mordekaiser", "League of legends", "Mordekaiser.png"),
    ("Morgana", "League of legends", "Morgana.png"),
    ("Naafiri", "League of legends", "Naafiri.png"),
    ("Nami", "League of legends", "Nami.png"),
    ("Nasus", "League of legends", "Nasus.png"),
    ("Nautilus", "League of legends", "Nautilus.png"),
    ("Neeko", "League of legends", "Neeko.png"),
    ("Nidalee", "League of legends", "Nidalee.png"),
    ("Nilah", "League of legends", "Nilah.png"),
    ("Nocturne", "League of legends", "Nocturne.png"),
    ("Nunu et Willump", "League of legends", "Nunu et Willump.png"),
    ("Olaf", "League of legends", "Olaf.png"),
    ("Orianna", "League of legends", "Orianna.png"),
    ("Ornn", "League of legends", "Ornn.png"),
    ("Pantheon", "League of legends", "Pantheon.png"),
    ("Poppy", "League of legends", "Poppy.png"),
    ("Pyke", "League of legends", "Pyke.png"),
    ("Qiyana", "League of legends", "Qiyana.png"),
    ("Quinn", "League of legends", "Quinn.png"),
    ("Rakan", "League of legends", "Rakan.png"),
    ("Rammus", "League of legends", "Rammus.png"),
    ("Rek'Sai", "League of legends", "Rek'Sai.png"),
    ("Rell", "League of legends", "Rell.png"),
    ("Renata Glasc", "League of legends", "Renata Glasc.png"),
    ("Renekton", "League of legends", "Renekton.png"),
    ("Rengar", "League of legends", "Rengar.png"),
    ("Riven", "League of legends", "Riven.png"),
    ("Rumble", "League of legends", "Rumble.png"),
    ("Ryze", "League of legends", "Ryze.png"),
    ("Samira", "League of legends", "Samira.png"),
    ("Sejuani", "League of legends", "Sejuani.png"),
    ("Senna", "League of legends", "Senna.png"),
    ("Sett", "League of legends", "Sett.png"),
    ("Shaco", "League of legends", "Shaco.png"),
    ("Shen", "League of legends", "Shen.png"),
    ("Shyvana", "League of legends", "Shyvana.png"),
    ("Singed", "League of legends", "Singed.png"),
    ("Singed", "League of legends", "Singed.png"),
    ("Sion", "League of legends", "Sion.png"),
    ("Sivir", "League of legends", "Sivir.png"),
    ("Skarner", "League of legends", "Skarner.png"),
    ("Smolder", "League of legends", "Smolder.png"),
    ("Sona", "League of legends", "Sona.png"),
    ("Soraka", "League of legends", "Soraka.png"),
    ("Swain", "League of legends", "Swain.png"),
    ("Sylas", "League of legends", "Sylas.png"),
    ("Syndra", "League of legends", "Syndra.png"),
    ("Séraphine", "League of legends", "Séraphine.png"),
    ("Tahm Kench", "League of legends", "Tahm Kench.png"),
    ("Taliyah", "League of legends", "Taliyah.png"),
    ("Talon", "League of legends", "Talon.png"),
    ("Taric", "League of legends", "Taric.png"),
    ("Teemo", "League of legends", "Teemo.png"),
    ("Thresh", "League of legends", "Thresh.png"),
    ("Tristana", "League of legends", "Tristana.png"),
    ("Trundle", "League of legends", "Trundle.png"),
    ("Tryndamere", "League of legends", "Tryndamere.png"),
    ("Twisted Fate", "League of legends", "Twisted Fate.png"),
    ("Twitch", "League of legends", "Twitch.png"),
    ("Udyr", "League of legends", "Udyr.png"),
    ("Urgot", "League of legends", "Urgot.png"),
    ("Varus", "League of legends", "Varus.png"),
    ("Vayne", "League of legends", "Vayne.png"),
    ("Veigar", "League of legends", "Veigar.png"),
    ("Vel'Koz", "League of legends", "Vel'Koz.png"),
    ("Vex", "League of legends", "Vex.png"),
    ("Vi", "League of legends", "Vi.png"),
    ("Viego", "League of legends", "Viego.png"),
    ("Viktor", "League of legends", "Viktor.png"),
    ("Vladimir", "League of legends", "Vladimir.png"),
    ("Volibear", "League of legends", "Volibear.png"),
    ("Warwick", "League of legends", "Warwick.png"),
    ("Wukong", "League of legends", "Wukong.png"),
    ("Xayah", "League of legends", "Xayah.png"),
    ("Xerath", "League of legends", "Xerath.png"),
    ("Xin Zhao", "League of legends", "Xin Zhao.png"),
    ("Yasuo", "League of legends", "Yasuo.png"),
    ("Yone", "League of legends", "Yone.png"),
    ("Yorick", "League of legends", "Yorick.png"),
    ("Yuumi", "League of legends", "Yuumi.png"),
    ("Zac", "League of legends", "Zac.png"),
    ("Zed", "League of legends", "Zed.png"),
    ("Zeri", "League of legends", "Zeri.png"),
    ("Ziggs", "League of legends", "Ziggs.png"),
    ("Zilean", "League of legends", "Zilean.png"),
    ("Zoé", "League of legends", "Zoé.png"),
    ("Zyra", "League of legends", "Zyra.png")
        
        
    
    ;
  `;

  const insertQueryRequest = `
    INSERT INTO Request (Title, SQL_Request, Image) VALUES
    ("Joueurs de Raimon", "SELECT Name FROM Entity WHERE Licence = 'Inazuma Eleven'", "inazuma.png"),
    ("Champions de League of legends", "SELECT Name FROM Entity WHERE Licence = 'League of legends'", "lol.png"),
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
