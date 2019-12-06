A Very Basic Audio player.

Music is played on the server, from file hosted on the server.

Control is in a vue.js app

Requirments:

- node.js
- an audio driver for play-sound as mplayer (apt-get install mplayer)

```
git clone https://github.com/arno14/AudioPlayer.git

cd AudioPlayer

npm install

cp .env.dist .env

nano .env

node_modules/.bin/encore production

npm run server


```

node_modules/.bin/eslint assets/\*.vue --fix

@todo

- OK / compteur de morceaux dans la playlist
- OK / filtrer les fichiers non audio
- OK / websocket rafraichissement liste en cours
- OK / Explorateur/Playlist, garder menu visible en haut
- OK / Explorateur: moteur de recherche
- OK lazy load list /spinner au chargement du contenu de l'explorateur
- OK / control volume
- OK / select item from Explorer to add in playlist
- OK / bouton précédent/suivant
- OK routing / Explorateur: garder en mémoire dernier dossier exploré
- OK / if remove item from playlist, stop playing it
- select item from playlist to remove from playlist (drop button trash general)
- Explorateur: afficher si morceau en playlist ou en cours de lecture
- gérer plusieurs playlist
- gestion des erreurs
- message sur ajout
- fonction pause
