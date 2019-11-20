
const playsound = require('play-sound')(
  // opts = {
  // players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
  // player:'aplay'
  // }
);

const fs = require('fs');

class Player {

  constructor(playlist, logger) {
    this.playlist = playlist;
    this.logger = logger;
    this.audio = null;
    this.isPlaying = false;
    this.isKilled = false;
  }

  restart() {
    return this.stop()
      .then(() => { })
      .catch(() => { })
      .finally(() => {
        this.logger.log('restart() after stop')
        this.start();
        return true;
      })
  }

  start() {
    return this.play()
      .then(() => {
        let next = this.playlist.next();
        this.logger.log('start() read next ', next);
        if (next) {
          this.start();
        }
      })
      .catch(() => {
        this.logger.log('start() rejected');
      });
  }

  play() {
    let currentFileName = this.playlist.currentFileName();
    this.logger.log('play(', currentFileName, ')');
    if (!currentFileName) {
      return new Promise((resolve, reject) => reject());
    }
    this.promise = new Promise((resolve, reject) => {
      this.isPlaying = true;
      this.isKilled = false;
      this.audio = playsound.play(currentFileName, (err) => {
        this.logger.log('endplay(', currentFileName, err, this.isKilled, ')');
        (this.isKilled) ? reject() : resolve();
        this.isPlaying = false;
        this.isKilled = false;
        this.promise = null;
      })
    });
    return this.promise;
  }

  stop() {
    if (this.audio) {
      this.logger.log('kill process');
      this.isKilled = true;
      this.audio.kill();
    }
    if (!this.promise) {
      return new Promise(resolve => resolve());
    }
    return this.promise.finally();
  }
}

module.exports = Player;
