const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const logRoutes = require('./app/routes/logRoutes');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 3000;

const db = require('./app/database/database');
const logController = require('./app/controllers/logController');

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

app.get('/game', (req, res) => {
    res.render('game', { gameCode: req.query.gameCode });
});

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
                    user = { username: data.userInfo.username, avatar: data.userInfo.avatar, uuid: data.userInfo.uuid, ws: ws };
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
                const theme = data.theme + ".png";
                const gameCode = generateGameCode();

                console.log("Themeo = ", theme)
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

                break;
            case 'request_game_users':
                const roomCode = data.gameCode;
                const room = rooms[roomCode] || { users: [], theme: '' };
                ws.send(JSON.stringify({ type: 'game_users', users: room.users.map(user => ({ username: user.username, avatar: user.avatar })), theme: room.theme }));
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
                            
                            currentRoom.currentPlayerIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.users.length;
      
                            currentRoom.currentPlayer = currentRoom.users[currentRoom.currentPlayerIndex].username;            
                            const turnUpdateMessage = JSON.stringify({
                                type: 'turn_success',
                                text: data.text,
                                currentPlayer: currentRoom.currentPlayer,
                                gameCode: data.gameCode,
                            });
                            broadcast(turnUpdateMessage);
                        }
                    });
                } else {
                    console.log(`Aucune room trouvée pour le gameCode: ${data.gameCode}`);
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


function check_victory(roomCode){
    const room = rooms[roomCode];
    if (room.users.length == 1){
        console.log("GAGNEEEE")
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