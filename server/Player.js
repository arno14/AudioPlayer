const player = require('play-sound')(
  // opts = {
  // players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
  // player:'aplay'
  // }
);


class Player {
  constructor(file) {
    this.filename = file;
    this.isPlaying = false;
    var _audio = null;
    this.setAudio = (audio) => { _audio = audio };
    this.getAudio = () => { return _audio }
  }

  play() {
    console.log('play()');
    this.isPlaying = true;
    this.setAudio(player.play(this.filename, (err) => {
      console.log('end playing...', err);
      this.isPlaying = false;
      // if (err && !err.killed) throw err;
    })
    );
  }

  stop() {
    console.log('stop()');
    this.isPlaying = false;
    if (this.getAudio()) { //ChildProcess
      console.log('Kill audio');
      this.getAudio().kill();
    }
  }

  pause() {
    console.log('pause()');
    this.isPlaying = false;
    if (this.audio) { //ChildProcess
      console.log('Kill audio');
      this.audio.sleep();
    }
  }
}

module.exports = Player;
