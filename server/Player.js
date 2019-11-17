const player = require('play-sound')(
  // opts = {
  // players:['mplayer','afplay', 'mpg123','mpg321','play','omxplayer', 'aplay','cmdmp3'],
  // player:'aplay'
  // }
);

const fs = require('fs');

class Player {
  constructor(basePath, file) {
    this.setFile(file);
    this.isPlaying = false;
    var _audio = null;    
    this.setAudio = (audio) => { _audio = audio };
    this.getAudio = () => { return _audio };
    var _basePath = basePath;
    this.getBasePath = ()=>{ return _basePath};
  }

  setFile(filename){
    console.log('setFile', filename);
    this.filename = filename;
  }

  play() {
    console.log('play()');
    this.isPlaying = true;
    let fullFileName = this.getBasePath()+'/'+this.filename;
    if(!fs.existsSync(fullFileName)){
      throw "File "+fullFileName+' does not exists';
    }
    this.setAudio(player.play(fullFileName, (err) => {
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
