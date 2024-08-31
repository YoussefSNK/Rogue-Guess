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

// const db = require('./app/database/database');

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

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:8080'}));
  
// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {

    if (!lobbies[req.query.gameCode]) {
        res.redirect('/');
        return;
    }

    res.render('chat', { gameCode: req.query.gameCode });
});


app.get('/formulaire', (req, res) => {res.render('formulaire');});
app.post('/formulaire', dbController.createFormEntry);
app.get('/game', (req, res) => {res.render('game', { gameCode: req.query.gameCode });});

app.use('/api', dbRoutes);
app.use('/api', logRoutes);

// let rooms = {};

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
                console.log("1 Joueur est arrivé !");
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
        auTourDe: null, //ce sera l'index du joueur dont c'est le tour
        entities: [],
        Joueurs: [
            {
                name: userInfo.username,
                avatar: userInfo.avatar,
                state: "alive",
                ws: ws,                     // WebSocket associée
                pouvoirs: []
            }
        ],
        JoueursEnVie: []
    };
    ws.send(JSON.stringify({ type: 'room_created', gameCode }));
    console.log(`Game created with code: ${gameCode}`);
    console.log(lobbies)
}
function handleJoinRoom(userInfo, ws) {
    const { gameCode } = userInfo;
    
    if (lobbies[gameCode]) {
        lobbies[gameCode].Joueurs.push({
            name: userInfo.username,
            avatar: userInfo.avatar,
            state: 'alive',
            ws: ws,
            pouvoirs: []
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
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].some(player => player.ws === ws)); // Trouver le code du lobby auquel appartient le client
    if (gameCode) {
        const player = lobbies[gameCode].find(player => player.ws === ws); // Trouver le joueur qui envoie le message
        // Créer le message avec l'avatar et le nom d'utilisateur du joueur
        const message = JSON.stringify({
            type: 'chat_message',
            message: {
                username: player.username,
                avatar: player.avatar,
                message: msg.message
            }
        });

        // Envoyer le message à tous les joueurs dans le même lobby
        lobbies[gameCode].forEach(player => {
            player.ws.send(message);
        });
    }
}
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
                lobbies[gameCode].entities = entities;
                lobbies[gameCode].enCours = true;
                setTimer(gameCode);

                
            });
        });
        const message = JSON.stringify({type: 'game_start', gameCode: gameCode});
        lobbies[gameCode].Joueurs.forEach(player => {player.ws.send(message);});
        lobbies[gameCode].auTourDe = Math.floor(Math.random() * lobbies[gameCode].Joueurs.length); //défini au pif le joueur qui commence
        lobbies[gameCode].JoueursEnVie = Array.from({ length: lobbies[gameCode].Joueurs.length }, (v, i) => i); //rempli JoueursEnVie des index de tout le monde
    }
}
            //                 rooms[gameCode] = {
            //                     users: lobbies[data.roomCode].slice(),
            //                     theme: theme,
            //                     turnEndTime: Date.now() + 5000

function handlePlayerArrived(data, ws) {
    const gameCode = Object.keys(lobbies).find(code => lobbies[code].Joueurs.some(player => player.ws === ws));
    if (gameCode) {

        const alivePlayers = lobbies[gameCode].Joueurs
        .filter(player => player.state === 'alive') // ça sert à rien mais oklm
        .map(player => ({
            name: player.username,
            avatar: player.avatar
        }));
        ws.send(JSON.stringify({type: "request_game_users",alivePlayers: alivePlayers}))

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



        for (let i = lobbies[gameCode].entities.length - 1; i >= 0; i--) {
            if (lobbies[gameCode].entities[i] === data.text) {  //dans le cas où la réponse est bonne
                lobbies[gameCode].entities.splice(i, 1);

                if (lobbies[gameCode].entities.length != 0){
                    lobbies[gameCode].Joueurs.forEach(player => {
                        player.ws.send(JSON.stringify({ type: "good_answer", entity: data.text }));
                        setTimer(gameCode)
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

        // si ils sont pas que 2
        if (lobbies[gameCode].alivePlayersID.length != 2){

            log_lobbies(gameCode)


            
            const oldAuTourDe = lobbies[gameCode].auTourDe
            console.log("Le joueur", oldAuTourDe+1, lobbies[gameCode].Joueurs[oldAuTourDe].name, "a été éliminé")

            // chercher le joueur d'après tout de suite
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

            //   vvvvvvvvvvvvvvvvvvvv

            setTimer(gameCode)


            lobbies[gameCode].Joueurs.forEach(player => {
                player.ws.send(JSON.stringify({type: "kill", indexKilledPlayer: oldAuTourDe, alivePlayers: lobbies[gameCode].alivePlayersID, auTourDe: lobbies[gameCode].auTourDe}));
            })



            log_lobbies(gameCode)


        }
        else{ // CE CAS N'EST PEUT ÊTRE PAS A JOUR
            log_lobbies(gameCode)
            console.log("Le joueur", lobbies[gameCode].auTourDe+1, lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].name, "doit mourrir")


            lobbies[gameCode].alivePlayersID.splice(lobbies[gameCode].auTourDe, 1) 
            lobbies[gameCode].Joueurs[lobbies[gameCode].auTourDe].state = "dead" // le state du joueur devient dead

            lobbies[gameCode].Joueurs.forEach(player => {
                player.ws.send(JSON.stringify({type: "kill", indexKilledPlayer: lobbies[gameCode].auTourDe}));
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







wss.on('error', (error) => {
    console.error('Erreur WebSocket Server:', error);
});






function check_victory(roomCode){ // vérifie si la game est win, si oui elle return true
    const room = rooms[roomCode];
    const aliveUsers = room.users.filter(user => user.state === "alive");

    if (aliveUsers.length === 1) {
        const winner = aliveUsers[0];
        console.log(`Victoire de ${winner.username} !`);
        console.log(`Avatar : ${winner.avatar}`);
        return true;
    }
}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});