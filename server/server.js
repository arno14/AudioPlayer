require('dotenv').config();
const PORT = process.env.SERVER_PORT;
const DATADIR = process.env.DATA_PATH;
const SAVEPATH = process.env.SAVE_PATH;

const express = require('express');
const Player = require('./Player.js');
const PlayList = require('./Playlist.js');
const Finder = require('./Finder.js');
const Logger = require('./Logger.js');
const fs = require('fs');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.json());
app.use(express.static('public'));


const loggers = {
  'finder': new Logger('finder', true),
  'playlist': new Logger('playlist', true),
  'player': new Logger('player', true),
  'websocket': new Logger('websocket', true)
};

io.on('connection', function (client) {
  loggers.websocket.log('connection');
});

// let counter = 0,
//     interval = 10000;
// setInterval(() => {
//   counter+=interval;
//   loggers.websocket.log('emit ping', counter);
//   io.emit('ping', { since: counter });
// }, interval);

const finder = new Finder(DATADIR, loggers.finder);
const playlist = new PlayList(finder, SAVEPATH, loggers.playlist);
const player = new Player(playlist, loggers.player);

function getAppState() {
  return {
    isPlaying: player.isPlaying,
    playlist: {
      list: playlist.list,
      currentIndex: playlist.currentIndex,
      current: playlist.current()
    },
  }
}

player.onMusicPlay = () => {
  loggers.websocket.log('onMusicPlay, emit appState');
  io.emit('appState', getAppState());
}

app.get('/', (req, res) => {
  fs.readFile(__dirname + '/index.html', 'utf8', (err, html) => {
    res.send(html);
  });
});

app.get('/list', (req, res) => {
  finder.getContent(req.query.pathname).then((f) => res.json(f));
});

app.get('/current-file', (req, res) => {
  res.json(getAppState());
});

app.post('/playlist/add', (req, res) => {
  let item = req.body.item;
  playlist.push(item).finally(() => res.json(getAppState()));
});

app.post('/playlist/remove', (req, res) => {
  let item = req.body.item;
  playlist.remove(item).finally(() => res.json(getAppState()));
});

app.post('/playlist/clear', (req, res) => {
  playlist.clear();
  player.stop().finally(() => res.json(getAppState()));
});

app.post('/play', (req, res) => {
  if (req.body.item) {
    playlist.replace(req.body.item);
  }
  player.restart().then(() => {
    // loggers.websocket.log('Emit appState', getAppState());
    // io.emit('appState', getAppState())
    res.json(getAppState())
  });
});

app.post('/start', (req, res) => {
  player.restart().then(() => res.json(getAppState()));
});

app.post('/stop', (req, res) => {
  player.stop().then(() => res.json(getAppState()));
});

// route non trouvé
app.use((req, res /* , next */) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page introuvable !');
});

server.listen(PORT, () => {
  console.log(` ### Example app is listening on port ${PORT}`);
});
