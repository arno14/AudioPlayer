class Logger {
    constructor(channel, isVerbose = false) {
        this.channel = channel;
        let diff = 10 - this.channel.length;
        for (let j = 0; j < diff; j++) {
            this.channel += ' ';
        }
        this.channel += ': ';

        this.isVerbose = isVerbose;
    }

    log() {
        if (this.isVerbose) {
            console.log.apply(this, this.getArgs(arguments));
        }
    }
    
    warn() {
        console.warn.apply(this, this.getArgs(arguments));
    }

    getArgs(args) {
        let r = [this.channel];
        for (let i = 0; i < args.length; i++) {
            r.push(args[i]);
        }
        return r;
    }
}

module.exports = Logger;