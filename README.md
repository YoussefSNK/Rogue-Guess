# Rogue Guess

## Introduction
Ce projet est une application web qui permet aux utilisateurs de jouer ensemble à un jeu. Il utilise Express, Node.js et les Sockets. Théoriquement réalisé en suivant le patron de conception MVC.

## Fonctionnalités
- Créer un salon privé
- Rejoindre un salon à l'aide d'un code
- Voir les joueurs présents dans un salon et discuter avec
- Sélection d'un thème de jeu par le chef du salon


## Installation
- Clonez le dépôt
git clone https://github.com/YoussefSNK/Rogue-Guess.git
cd Rogue-Guess

- Installez les dépendances
npm install

- Démarrer le serveur (avec nodemon)
npm run dev



## Utilisation
Créer un salon
- Depuis la page d'accueil accessible à : http://localhost:3000/
- Entrez votre nom et choisissez un avatar
- Cliquez sur "Jouer"

Rejoindre un salon
- Depuis la page d'accueil à la même adresse
- Entrez votre nom et choisissez un avatar
- Entrez le code de la partie dans le champ"Code de la partie"
- Cliquez sur "Jouer"

Soumettre une requête
- Depuis la page d'accueil, cliquez sur "Une suggestion ?"
- Remplissez le formulaire avec vos propositions
- Validez le pour l'envoyer

Dans le salon
- Patientez que les autres joueurs rejoignent, ils sont visibles dans la colonne de droite
- Discuter avec les autres joueurs en utilisant le chat en bas de la page
- Le chef peut commencer la partie en cliquant sur l'un des thèmes disponibles en haut à gauche

Pendant la partie
- Chaque joueur est désigné chacun son tour par le jeu
- Le joueur choisi a 10 secondes pour écrire un élément appartenant au thème de la partie
- Si il y arrive, le joueur sélectionne le joueur suivant et c'est à son tour de répondre
- Sinon, le joueur est éliminé
- La partie s'arrête lorsque tous les élements ont été cités ou lorsqu'il ne reste qu'un seul joueur
- À la fin de la partie, les joueurs sont redirigés vers un nouveau salon


Fonctionnalités annexes
- Les éléments citésé sont affichés en arrière plan
- Le site retient l'avatar de l'utilisateur pour sa prochaine session
- Pendant la partie, les joueurs sont affichés dans un cercle qui tourne à chaque action



Auteur
- [Youssef](https://github.com/YoussefSNK)
