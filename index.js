// index.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat', { gameCode: req.query.gameCode });
}); 

let users = [];

wss.on('connection', (ws) => {
    console.log('wss.on(\'connection\')');
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        console.log("data.type =", data.type.trim())
        switch(data.type.trim()){
            case 'user_info':
                users.push([data.userInfo.username, data.userInfo.avatar, data.userInfo.uuid]);
                console.log(users)
                break;
            case 'chat_message':
                console.log('Message reçu:', data.message);
                broadcast(JSON.stringify({ type: 'chat_message', message: data.message, avatar: data.avatar, username: data.username}));
                break;
            case 'disconnect_user':
                console.log("disconnect_user a proc");
                console.log("uuid =", data.uuid);
                console.log("1", users);
                users = users.filter(user => !user.includes(data.uuid));
                console.log("2", users);
                break;
            default:
                break;
        }
    });

    ws.on('close', () => {
        console.log('--- ws.on(\'close\') ---');
    });
});





// Les fonctions

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}



// Jsp trop

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
