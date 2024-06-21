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
                const gameCode = generateGameCode();
                rooms[gameCode] = { users: users.slice(), theme: data.theme, list: ["Aitor Cazador", "Xavier Foster"], currentPlayerIndex: 0, turnEndTime: Date.now() + 5000 };
                broadcastToRoom(gameCode, JSON.stringify({ type: 'redirect_game', gameCode: gameCode, theme: data.theme, users: users }));
                users = [];
                startTurn(gameCode);
                break;
            case 'request_game_users':
                const roomCode = data.gameCode;
                const room = rooms[roomCode] || { users: [], theme: '' };
                ws.send(JSON.stringify({ type: 'game_users', users: room.users.map(user => ({ username: user.username, avatar: user.avatar })), theme: room.theme }));
                break;
            case 'text_update':
                console.log(data)
                console.log("On entre dans text_update côté serveur");

                broadcast(JSON.stringify({ type: 'text_update', text: data.text, username: data.username, gameCode: data.gameCode }));
                break
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


// Fonction pour démarrer le tour de jeu
function startTurn(gameCode) {
    const room = rooms[gameCode];
    if (!room) return;

    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.users.length;
    room.turnEndTime = Date.now() + 5000;

    broadcastToRoom(gameCode, JSON.stringify({
        type: 'turn_update',
        currentPlayer: room.users[room.currentPlayerIndex].username,
        turnEndTime: room.turnEndTime
    }));

    setTimeout(() => startTurn(gameCode), 5000);
}



server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});