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

const db = require('./app/database/database');

const logRoutes = require('./app/routes/logRoutes');
const dbRoutes = require('./app/routes/dbRoutes');
const logController = require('./app/controllers/logController');
const dbController = require('./app/controllers/dbController');

process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée :', err);
    process.exit(1); // Exit le processus avec un code d'erreur
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
    res.render('chat', { gameCode: req.query.gameCode });
});

app.get('/formulaire', (req, res) => {res.render('formulaire');});
app.post('/formulaire', dbController.createFormEntry);


app.get('/game', (req, res) => {
    res.render('game', { gameCode: req.query.gameCode });
});

app.use('/api', dbRoutes);
app.use('/api', logRoutes);

function generateGameCode() {
    return crypto.randomBytes(3).toString('hex');
}

let users = [];
let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type.trim()) {
            case 'user_info':
                let user = users.find(user => user.uuid === data.userInfo.uuid);
                if (!user) {
                    user = { username: data.userInfo.username, avatar: data.userInfo.avatar, uuid: data.userInfo.uuid, state: data.userInfo.state, ws: ws };
                    users.push(user);
                } else {
                    user.ws = ws; // Mettre à jour la référence WebSocket
                }
                broadcastUsers();
                break;
            case 'disconnect_user':
                users = users.filter(user => user.uuid !== data.uuid);
                broadcastUsers();
                break;
            case 'chat_message':
                broadcast(JSON.stringify({ type: 'chat_message', message: data.message, avatar: data.avatar, username: data.username }));
                break;
            case 'start_game':
                if(data.uuid == users[0].uuid){ // vérifie que c'est le chef
                    const theme = data.theme + ".png";
                    const gameCode = generateGameCode();
                    logController.getSQLByTheme(theme, (err, sqlrequest) => {
                        if (err){
                            console.error('Erreur lors de la récupération des entités:', err);
                            return;
                        }
                        logController.getEntitiesBySQLRequest(sqlrequest, (err, entities) => {
                            if (err) {
                                console.error('Erreur lors de la récupération des entités:', err);
                                return;
                            }
                            rooms[gameCode] = {
                                users: users.slice(),
                                theme: theme,
                                list: entities,
                                currentPlayerIndex: 0,
                                turnEndTime: Date.now() + 5000
                            };
                            broadcastToRoom(gameCode, JSON.stringify({
                                type: 'redirect_game',
                                gameCode: gameCode,
                                theme: theme,
                                users: users
                            }));

                            users = [];
                        });
                    })
                }

                break;
            case 'request_game_users':
                const roomCode = data.gameCode;
                const room = rooms[roomCode] || { users: [], theme: '' };
                ws.send(JSON.stringify({ type: 'game_users', users: room.users.map(user => ({ username: user.username, avatar: user.avatar, uuid: user.uuid })), theme: room.theme }));
                break;
            case 'text_update':
                broadcast(JSON.stringify({ type: 'text_update', text: data.text, username: data.username, gameCode: data.gameCode }));
                break;
            case 'send_answer':
                const currentRoom = rooms[data.gameCode];
                if (currentRoom) {
                    currentRoom.list.forEach((entity, index) => {
                        if (entity == data.text){
                            currentRoom.list = currentRoom.list.filter(entity => entity !== data.text);
                            if (currentRoom.list.length === 0){ // si la liste des trucs à deviner est vide
                                let aliveUsers = currentRoom.users.filter(user => user.state === "alive");
                                let deadUsers = currentRoom.users.filter(user => user.state === "dead");
                                broadcast(JSON.stringify({
                                    type: 'multi_win',
                                    username: aliveUsers.map(user => user.username),
                                    winnerAvatars: aliveUsers.map(user => user.avatar),
                                    loserAvatars: deadUsers.map(user => user.avatar), // Liste des avatars des loosers
                                    gameCode: data.gameCode,
                            }));}
                            else{
                                do {
                                    currentRoom.currentPlayerIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.users.length;
                                } while (currentRoom.users[currentRoom.currentPlayerIndex].state == "dead");

                                currentRoom.currentPlayer = currentRoom.users[currentRoom.currentPlayerIndex].username;            
                                const turnUpdateMessage = JSON.stringify({
                                    type: 'turn_success',
                                    text: data.text,
                                    currentPlayer: currentRoom.currentPlayer,
                                    gameCode: data.gameCode,
                                });
                                broadcast(turnUpdateMessage);
                }}});
                } else {
                    console.log(`Aucune room trouvée pour le gameCode: ${data.gameCode}`);
                }
                break;
            case 'looser':
                const gameCode = data.gameCode;
                const username = data.username;
                const actualRoom = rooms[gameCode];
            
            
                if (actualRoom) {
                    const deadIndex = actualRoom.currentPlayerIndex;
                    actualRoom.users[deadIndex].state = "dead";
                                    
                    do {  // cherche l'index du prochain joueur en vie
                        actualRoom.currentPlayerIndex = (actualRoom.currentPlayerIndex + 1) % actualRoom.users.length;
                    } while (actualRoom.users[actualRoom.currentPlayerIndex].state === "dead");
                    
                    if (check_victory(gameCode)) {
                        let aliveUsers = actualRoom.users.filter(user => user.state === "alive");
                        let deadUsers = actualRoom.users.filter(user => user.state === "dead");
                    
                        broadcast(JSON.stringify({
                            type: 'solo_win',
                            username: aliveUsers[0].username,
                            avatar: aliveUsers[0].avatar,
                            loserAvatars: deadUsers.map(user => user.avatar), // Liste des avatars des loosers
                            gameCode: gameCode,
                        }));
                    }
                    else{
                        broadcast(JSON.stringify({
                            type: 'kill',
                            index: deadIndex,
                            gameCode: gameCode,
                            currentPlayer: actualRoom.users[actualRoom.currentPlayerIndex].username
                        }));
                        }
                }
                break; 
            default:
                break;
        }

    });

    ws.on('close', () => {
        users = users.filter(user => user.ws !== ws);
        broadcastUsers();
    });
});

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
    const userListMessage = JSON.stringify({ type: 'user_list', users: users });
    broadcast(userListMessage);
}
// à revoir
function broadcastToRoom(roomCode, message) {
    const room = rooms[roomCode];
    if (room) {
        room.users.forEach(user => {
            if (user.ws.readyState === WebSocket.OPEN) {
                try {
                    user.ws.send(message);
                } catch (error) {
                }
            }
        });
    } else {
    }
}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});