// Fonction pour générer un nom aléatoire
function generateRandomName() {
    const adjectives = ['le dangereux', 'Nsoki', '', '', 'Audacieux', '', '', '', 'Rigolo'];
    const nouns = ['Demonio', 'Spectreur', 'Hagura', 'Molesto', 'Bonzai', 'Maj Nwar', 'Stefan', 'Psytan', 'Ostario'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomNoun} ${randomAdjective}`;
}



socket.on('user info', (userInfo) => {
    console.log('Informations utilisateur reçues:', userInfo);
    socket.userInfo = userInfo;
    console.log('Informations utilisateur enregistrées pour ce socket:', socket.userInfo);
});


if (socket.userInfo) {
    // Ajoutez les informations utilisateur au message
    msg.username = socket.userInfo.username;
    msg.avatar = socket.userInfo.avatar;
    console.log('Message à envoyer:', msg);
    io.emit('chat message', msg);
} else {
    // Si les informations utilisateur ne sont pas disponibles, ne pas envoyer le message
    console.log('Informations utilisateur manquantes');
}













function updateAvatar() {
    currentAvatar.src = avatars[currentIndex];
}

function nextAvatar() {
    currentIndex = (currentIndex + 1) % avatars.length;
    updateAvatar();
}

function prevAvatar() {
    currentIndex = (currentIndex - 1 + avatars.length) % avatars.length;
    updateAvatar();
}
        // document.getElementById('left-arrow').addEventListener('click', prevAvatar);
        // document.getElementById('right-arrow').addEventListener('click', nextAvatar);
    









        ws.on('close', () => {
            console.log('[✘] Utilisateur déconnecté');
            // const disconnectedUser = users[ws];
            // if (disconnectedUser) {
            //     broadcast(JSON.stringify({ type: 'user_disconnected', username: disconnectedUser.username }));
            //     delete users[ws];
            // }
        });
    });




    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'user_info') {
            console.log('3 Informations utilisateur reçues:', data.userInfo);
            users[ws] = data.userInfo;
            console.log('4 Contenu de users:', users);
        } else if (data.type === 'chat_message') {
            console.log('Message reçu:', data.message);
            broadcast(JSON.stringify({ type: 'chat_message', message: data.message, avatar: data.avatar, username: data.username}));
        }
    });






    document.getElementById('join-game').addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const avatar = avatars[currentIndex];
        const gameCode = document.getElementById('game-code').value.trim();
        joinGame(name, avatar, gameCode);
    });






