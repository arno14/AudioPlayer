class Logger {
  constructor(channel, isVerbose = false) {
    this.channel = channel;
    const diff = 10 - this.channel.length;
    for (let j = 0; j < diff; j += 1) {
      this.channel += ' ';
    }
    this.channel += ': ';

    this.isVerbose = isVerbose;
  }

  log() {
    if (this.isVerbose) {
      // eslint-disable-next-line prefer-rest-params
      const args = this.getArgs(arguments);
      // eslint-disable-next-line no-console
      console.log.apply(this, args);
    }
  }

  warn() {
    // eslint-disable-next-line prefer-rest-params
    const args = this.getArgs(arguments);
    // eslint-disable-next-line no-console
    console.warn.apply(this, args);
  }

  getArgs(functionArguments) {
    const r = [this.channel];
    for (let i = 0; i < functionArguments.length; i += 1) {
      r.push(functionArguments[i]);
    }
    return r;
  }
}

module.exports = Logger;
