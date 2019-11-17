
const express = require('express');
const app = express();
const PORT = 8015;
const fs = require('fs');

var cors = require('cors')
app.use(cors());
app.use(express.static('public'));

const DATADIR = __dirname + '/../data';
const FinderClass = require('./Finder.js');
const f = new FinderClass(DATADIR);

const PlayerClass = require('./Player.js');
const p = new PlayerClass(DATADIR + '/sample.mp3');

app.get('/', (req, res) => {
  fs.readFile(__dirname + '/index.html', 'utf8', (err, html) => {
    res.send(html);
  });
});

app.get('/files', (req, res) => {
  f.getFiles().then((f) => res.json(f));
});

app.get('/current-file', (req, res) => {
  res.json(p);
});

app.post('/start', (req, res) => {
  p.play();
  res.json(p);
});

app.post('/stop', (req, res) => {
  p.stop();
  res.json(p);
});

app.post('/pause', (req, res) => {
  p.pause();
  res.json(p);
});


// route non trouvé
app.use((req, res /* , next */) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('Page introuvable !');
});

app.listen(PORT, () => {
  console.log(` ### Example app is listening on port ${PORT}`);
});
