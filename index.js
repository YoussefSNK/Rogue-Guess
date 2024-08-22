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
                //prend tous les joueurs de ce lobby
                handleStartGame(data, ws);
                //leur envoie la socket de la game pour qu'ils y aillent
                //-cette socket contient la liste des joueurs 

                //enregistre la liste des perso dispo ici
                console.log("hello !!!", data.title)
                break;

            // case 'start_game':
            //     if (lobbies[data.roomCode].length > 0 && data.uuid == lobbies[data.roomCode][0].uuid) {
            //         const theme = data.theme + ".png";
            //         const gameCode = generateGameCode();
            //         logController.getSQLByTheme(theme, (err, sqlrequest) => {
            //             if (err){
            //                 console.error('Erreur lors de la récupération des entités:', err);
            //                 return;
            //             }
            //             logController.getEntitiesBySQLRequest(sqlrequest, (err, entities) => {
            //                 if (err) {
            //                     console.error('Erreur lors de la récupération des entités:', err);
            //                     return;
            //                 }
            //                 rooms[gameCode] = {
            //                     users: lobbies[data.roomCode].slice(),
            //                     theme: theme,
            //                     list: entities,
            //                     currentPlayerIndex: 0,
            //                     turnEndTime: Date.now() + 5000
            //                 };
            //                 broadcast(JSON.stringify({type: 'redirect_game', gameCode: gameCode, roomCode: data.roomCode, theme: theme, users: lobbies[data.roomCode]}))
            //                 lobbies[data.roomCode] = [];
            //             });
            //         });
            //     }
            //     else{console.log("Pas le chef")}

            //     break;


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
            const index = lobbies[code].findIndex(player => player.ws === ws);
            if (index !== -1) {
                lobbyCode = code;
                playerIndex = index;
                break;
            }
        }

        if (lobbyCode !== null && playerIndex !== -1) {
            // Supprimer le joueur du lobby
            lobbies[lobbyCode].splice(playerIndex, 1);

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
        entities: [],
        Joueurs: [
            {
                name: userInfo.username,    // Nom du joueur
                avatar: userInfo.avatar,    // Avatar du joueur
                state: "alive",
                ws: ws,                     // WebSocket associée
                pouvoirs: []                // Pouvoirs du joueur, par défaut vide
            }
        ]
    };


    ws.send(JSON.stringify({ type: 'room_created', gameCode }));
    console.log(`Game created with code: ${gameCode}`);
    displayLobbies(lobbies)
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
    displayLobbies(lobbies)
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

    const message = JSON.stringify({type: 'game_start', gameCode: gameCode}); // créé le message de la socket
        lobbies[gameCode].Joueurs.forEach(player => {player.ws.send(message);}); // envoie le message à tous les joueurs du lobby

    }
}







            // case 'disconnect_user':
            //     if (lobbies[data.roomCode]) {
            //         lobbies[data.roomCode] = lobbies[data.roomCode].filter(user => user.uuid !== data.uuid);

            //         // Si la salle est vide après la déconnexion, supprimer la salle
            //         if (lobbies[data.roomCode].length === 0) {
            //             delete lobbies[data.roomCode];
            //         }

            //         sendUserList(ws, data.roomCode);
            //     }
            //     break;

            // case 'request_game_users':
            //     const roomCode = data.gameCode;
            //     let room = rooms[roomCode] || { users: [], theme: '' };
            //     ws.send(JSON.stringify({ type: 'game_users', users: room.users.map(user => ({ username: user.username, avatar: user.avatar, uuid: user.uuid })), theme: room.theme }));
            //     break;
            // case 'text_update':
            //     broadcast(JSON.stringify({ type: 'text_update', text: data.text, username: data.username, gameCode: data.gameCode }));
            //     break;
            // case 'send_answer':
            //     const currentRoom = rooms[data.gameCode];
            //     if (currentRoom) {
            //         currentRoom.list.forEach((entity, index) => {
            //             if (entity == data.text){
            //                 currentRoom.list = currentRoom.list.filter(entity => entity !== data.text);
            //                 if (currentRoom.list.length === 0){ // si la liste des trucs à deviner est vide
            //                     let aliveUsers = currentRoom.users.filter(user => user.state === "alive");
            //                     let deadUsers = currentRoom.users.filter(user => user.state === "dead");
            //                     broadcast(JSON.stringify({
            //                         type: 'multi_win',
            //                         username: aliveUsers.map(user => user.username),
            //                         winnerAvatars: aliveUsers.map(user => user.avatar),
            //                         loserAvatars: deadUsers.map(user => user.avatar), // Liste des avatars des loosers
            //                         gameCode: data.gameCode,
            //                 }));}
            //                 else{
            //                     do {
            //                         currentRoom.currentPlayerIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.users.length;
            //                     } while (currentRoom.users[currentRoom.currentPlayerIndex].state == "dead");

            //                     currentRoom.currentPlayer = currentRoom.users[currentRoom.currentPlayerIndex].username;            
            //                     const turnUpdateMessage = JSON.stringify({
            //                         type: 'turn_success',
            //                         text: data.text,
            //                         currentPlayer: currentRoom.currentPlayer,
            //                         gameCode: data.gameCode,
            //                     });
            //                     broadcast(turnUpdateMessage);
            //     }}});
            //     } else {
            //         console.log(`Aucune room trouvée pour le gameCode: ${data.gameCode}`);
            //     }
            //     break;
            // case 'looser':
            //     const gameCode = data.gameCode;
            //     const username = data.username;
            //     const actualRoom = rooms[gameCode];
            
            
            //     if (actualRoom) {
            //         const deadIndex = actualRoom.currentPlayerIndex;
            //         actualRoom.users[deadIndex].state = "dead";
                                    
            //         do {  // cherche l'index du prochain joueur en vie
            //             actualRoom.currentPlayerIndex = (actualRoom.currentPlayerIndex + 1) % actualRoom.users.length;
            //         } while (actualRoom.users[actualRoom.currentPlayerIndex].state === "dead");
                    
            //         if (check_victory(gameCode)) {
            //             let aliveUsers = actualRoom.users.filter(user => user.state === "alive");
            //             let deadUsers = actualRoom.users.filter(user => user.state === "dead");
                    
            //             broadcast(JSON.stringify({
            //                 type: 'solo_win',
            //                 chief_uuid: actualRoom.users[0].uuid,
            //                 username: aliveUsers[0].username,
            //                 avatar: aliveUsers[0].avatar,
            //                 loserAvatars: deadUsers.map(user => user.avatar), // Liste des avatars des loosers
            //                 gameCode: gameCode,
            //             }));
            //         }
            //         else{
            //             broadcast(JSON.stringify({
            //                 type: 'kill',
            //                 index: deadIndex,
            //                 gameCode: gameCode,
            //                 currentPlayer: actualRoom.users[actualRoom.currentPlayerIndex].username
            //             }));
            //             }
            //     }
            //     break; 


wss.on('error', (error) => {
    console.error('Erreur WebSocket Server:', error);
});








function displayLobbies(lobbies) {
    // Parcourir chaque lobby par son identifiant
    for (const lobbyId in lobbies) {
        if (lobbies.hasOwnProperty(lobbyId)) {
            console.log(`Lobby ID: ${lobbyId}`);
            const players = lobbies[lobbyId];

            // Parcourir chaque joueur dans le lobby
            players.forEach((player, index) => {
                console.log(`  Player ${index + 1}:`);
                console.log(`    Username: ${player.username}`);
                console.log(`    State: ${player.state}`);
                console.log(`    WebSocket: ${player.ws}`);
                
                // Si l'objet contient un gameCode, l'afficher également
                if (player.gameCode) {
                    console.log(`    Game Code: ${player.gameCode}`);
                }
            });
        }
    }
}





function logLobbies(lobbies) {
    Object.keys(lobbies).forEach((roomCode, index) => {
        const users = lobbies[roomCode];
        const userList = users.map(user => user.username).join(', ');
        console.log(`Room ${index + 1} (${roomCode}) : ${userList}`);
    });
}






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