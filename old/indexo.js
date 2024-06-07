const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const PORT = process.env.PORT || 3000;

// Liste des éléments
let specialItems = ['garen', 'veigar', 'rengar', 'ryze', 'karthus'];

// Fonction pour générer un nom aléatoire
function generateRandomName() {
    const adjectives = ['le dangereux', 'Nsoki', '', '', 'Audacieux', '', '', '', 'Rigolo'];
    const nouns = ['Demonio', 'Spectreur', 'Hagura', 'Molesto', 'Bonzai', 'Maj Nwar', 'Stefan', 'Psytan', 'Ostario'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomNoun} ${randomAdjective}`;
}

app.use(express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
    const username = generateRandomName();
    
    socket.emit('chat message', `Bienvenue, ${username}!`);

    socket.broadcast.emit('chat message', `${username} s'est connecté`);

    socket.on('chat message', (msg) => {
        const index = specialItems.indexOf(msg.toLowerCase());
        if (index !== -1) {
            io.emit('special item', msg);
            specialItems.splice(index, 1);
        } else {
            io.emit('chat message', `${username}: ${msg}`);
        }
    });

    socket.on('disconnect', () => {
        io.emit('chat message', `${username} s'est déconnecté`);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`);
});