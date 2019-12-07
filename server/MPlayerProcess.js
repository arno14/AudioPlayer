const cp = require('child_process');

class MPlayerProcess {
  constructor(file, onEnd) {
    this.isPaused = false;
    this.file = file;
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
        // NB requesting info restart the process if paused
        this.getInfos();
      }
    }, 2000); // request state every 5 seconds

    this.childProcess.on('close', () => {
      clearInterval(interval);
      onEnd();
    });

    this.getInfos();
  }

  pause() {
    this.getInfos();
    this.isPaused = !this.isPaused;
    this.exec('pause');
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

  _getInfos() {
    // @see http://www.mplayerhq.hu/DOCS/tech/slave.txt
    this.exec('get_time_length');
    this.exec('get_time_pos');
    this.exec('get_percent_pos');
  }

  _exec(cmd) {
    this.childProcess.stdin.write(`${cmd}\n`);
  }

  _onData(data) {
    // console.log('onData', data);

    data.split('\n').forEach(line => {
      //   console.log('data line=', line);
      const splitted = line.trim().split('=');
      if (splitted.length === 2) {
        // console.log('splitted=', splitted, this.datas);
        this.datas[splitted[0]] = splitted[1];
        // console.log(this.datas);
      }
    });
  }
}

module.exports = MPlayerProcess;
