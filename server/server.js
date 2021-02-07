require('dotenv').config();

const PORT = process.env.SERVER_PORT;
const DATADIR = process.env.DATA_PATH;
const SAVEPATH = process.env.SAVE_PATH;
const DEBUG = process.env.DEBUG;

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
  finder: new Logger('finder', DEBUG),
  playlist: new Logger('playlist', DEBUG),
  player: new Logger('player', DEBUG),
  websocket: new Logger('websocket', DEBUG),
  controller: new Logger('controller', DEBUG)
};

const finder = new Finder(DATADIR, loggers.finder);
const playlist = new PlayList(finder, SAVEPATH, loggers.playlist);
const player = new Player(loggers.player);

/**
 * UTILITY FUNCTIONS
 */
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

/**
 * WEBSOCKET
 */
io.on('connection', client => {
  loggers.websocket.log('connection', client);
});

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

/**
 * HTTP ROUTING
 */
app.get('/', (req, res) => {
  fs.readFile(`${__dirname}/index.html`, 'utf8', (err, html) => {
    res.send(html);
  });
});

app.get('/app-state', (req, res) => {
  player.getVolume().then(renderAppState(res));
});

app.post('/play', (req, res) => {
  player.stop().then(() => {
    if (req.body.item) {
      playlist.replace(req.body.item);
    }
    player.start(playlist).finally(renderAppState(res));
  });
});

app.post('/stop', (req, res) => {
  player.stop().then(renderAppState(res));
});

app.post('/pause', (req, res) => {
  player.pause().then(renderAppState(res));
});

app.post('/volume', (req, res) => {
  const { volume } = req.body;
  player.setVolume(volume).finally(renderAppState(res));
});

app.post('/seek', (req, res) => {
  const { targetPercent } = req.body;
  player.seek(targetPercent).finally(renderAppState(res));
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

// on route not found
app.use((req, res /* , next */) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page not found !');
});

server.listen(PORT, () => {
  loggers.controller.log(` ### Example app is listening on port ${PORT}`);
});
