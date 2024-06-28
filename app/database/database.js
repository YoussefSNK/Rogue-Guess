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
  const dropTablesQueryForm = `
    DROP TABLE IF EXISTS Form;
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
  const createTableQueryForm = `
    CREATE TABLE IF NOT EXISTS Form (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Option TEXT NOT NULL,
      Text TEXT NOT NULL
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


                db.run(dropTablesQueryForm, (err) => {
                  if (err) {
                    console.error('Erreur lors de la suppression des formulaires :', err.message);
                  } else {
                    console.log('Table Form supprimée avec succès.');
  
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


                                db.run(createTableQueryForm, (err) => {
                                  if (err) {
                                    console.error('Erreur lors de la création de la table Form :', err.message);
                                  } else {
                                    console.log('Table Form créée avec succès.');

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
    ("Zyra", "League of legends", "Zyra.png"),


    ("Bulbizarre", "Pokémon 1G", "Bulbizarre.png"),
    ("Herbizarre", "Pokémon 1G", "Herbizarre.png"),
    ("Florizarre", "Pokémon 1G", "Florizarre.png"),
    ("Salamèche", "Pokémon 1G", "Salamèche.png"),
    ("Reptincel", "Pokémon 1G", "Reptincel.png"),
    ("Dracaufeu", "Pokémon 1G", "Dracaufeu.png"),
    ("Carapuce", "Pokémon 1G", "Carapuce.png"),
    ("Carabaffe", "Pokémon 1G", "Carabaffe.png"),
    ("Tortank", "Pokémon 1G", "Tortank.png"),
    ("Chenipan", "Pokémon 1G", "Chenipan.png"),
    ("Chrysacier", "Pokémon 1G", "Chrysacier.png"),
    ("Papilusion", "Pokémon 1G", "Papilusion.png"),
    ("Aspicot", "Pokémon 1G", "Aspicot.png"),
    ("Coconfort", "Pokémon 1G", "Coconfort.png"),
    ("Dardargnan", "Pokémon 1G", "Dardargnan.png"),
    ("Roucool", "Pokémon 1G", "Roucool.png"),
    ("Roucoups", "Pokémon 1G", "Roucoups.png"),
    ("Roucarnage", "Pokémon 1G", "Roucarnage.png"),
    ("Rattata", "Pokémon 1G", "Rattata.png"),
    ("Rattatac", "Pokémon 1G", "Rattatac.png"),
    ("Piafabec", "Pokémon 1G", "Piafabec.png"),
    ("Rapasdepic", "Pokémon 1G", "Rapasdepic.png"),
    ("Abo", "Pokémon 1G", "Abo.png"),
    ("Arbok", "Pokémon 1G", "Arbok.png"),
    ("Pikachu", "Pokémon 1G", "Pikachu.png"),
    ("Raichu", "Pokémon 1G", "Raichu.png"),
    ("Sabelette", "Pokémon 1G", "Sabelette.png"),
    ("Sablaireau", "Pokémon 1G", "Sablaireau.png"),
    ("Nidoran♀", "Pokémon 1G", "NidoranF.png"),
    ("Nidorina", "Pokémon 1G", "Nidorina.png"),
    ("Nidoqueen", "Pokémon 1G", "Nidoqueen.png"),
    ("Nidoran♂", "Pokémon 1G", "NidoranM.png"),
    ("Nidorino", "Pokémon 1G", "Nidorino.png"),
    ("Nidoking", "Pokémon 1G", "Nidoking.png"),
    ("Mélofée", "Pokémon 1G", "Mélofée.png"),
    ("Mélodelfe", "Pokémon 1G", "Mélodelfe.png"),
    ("Goupix", "Pokémon 1G", "Goupix.png"),
    ("Feunard", "Pokémon 1G", "Feunard.png"),
    ("Rondoudou", "Pokémon 1G", "Rondoudou.png"),
    ("Grodoudou", "Pokémon 1G", "Grodoudou.png"),
    ("Nosferapti", "Pokémon 1G", "Nosferapti.png"),
    ("Nosferalto", "Pokémon 1G", "Nosferalto.png"),
    ("Mystherbe", "Pokémon 1G", "Mystherbe.png"),
    ("Ortide", "Pokémon 1G", "Ortide.png"),
    ("Rafflesia", "Pokémon 1G", "Rafflesia.png"),
    ("Paras", "Pokémon 1G", "Paras.png"),
    ("Parasect", "Pokémon 1G", "Parasect.png"),
    ("Mimitoss", "Pokémon 1G", "Mimitoss.png"),
    ("Aéromite", "Pokémon 1G", "Aéromite.png"),
    ("Taupiqueur", "Pokémon 1G", "Taupiqueur.png"),
    ("Triopikeur", "Pokémon 1G", "Triopikeur.png"),
    ("Miaouss", "Pokémon 1G", "Miaouss.png"),
    ("Persian", "Pokémon 1G", "Persian.png"),
    ("Psykokwak", "Pokémon 1G", "Psykokwak.png"),
    ("Akwakwak", "Pokémon 1G", "Akwakwak.png"),
    ("Férosinge", "Pokémon 1G", "Férosinge.png"),
    ("Colossinge", "Pokémon 1G", "Colossinge.png"),
    ("Caninos", "Pokémon 1G", "Caninos.png"),
    ("Arcanin", "Pokémon 1G", "Arcanin.png"),
    ("Ptitard", "Pokémon 1G", "Ptitard.png"),
    ("Têtarte", "Pokémon 1G", "Têtarte.png"),
    ("Tartard", "Pokémon 1G", "Tartard.png"),
    ("Abra", "Pokémon 1G", "Abra.png"),
    ("Kadabra", "Pokémon 1G", "Kadabra.png"),
    ("Alakazam", "Pokémon 1G", "Alakazam.png"),
    ("Machoc", "Pokémon 1G", "Machoc.png"),
    ("Machopeur", "Pokémon 1G", "Machopeur.png"),
    ("Mackogneur", "Pokémon 1G", "Mackogneur.png"),
    ("Chétiflor", "Pokémon 1G", "Chétiflor.png"),
    ("Boustiflor", "Pokémon 1G", "Boustiflor.png"),
    ("Empiflor", "Pokémon 1G", "Empiflor.png"),
    ("Tentacool", "Pokémon 1G", "Tentacool.png"),
    ("Tentacruel", "Pokémon 1G", "Tentacruel.png"),
    ("Racaillou", "Pokémon 1G", "Racaillou.png"),
    ("Gravalanch", "Pokémon 1G", "Gravalanch.png"),
    ("Grolem", "Pokémon 1G", "Grolem.png"),
    ("Ponyta", "Pokémon 1G", "Ponyta.png"),
    ("Galopa", "Pokémon 1G", "Galopa.png"),
    ("Ramoloss", "Pokémon 1G", "Ramoloss.png"),
    ("Flagadoss", "Pokémon 1G", "Flagadoss.png"),
    ("Magnéti", "Pokémon 1G", "Magnéti.png"),
    ("Magnéton", "Pokémon 1G", "Magnéton.png"),
    ("Canarticho", "Pokémon 1G", "Canarticho.png"),
    ("Doduo", "Pokémon 1G", "Doduo.png"),
    ("Dodrio", "Pokémon 1G", "Dodrio.png"),
    ("Otaria", "Pokémon 1G", "Otaria.png"),
    ("Lamantine", "Pokémon 1G", "Lamantine.png"),
    ("Tadmorv", "Pokémon 1G", "Tadmorv.png"),
    ("Grotadmorv", "Pokémon 1G", "Grotadmorv.png"),
    ("Kokiyas", "Pokémon 1G", "Kokiyas.png"),
    ("Crustabri", "Pokémon 1G", "Crustabri.png"),
    ("Fantominus", "Pokémon 1G", "Fantominus.png"),
    ("Spectrum", "Pokémon 1G", "Spectrum.png"),
    ("Ectoplasma", "Pokémon 1G", "Ectoplasma.png"),
    ("Onix", "Pokémon 1G", "Onix.png"),
    ("Soporifik", "Pokémon 1G", "Soporifik.png"),
    ("Hypnomade", "Pokémon 1G", "Hypnomade.png"),
    ("Krabby", "Pokémon 1G", "Krabby.png"),
    ("Krabboss", "Pokémon 1G", "Krabboss.png"),
    ("Voltorbe", "Pokémon 1G", "Voltorbe.png"),
    ("Électrode", "Pokémon 1G", "Électrode.png"),
    ("Noeunoeuf", "Pokémon 1G", "Noeunoeuf.png"),
    ("Noadkoko", "Pokémon 1G", "Noadkoko.png"),
    ("Osselait", "Pokémon 1G", "Osselait.png"),
    ("Ossatueur", "Pokémon 1G", "Ossatueur.png"),
    ("Kicklee", "Pokémon 1G", "Kicklee.png"),
    ("Tygnon", "Pokémon 1G", "Tygnon.png"),
    ("Excelangue", "Pokémon 1G", "Excelangue.png"),
    ("Smogo", "Pokémon 1G", "Smogo.png"),
    ("Smogogo", "Pokémon 1G", "Smogogo.png"),
    ("Rhinocorne", "Pokémon 1G", "Rhinocorne.png"),
    ("Rhinoféros", "Pokémon 1G", "Rhinoféros.png"),
    ("Leveinard", "Pokémon 1G", "Leveinard.png"),
    ("Saquedeneu", "Pokémon 1G", "Saquedeneu.png"),
    ("Kangourex", "Pokémon 1G", "Kangourex.png"),
    ("Hypotrempe", "Pokémon 1G", "Hypotrempe.png"),
    ("Hypocéan", "Pokémon 1G", "Hypocéan.png"),
    ("Poissirène", "Pokémon 1G", "Poissirène.png"),
    ("Poissoroy", "Pokémon 1G", "Poissoroy.png"),
    ("Stari", "Pokémon 1G", "Stari.png"),
    ("Staross", "Pokémon 1G", "Staross.png"),
    ("M. Mime", "Pokémon 1G", "M. Mime.png"),
    ("Insécateur", "Pokémon 1G", "Insécateur.png"),
    ("Lippoutou", "Pokémon 1G", "Lippoutou.png"),
    ("Élektek", "Pokémon 1G", "Élektek.png"),
    ("Magmar", "Pokémon 1G", "Magmar.png"),
    ("Scarabrute", "Pokémon 1G", "Scarabrute.png"),
    ("Tauros", "Pokémon 1G", "Tauros.png"),
    ("Magicarpe", "Pokémon 1G", "Magicarpe.png"),
    ("Léviator", "Pokémon 1G", "Léviator.png"),
    ("Lokhlass", "Pokémon 1G", "Lokhlass.png"),
    ("Métamorph", "Pokémon 1G", "Métamorph.png"),
    ("Évoli", "Pokémon 1G", "Évoli.png"),
    ("Aquali", "Pokémon 1G", "Aquali.png"),
    ("Voltali", "Pokémon 1G", "Voltali.png"),
    ("Pyroli", "Pokémon 1G", "Pyroli.png"),
    ("Porygon", "Pokémon 1G", "Porygon.png"),
    ("Amonita", "Pokémon 1G", "Amonita.png"),
    ("Amonistar", "Pokémon 1G", "Amonistar.png"),
    ("Kabuto", "Pokémon 1G", "Kabuto.png"),
    ("Kabutops", "Pokémon 1G", "Kabutops.png"),
    ("Ptéra", "Pokémon 1G", "Ptéra.png"),
    ("Ronflex", "Pokémon 1G", "Ronflex.png"),
    ("Artikodin", "Pokémon 1G", "Artikodin.png"),
    ("Électhor", "Pokémon 1G", "Électhor.png"),
    ("Sulfura", "Pokémon 1G", "Sulfura.png"),
    ("Minidraco", "Pokémon 1G", "Minidraco.png"),
    ("Draco", "Pokémon 1G", "Draco.png"),
    ("Dracolosse", "Pokémon 1G", "Dracolosse.png"),
    ("Mewtwo", "Pokémon 1G", "Mewtwo.png"),
    ("Mew", "Pokémon 1G", "Mew.png"),



    
    ("1", "Test", "1.png"),
    ("2", "Test", "2.png")
    
    ;
  `;

  const insertQueryRequest = `
    INSERT INTO Request (Title, SQL_Request, Image) VALUES
    ("Joueurs de Raimon", "SELECT Name FROM Entity WHERE Licence = 'Inazuma Eleven'", "inazuma.png"),
    ("Champions de League of legends", "SELECT Name FROM Entity WHERE Licence = 'League of legends'", "lol.png"),
    ("Pokémon 1G", "SELECT Name FROM Entity WHERE Licence = 'Pokémon 1G'", "pokemon.png"),
    ("Valeurs de test", "SELECT Name FROM Entity WHERE Licence = 'Test'", "Les valeurs sont 1 et 2.png")
    ;
  `;

  const insertQueryForm = `
    INSERT INTO Form (Title, Option, Text) VALUES
    ("Des pouvoirs !", "1", "Ce serait bien si on pouvait avoir des pouvoirs pour embêter nos adversaires pendant la partie !"),
    ("On voit pas le dernier perso annoncé", "4", "Lorsque le dernier personnage est cité il n'apparait pas derrière nous dans l'écran de victoire");
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


    db.run(insertQueryForm, (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données initiales dans Form :', err.message);
      } else {
        console.log('Données des Form insérées avec succès.');
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
