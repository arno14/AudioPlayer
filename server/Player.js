
const playsound = require('play-sound')(
  // opts = {
  // players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
  // player:'aplay'
  // }
);


const fs = require('fs');

class Player {

  constructor(logger) {
    this.logger = logger;
    this.audio = null;
    this.isPlaying = false;
    this.isStopped = false;
    this.onMusicPlay = () => { };
    this.onMusicStop = () => { };
  }

  start(playlist){
    let filename = playlist.currentFileName();
    if(!filename){
      return new Promise((resolve) => { resolve() });
    }
    this.play(filename).then((res)=>{
      if(res.isStopped){
        return;
      }
      let next = playlist.next();
      if(!next){
        return;
      }
      this.logger.log('start next item in playlist')
      this.start(playlist);    
    })
  }
  play(filename) {
    if (this.isPlaying) {
      return this.stop().then(() => {
        return this.play(filename);
      })
    }
    this.logger.log('play(', filename, ')');
    this.promise = new Promise((resolve, reject) => {
      this.isPlaying = true;
      this.isStopped = false;
      this.audio = playsound.play(filename, (err) => {
        let resolution = {
          filename: filename,
          isStopped: this.isStopped
        };
        this.logger.log('endplay(', filename, ')', ((this.isStopped)?'stopped':''));
        this.isPlaying = false;
        this.isStopped = false;
        this.onMusicStop();
        resolve(resolution);
      })
      this.onMusicPlay();
    });
    return this.promise;
  }

  stop() {
    if (!this.isPlaying) {
      return new Promise((resolve) => { resolve() });
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
