require('dotenv').config();
const PORT = process.env.SERVER_PORT;
const DATADIR = process.env.DATA_PATH;
const SAVEPATH = process.env.SAVE_PATH;

const express = require('express');
const PlayerClass = require('./Player.js');
const PlayListClass = require('./Playlist.js');
const FinderClass = require('./Finder.js');
const Logger = require('./Logger.js');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const loggers = {
  'finder': new Logger('finder'),
  'playlist': new Logger('playlist'),
  'player': new Logger('player'),
};

const finder = new FinderClass(DATADIR, loggers.finder);
const playlist = new PlayListClass(finder, SAVEPATH, loggers.playlist);
const player = new PlayerClass(playlist, loggers.player);

function getJson() {
  return {
    isPlaying: player.isPlaying,
    playlist: {
      list: playlist.list,
      currentIndex: playlist.currentIndex,
      current: playlist.current()
    },
  }
}


app.get('/', (req, res) => {
  fs.readFile(__dirname + '/index.html', 'utf8', (err, html) => {
    res.send(html);
  });
});

app.get('/list', (req, res) => {
  finder.getContent(req.query.path).then((f) => res.json(f));
});

app.get('/current-file', (req, res) => {
  res.json(getJson());
});

app.post('/playlist/add', (req, res) => {
  let item = req.body.item;
  playlist.push(item).finally(() => res.json(getJson()));
});

app.post('/playlist/remove', (req, res) => {
  let item = req.body.item;
  playlist.remove(item).finally(() => res.json(getJson()));
});

app.post('/playlist/clear', (req, res) => {
  playlist.clear();
  player.stop().finally(() => res.json(getJson()));
});

app.post('/play', (req, res) => {
  if (req.body.item) {
    playlist.replace(req.body.item);
  }
  player.restart().then(() => res.json(getJson()));
});

app.post('/start', (req, res) => {
  player.restart().then(() => res.json(getJson()));
});

app.post('/stop', (req, res) => {
  player.stop().then(() => res.json(getJson()));
});

// route non trouvé
app.use((req, res /* , next */) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page introuvable !');
});

app.listen(PORT, () => {
  console.log(` ### Example app is listening on port ${PORT}`);
});
