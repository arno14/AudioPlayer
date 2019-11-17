
// console.log('Start Process');

const player = require('play-sound')(
    // opts = {
    // players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
    // player:'aplay'
    // }
  );

  const filename='../data/sample.mp3';

//   player.play(filename, (err) => {
//     console.log('...', err);
//     if (err && !err.killed) throw err;
//   });

const PlayerClass = require('./Player.js');

const p = new PlayerClass(filename);

p.play();
