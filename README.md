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


@todo
- OK / compteur de morceaux dans la playlist
- OK / filtrer les fichiers non audio
- OK / websocket rafraichissement liste en cours
- OK / Explorateur/Playlist, garder menu visible en haut
- Explorateur: moteur de recherche
- spinner au chargement du contenu de l'explorateur
- control volume
- fonction pause 
- select item from Explorateur to add in playlist
- select item from playlist to remove from playlist (drop button trash general)
- Explorateur: afficher si morceau en playlist ou en cours de lecture
- Explorateur: garder en mémoire dernier dossier exploré
- gérer plusieurs playlist
- gestion des erreurs
- message sur ajout
- bouton précédent/suivant
- if remove item from playlist, stop playing it
