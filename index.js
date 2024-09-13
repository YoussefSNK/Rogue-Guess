const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cors = require('cors');

const port = process.env.PORT || 3000;



// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:8080'}));
  


const logRoutes = require('./app/routes/logRoutes');
const dbRoutes = require('./app/routes/dbRoutes');
const logController = require('./app/controllers/logController');
const dbController = require('./app/controllers/dbController');

process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée :', err);
    process.exit(1); 
});


// Configurer le moteur de vue
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');


// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/formulaire', (req, res) => {
    dbController.createFormEntry(req, res);
});

app.use('/api', dbRoutes);
app.use('/api', logRoutes);

let lobbies = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {

        const data = JSON.parse(message);
        switch (data.type.trim()) {
            case 'create_room':
                data.userInfo.ws = ws;
                handleCreateRoom(data.userInfo, ws);
                break;
            case 'join_room':
                data.userInfo.ws = ws;
                handleJoinRoom(data.userInfo, ws);
                break;
            case 'chat_message':
                handleChatMessage(data.message, ws);
                break;
            case 'ask_players':
                handleAskPlayers(data, ws);
                break;
            case 'start_game':
                handleStartGame(data, ws);
                break;
            case 'player_arrived':
                handlePlayerArrived(data, ws);
                break;
            case 'text_update':
                handleTextUpdate(data, ws);
                break;
            case 'send_answer':
                handleSendAnswer(data, ws);
                break;


            default:
                console.log('Type de message inconnu:', data.type);
                break;
        }

    });


    ws.on('close', () => {
        let lobbyCode = null;
        let playerIndex = -1;

        // Parcours des lobbies pour trouver l'utilisateur déconnecté
        for (const code in lobbies) {
            const index = lobbies[code].Joueurs.findIndex(player => player.ws === ws);
            if (index !== -1) {
                lobbyCode = code;
                playerIndex = index;
                break;
            }
        }

        if (lobbyCode !== null && playerIndex !== -1) {
            // Supprimer le joueur du lobby
            lobbies[lobbyCode].Joueurs.splice(playerIndex, 1);

            // Si le lobby est vide, on peut éventuellement le supprimer
            if (lobbies[lobbyCode].length === 0) {
                delete lobbies[lobbyCode];
            } else {
                handleAskPlayers({ gameCode: lobbyCode }, ws);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

});


function generateGameCode() {
    return crypto.randomBytes(3).toString('hex');
}
function handleCreateRoom(userInfo, ws) {
    const gameCode = generateGameCode();

    lobbies[gameCode] = {
        enCours: false,
        perfectAnswer: true, //permettra de check si la réponse est parfaite (est true tant qu'une mauvaise réponse n'a pas été envoyée)
        auTourDe: null, //ce sera l'index du joueur dont c'est le tour
        theme: "",
        entities: [],
        Joueurs: [
            {
                name: userInfo.username,
                avatar: userInfo.avatar,
                state: "alive",
                ws: ws,                     // WebSocket associée
                pouvoirs: [],
                total_score: 0,
                score: 0
            }
        ],
        alivePlayersID: [],
        pouvoirs_dispo: []
    };
    ws.send(JSON.stringify({ type: 'room_created', gameCode }));
}
function handleJoinRoom(userInfo, ws) {
    const { gameCode } = userInfo;
    
    if (lobbies[gameCode]) {
        lobbies[gameCode].Joueurs.push({
            name: userInfo.username,
            avatar: userInfo.avatar,
            state: 'alive',
            ws: ws,
            pouvoirs: [],
            total_score: 0,
            score: 0
        });

        ws.send(JSON.stringify({ type: 'room_joined', gameCode }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid game code' }));
    }
}
// diffuse la liste des joueurs d'un lobby à tous ses joueurs
function handleAskPlayers(data, ws) {
    const gameCode = data.gameCode;
    const lobby = lobbies[gameCode];
    
    if (lobby) {
        const playersInfo = lobby.Joueurs.map(player => ({
            username: player.name,
            avatar: player.avatar
        }));

        const message = JSON.stringify({
            type: 'asked_players',
            players: playersInfo // Envoyer les objets complets des joueurs
        });

        // Envoyer le message à tous les utilisateurs du lobby
        lobby.Joueurs.forEach(player => {
            player.ws.send(message);
        });
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Lobby not found'
        }));
    }
}
function handleChatMessage(msg, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws)); // Trouver le code du lobby auquel appartient le client
    if (gameCode) {
        const player = lobbies[gameCode].Joueurs.find(player => player.ws === ws); // Trouver le joueur qui envoie le message
        // Créer le message avec l'avatar et le nom d'utilisateur du joueur
        const message = JSON.stringify({
            type: 'chat_message',
            message: {
                username: player.name,
                avatar: player.avatar,
                message: msg.message
            }
        });

        // Envoyer le message à tous les joueurs dans le même lobby
        lobbies[gameCode].Joueurs.forEach(player => {
            player.ws.send(message);
        });
    }
}



//------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------- Les fonctions in game ----------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------

// la fonction doit envoyer un socket à tous les joueurs du lobby pour qu'ils aillent sur la game
// générer la liste à partir de la bdd
function handleStartGame(data, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws));
    if (lobbies[gameCode].Joueurs.length > 0 && ws === lobbies[gameCode].Joueurs[0].ws) {
        logController.getSQLByTheme(data.title, (err, sqlrequest) => {
            if (err){
                console.error('Erreur lors de la récupération des entités:', err);
                return;
            }
            logController.getEntitiesBySQLRequest(sqlrequest, (err, entities) => {
                if (err) {
                    console.error('Erreur lors de la récupération des entités 2:', err);
                    return;
                }

                logController.getAllPowerDataCallback((err, powers) => {
                    if (err) {
                      console.log('Erreur lors de la recup des power:', err);
                      return;
                    }
                  
                lobbies[gameCode].entities = entities;
                lobbies[gameCode].theme = data.title;
                lobbies[gameCode].enCours = true;
                    lobbies[gameCode].pouvoirs_dispo = powers;
                  
                    console.log(powers);
                setTimer(gameCode);
                  });

                
            });
        });
        lobbies[gameCode].Joueurs.forEach(player => {player.ws.send(JSON.stringify({type: 'game_start', gameCode: gameCode}));});
        lobbies[gameCode].auTourDe = Math.floor(Math.random() * lobbies[gameCode].Joueurs.length); //défini au pif le joueur qui commence
        lobbies[gameCode].alivePlayersID = Array.from({ length: lobbies[gameCode].Joueurs.length }, (v, i) => i); //rempli alivePlayersID des index de tout le monde
    }
}

function handlePlayerArrived(data, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws));
    if (gameCode) {

        const alivePlayers = lobbies[gameCode].Joueurs
        .filter(player => player.state === 'alive') // ça sert à rien mais oklm
        .map(player => ({
            name: player.name,
            avatar: player.avatar,
            state: player.state,
            angleOffset: 0,
            startAngle: 0,
            targetAngle: 0,
        }));
        ws.send(JSON.stringify({type: "request_game_users", auTourDe: lobbies[gameCode].auTourDe, alivePlayers: alivePlayers, theme: lobbies[gameCode].theme}))

        if (lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].ws == ws){ // cest à son tour"
            ws.send(JSON.stringify({type: "your_turn"}))
        }
        else{
            ws.send(JSON.stringify({type: "not_your_turn"}))
        }
    }
    else{console.log("Étrange 0 !")}
}
function handleTextUpdate(data, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws));
    if (gameCode) {
        const message = JSON.stringify({
            type: 'text_update',
            message: data.text
        });
        lobbies[gameCode].Joueurs.forEach(player => {
            if (player.ws != ws){
                player.ws.send(message);
            }
        });
    }
    else{console.log("Étrange hein !")}
}
function handleSendAnswer(data, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws));
    if (gameCode && lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].ws == ws) {
    
        const message = JSON.stringify({  // vider l'input de tout le monde
            type: 'text_update', 
            message: ''})
        lobbies[gameCode].Joueurs.forEach(player => {
            player.ws.send(message);
        });

        var isGoodAnswer = false
        for (let i = lobbies[gameCode].entities.length - 1; i >= 0; i--) {
            if (lobbies[gameCode].entities[i] === data.text) {  //dans le cas où la réponse est bonne
                isGoodAnswer = true
                if (lobbies[gameCode].perfectAnswer){
                    lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].total_score += data.text.length
                    lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].score += data.text.length
                    checkScore(lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe], gameCode)
                    console.log("\n[Pouvoirs restants] :")
                    lobbies[gameCode].pouvoirs_dispo.forEach(pouvoir => {
                        console.log(pouvoir.Name)
                    })
                    console.log("\n[Pouvoirs de", lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].name, "]")
                    lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].pouvoirs.forEach(pouvoir => {
                        console.log(pouvoir.Name)
                    })
                }

                lobbies[gameCode].entities.splice(i, 1);
                if (lobbies[gameCode].entities.length != 0){
                    lobbies[gameCode].Joueurs.forEach(player => {
                        player.ws.send(JSON.stringify({ type: "good_answer", entity: data.text }));
                        setTimer(gameCode)
                        lobbies[gameCode].perfectAnswer = true;
                    });
                }
                else{
                    lobbies[gameCode].Joueurs.forEach(player => {
                        player.ws.send(JSON.stringify({ type: "end_of_list", entity: data.text }));
                        console.log("game fini")
                        clearTimeout(lobbies[gameCode].timer);
                        
                    })
                }
                
                changeToNextPlayer(gameCode)
                setTimer(gameCode)
                break;
            }
            else {
            }
            // else if (){  le cas, si la réponse n'est pas parfaite, maintenant on vérifie avec projet voltaire
            // }
        }
        if (!isGoodAnswer){
            lobbies[gameCode].perfectAnswer = false;
        }
    }
}

//prend un lobby par son gameCode, met à jour le joueur dont c'est le tour, annonce à son lobby
function changeToNextPlayer(gameCode){

    const vivants = lobbies[gameCode].alivePlayersID;
    const indexActuel = vivants.indexOf(lobbies[gameCode].auTourDe);
    const prochainIndex = (indexActuel + 1) % vivants.length;

    lobbies[gameCode].auTourDe = vivants[prochainIndex];
    lobbies[gameCode].Joueurs.forEach((player, index) => {
        if (index === lobbies[gameCode].auTourDe) {
            player.ws.send(JSON.stringify({ type: "your_turn" }));
        }
        else{
            player.ws.send(JSON.stringify({ type: "not_your_turn" }));

        }
    });
    
}
// quand le time arrive à sa fin -> tue le joueur
function handleTimerEnd(gameCode) {
    if (lobbies[gameCode]) {
        lobbies[gameCode].perfectAnswer = true;
        // si ils sont pas que 2
        if (lobbies[gameCode].alivePlayersID.length != 2){
            const oldAuTourDe = lobbies[gameCode].auTourDe
            console.log("Le joueur", oldAuTourDe+1, lobbies[gameCode].Joueurs[oldAuTourDe].name, "a été éliminé")
            const vivants = lobbies[gameCode].alivePlayersID;
            const indexActuel = vivants.indexOf(lobbies[gameCode].auTourDe);
            const prochainIndex = (indexActuel + 1) % vivants.length;            

            lobbies[gameCode].auTourDe = vivants[prochainIndex];
            lobbies[gameCode].Joueurs.forEach((player, index) => {
                if (index === lobbies[gameCode].auTourDe) {
                    player.ws.send(JSON.stringify({ type: "your_turn" }));
                }
                else{
                    player.ws.send(JSON.stringify({ type: "not_your_turn" }));
        
                }
            });
            console.log(`oldAuTourDe = ${oldAuTourDe}, lobbies[gameCode].alivePlayersID = ${lobbies[gameCode].alivePlayersID}`)
            lobbies[gameCode].alivePlayersID.splice(lobbies[gameCode].alivePlayersID.indexOf(oldAuTourDe), 1) // on retire le joueur de la la liste d'index alivePlayersID
            lobbies[gameCode].Joueurs[oldAuTourDe].state = "dead" // le state du joueur devient dead
            setTimer(gameCode)
            lobbies[gameCode].Joueurs.forEach(player => {
                player.ws.send(JSON.stringify({type: "kill", indexKilledPlayer: oldAuTourDe, alivePlayers: lobbies[gameCode].alivePlayersID, auTourDe: lobbies[gameCode].auTourDe}));
            })
        }
        else{ // CE CAS N'EST PEUT ÊTRE PAS A JOUR
            log_lobbies(gameCode)
            console.log("Le joueur", lobbies[gameCode].auTourDe+1, lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].name, "doit mourrir")


            lobbies[gameCode].alivePlayersID.splice(lobbies[gameCode].auTourDe, 1) 
            lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].state = "dead" // le state du joueur devient dead

            lobbies[gameCode].Joueurs.forEach(player => {
                player.ws.send(JSON.stringify({type: "last_kill", indexKilledPlayer: lobbies[gameCode].auTourDe}));
                clearTimeout(lobbies[gameCode].timer); 
            })


            lobbies[gameCode].Joueurs.forEach(player => {
                player.ws.send(JSON.stringify({ type: "solo_win" }));
                console.log("game gagnée")
                clearTimeout(lobbies[gameCode].timer); 
            })

            log_lobbies(gameCode)

        }
    }
}
// pour definir le temps attribué au joueur là
function setTimer(gameCode) {
    if (lobbies[gameCode].timer) {
        clearTimeout(lobbies[gameCode].timer);
    }
    const timerDuration = 10000; // (10 secondes)
    lobbies[gameCode].timer = setTimeout(() => {
        handleTimerEnd(gameCode);
    }, timerDuration);
    lobbies[gameCode].Joueurs.forEach(player => {
        player.ws.send(JSON.stringify({ type: "timer", timer: timerDuration }));    
    });
}

function checkScore(joueur, gameCode){
    if (joueur.score > 10){
        joueur.score -= 10

        if (lobbies[gameCode].pouvoirs_dispo.length != 0){
            // joueur.pouvoirs.push(lobbies[gameCode].pouvoirs.splice(Math.floor(Math.random() * lobbies[gameCode].pouvoirs.length), 1)) ça me ferait kiffer que la ligne ressemble à ça
            const indexAleatoire = Math.floor(Math.random() * lobbies[gameCode].pouvoirs_dispo.length);
            const [elementChoisi] = lobbies[gameCode].pouvoirs_dispo.splice(indexAleatoire, 1);
            joueur.pouvoirs.push(elementChoisi)
            joueur.ws.send(JSON.stringify({type: "gg", power: elementChoisi}))
        }
        console.log("dans checkScore", joueur.name, joueur.pouvoirs)
    }
}



wss.on('error', (error) => {
    console.error('Erreur WebSocket Server:', error);
});

function log_lobbies(gameCode){
    console.log("--------------------------------")
    for (let i = 0; i < lobbies[gameCode].Joueurs.length; i++) {
        console.log("Joueur", i+1, ":", lobbies[gameCode].Joueurs[i].name, lobbies[gameCode].Joueurs[i].state);   

    }
}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});