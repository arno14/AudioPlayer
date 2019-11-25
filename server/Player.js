const playsound = require('play-sound')();
const loudness = require('loudness');

// opts = {
// players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
// player:'aplay'
// }

class Player {
  constructor(logger) {
    this.logger = logger;
    this.audio = null;
    this.isPlaying = false;
    this.isStopped = false;
    this.onMusicPlay = () => {};
    this.onMusicStop = () => {};
    this.volume = null;
  }

  setVolume(volume) {
    return loudness
      .setVolume(volume, (err, vol) => {
        this.logger.warn('setVolume failed', err, vol);
      })
      .then(() => this.getVolume());
  }

  getVolume() {
    return loudness
      .getVolume((err, vol) => {
        this.logger.warn('getVolume failed', err, vol);
      })
      .then(volume => {
        this.volume = volume;
        return volume;
      });
  }

  start(playlist) {
    const filename = playlist.currentFileName();
    this.play(filename).then(res => {
      if (res.isStopped) {
        return;
      }
      const next = playlist.next();
      if (!next) {
        return;
      }
      this.logger.log('start next item in playlist');
      this.start(playlist);
    });
  }

  play(filename) {
    if (this.isPlaying) {
      return this.stop().then(() => this.play(filename));
    }
    this.logger.log('play(', filename, ')');
    this.promise = new Promise(resolve => {
      this.isPlaying = true;
      this.isStopped = false;
      this.audio = playsound.play(filename, err => {
        const resolution = {
          filename,
          isStopped: this.isStopped
        };
        this.logger.log(
          'endplay(',
          filename,
          ')',
          err,
          this.isStopped ? 'stopped' : ''
        );
        this.isPlaying = false;
        this.isStopped = false;
        this.onMusicStop();
        resolve(resolution);
      });
      this.onMusicPlay();
    });
    return this.promise;
  }

  stop() {
    if (!this.isPlaying) {
      return new Promise(resolve => {
        resolve();
      });
    }
    if (this.audio) {
      this.logger.log('kill process');
      this.isStopped = true;
      this.audio.kill();
    }
    return this.promise;
  }
}

module.exports = Player;
