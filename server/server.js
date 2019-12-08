require('dotenv').config();

const PORT = process.env.SERVER_PORT;
const DATADIR = process.env.DATA_PATH;
const SAVEPATH = process.env.SAVE_PATH;

const express = require('express');
const fs = require('fs');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.json());
app.use(express.static('public'));

const Player = require('./Player.js');
const PlayList = require('./Playlist.js');
const Finder = require('./Finder.js');
const Logger = require('./Logger.js');

const loggers = {
  finder: new Logger('finder'),
  playlist: new Logger('playlist'),
  player: new Logger('player'),
  websocket: new Logger('websocket'),
  controller: new Logger('controller')
};

io.on('connection', client => {
  loggers.websocket.log('connection', client);
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
const player = new Player(loggers.player);

function getAppState() {
  return {
    volume: player.volume,
    isPlaying: player.isPlaying,
    position: player.getPosition(),
    isPaused: player.isPaused(),
    playlist: {
      list: playlist.list,
      currentIndex: playlist.currentIndex,
      current: playlist.current()
    }
  };
}

function renderAppState(resp) {
  return () => {
    player.getVolume().then(() => resp.json(getAppState()));
  };
}

player.onMusicPlay = () => {
  loggers.websocket.log('onMusicPlay, emit appState');
  player.getVolume().then(() => {
    io.emit('appState', getAppState());
  });
};
player.onMusicStop = () => {
  loggers.websocket.log('onMusicStop, emit appState');
  player.getVolume().then(() => {
    io.emit('appState', getAppState());
  });
};

setInterval(() => {
  if (player.isPlaying && !player.isPaused()) {
    io.emit('appState', getAppState());
  }
}, 1000);

app.get('/', (req, res) => {
  fs.readFile(`${__dirname}/index.html`, 'utf8', (err, html) => {
    res.send(html);
  });
});

app.get('/app-state', (req, res) => {
  player.getVolume().then(renderAppState(res));
});

app.get('/list', (req, res) => {
  const { term, pathname } = req.query;
  if (term) {
    finder.filter(term.trim()).then(f => res.json(f));
  } else {
    finder.getContent(pathname).then(f => res.json(f));
  }
});

app.post('/playlist/add', (req, res) => {
  const { item } = req.body;
  playlist.push(item).finally(renderAppState(res));
});

app.post('/playlist/remove', (req, res) => {
  const { item } = req.body;
  const isPlaying = playlist.isCurrent(item);
  playlist.remove(item).finally(() => {
    if (!isPlaying) {
      res.json(getAppState());
    } else {
      player.stop().then(() => {
        player.start(playlist).finally(renderAppState(res));
      });
    }
  });
});

app.post('/playlist/clear', (req, res) => {
  playlist.clear();
  player.stop().finally(renderAppState(res));
});

app.post('/play', (req, res) => {
  player.stop().then(() => {
    if (req.body.item) {
      playlist.replace(req.body.item);
    }
    player.start(playlist).finally(renderAppState(res));
  });
});

app.post('/volume', (req, res) => {
  const { volume } = req.body;
  player.setVolume(volume).finally(renderAppState(res));
});

app.post('/stop', (req, res) => {
  player.stop().then(renderAppState(res));
});

app.post('/pause', (req, res) => {
  player.pause().then(renderAppState(res));
});

app.post('/seek', (req, res) => {
  const { seek } = req.body;
  player.seek(seek).finally(renderAppState(res));
});

// route non trouvé
app.use((req, res /* , next */) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page introuvable !');
});

server.listen(PORT, () => {
  loggers.controller.log(` ### Example app is listening on port ${PORT}`);
});
