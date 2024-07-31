const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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



let users = [];
let lobbies = {};
let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {

        const data = JSON.parse(message);
        console.log('Message reçu (parsed):', data); // Ajouté pour vérifier le message parsé
        switch (data.type.trim()) {
            case 'create_game':
                data.userInfo.ws = ws;
                handleCreateGame(data.userInfo, ws);
                break;

            case 'chat_message':
                console.log("Chat_Message !");
                handleChatMessage(data, ws);
                break;

            case 'ask_players':
                console.log('ask_players reçue'); // Ajouté pour vérifier la réception de ask_players
                handleAskPlayers(data, ws);
                break;

            default:
                console.log('Type de message inconnu:', data.type);
                break;
        }

    });

    ws.on('close', () => {
        users = users.filter(user => user.ws !== ws);
        broadcastUsers();
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

});

function generateGameCode() {
    return crypto.randomBytes(3).toString('hex');
}
function handleCreateGame(userInfo, ws) {
    const gameCode = generateGameCode();
    lobbies[gameCode] = [{ ...userInfo}];
    ws.send(JSON.stringify({ type: 'game_created', gameCode }));
    console.log(`Game created with codesss: ${gameCode}`);
}
function handleChatMessage(data, ws) {
    const { roomCode, message, username, avatar } = data;
    const lobby = lobbies[roomCode];
    if (lobby) {
        const chatMessage = {
            type: 'chat_message',
            message,
            username,
            avatar
        };
        lobby.forEach(user => {
            if (user.ws && user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(JSON.stringify(chatMessage));
            }
        });
    }
}
function handleAskPlayers(data, ws) {
    const gameCode = data.gameCode;
    const lobby = lobbies[gameCode];
    
    if (lobby) {
        const playerNames = lobby.map(player => player.username);
        ws.send(JSON.stringify({
            type: 'asked_players',
            players: playerNames
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Lobby not found'
        }));
    }
}












            // case 'ask_user_list':
            //     sendUserList(ws, data.userInfo.roomCode);
            //     console.log("ask_user_list")

            // case 'chat_message':
            //     console.log("Message de fou :", data.message)
            //     broadcast(JSON.stringify({ roomCode: data.roomCode, type: 'chat_message', message: data.message, avatar: data.avatar, username: data.username }));
            //     break;

            // case 'join_game':
            //     console.log("join game:", data.userInfo)
            //     handleJoinGame(data.userInfo, ws);
            //     break;

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



function handleJoinGame(userInfo, ws) {
    const { gameCode } = userInfo;
    console.log("on va push", userInfo.username, "dans la room", gameCode)
    if (lobbies[gameCode]) {
        lobbies[gameCode].push({ ...userInfo });
        ws.send(JSON.stringify({ type: 'game_joined', gameCode }));
        console.log(`User joined game with code: ${gameCode}`);
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid game code' }));
    }
}







function sendUserList(ws, roomCode) {
    if (lobbies[roomCode]) {
        const users = lobbies[roomCode].map(user => ({ username: user.username, avatar: user.avatar }));
        broadcast((JSON.stringify({ type: 'user_list', users: users, roomCode: roomCode})))
        // ws.send(JSON.stringify({ type: 'user_list', users: users }));
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    }
    logLobbies(lobbies)
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
// Fonction de diffusion des messages à tous les clients WebSocket connectés
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
// Diffuse tous les users
function broadcastUsers() {
    console.log("broadcastUsers affiche")
    console.log("a")
    logLobbies(lobbies)
    const userListMessage = JSON.stringify({ type: 'user_list', users: users });
    broadcast(userListMessage);
}


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});