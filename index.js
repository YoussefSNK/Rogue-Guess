const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');
const logRoutes = require('./app/routes/logRoutes');

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

app.use('/api', logRoutes);

// WebSocket
let users = [];

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        console.log("data.type =", data.type.trim());
        switch(data.type.trim()) {
            case 'user_info':
                users.push({ username: data.userInfo.username, avatar: data.userInfo.avatar, uuid: data.userInfo.uuid });
                broadcastUsers();
                break;
            case 'chat_message':
                console.log('Message reçu:', data.message);
                console.log('de la part de',data.username, 'avec la pp', data.avatar);
                broadcast(JSON.stringify({ type: 'chat_message', message: data.message, avatar: data.avatar, username: data.username }));
                break;
            case 'disconnect_user':
                console.log("disconnect_user a proc");
                console.log("uuid =", data.uuid);
                console.log("Avant déconnexion", users);
                users = users.filter(user => user.uuid !== data.uuid);
                console.log("Après déconnexion", users);
                broadcastUsers();
                break;
            default:
                break;
        }
    });

    ws.on('close', () => {
        console.log('Connexion WebSocket fermée');
    });
});

// Fonction de diffusion des messages
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Fonction de diffusion de la liste des utilisateurs
function broadcastUsers() {
    const userListMessage = JSON.stringify({ type: 'user_list', users: users });
    broadcast(userListMessage);
}

// Démarrer le serveur HTTP pour WebSocket
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
