const cp = require('child_process');

class MPlayerProcess {
  constructor(file, logger, onEnd) {
    this.logger = logger;
    this.isPaused = false;
    this.file = file;
    this.resolutions = {};
    this.datas = {};
    this.childProcess = cp.spawn(
      'mplayer',
      ['-slave', '-quiet', this.file],
      ['-i']
    );
    this.childProcess.stdout.setEncoding('utf8');
    this.childProcess.stdout.on('data', data => this.onData(data)); // NB si pas de arrow function, problem de this

    const interval = setInterval(() => {
      if (!this.isPaused) {
        // NB requesting info restarts the process if paused
        this.getInfos();
      }
    }, 1000); // request state regulary

    this.childProcess.on('close', () => {
      clearInterval(interval);
      onEnd();
    });

    this.getInfos();
  }

  seek(requestedPercent) {
    this.exec(`seek ${requestedPercent} 1`);
    return this.getInfos();
  }

  pause() {
    if (!this.isPaused) {
      this.getInfos();
    }
    this.exec('pause');
    this.isPaused = !this.isPaused;
  }

  kill() {
    this.childProcess.kill();
  }

  getLength() {
    return this.datas.ANS_LENGTH;
  }

  getPos() {
    return this.datas.ANS_TIME_POSITION;
  }

  getPercent() {
    return this.datas.ANS_PERCENT_POSITION;
  }

  getInfos() {
    // @see http://www.mplayerhq.hu/DOCS/tech/slave.txt
    return Promise.all([
      this.exec('get_time_length', 'ANS_LENGTH'),
      this.exec('get_time_pos', 'ANS_TIME_POSITION'),
      this.exec('get_percent_pos', 'ANS_PERCENT_POSITION')
    ]);
  }

  exec(cmd, expectedDataName) {
    this.childProcess.stdin.write(`${cmd}\n`);
    return new Promise(resolve => {
      if (expectedDataName) {
        this.resolutions[expectedDataName] = resolve;
      } else {
        resolve();
      }
    });
  }

  onData(data) {
    this.logger.log('onMPlayerData', data);
    data.split('\n').forEach(line => {
      const splitted = line.trim().split('=');
      if (splitted.length === 2) {
        const name = splitted[0];
        const value = splitted[1];
        this.datas[name] = value;
        if (this.resolutions[name]) {
          this.resolutions[name](value);
          this.resolutions[name] = null;
        }
      }
    });
  }
}

module.exports = MPlayerProcess;
