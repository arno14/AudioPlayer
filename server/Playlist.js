const fs = require('fs');

class Playlist {

    constructor(finder, logger) {
        this.finder = finder;
        this.logger = logger;
        this.clear();
    }

    find(item) {
        for (let i = 0; i < this.list.length; i++) {
            let currentItem = this.list[i];
            if (item.name === currentItem.name && item.path === currentItem.path) {
                return i;
            }
        }
        return null;
    }

    replace(item) {
        let existingIndex = this.find(item);
        this.logger.log('replace(', item, existingIndex, ')');
        if (existingIndex >= 0) {
            this.currentIndex = existingIndex;
        } else if (this.currentIndex !== null) {
            this.list.splice(this.currentIndex + 1, 0, item);
            this.list.currentIndex = this.currentIndex + 1;
        } else {
            this.list.push(item);
            this.currentIndex = this.list.length - 1;
        }
    }

    push(item) {
        this.logger.log('push(', item, ')');
        let existingIndex = this.find(item);
        if (existingIndex !== null) {
            return new Promise(resolve => resolve());
        } else if (item.type == 'file') {
            this.list.push(item);
            return new Promise(resolve => resolve());
        }
        return new Promise((resolve, reject) => {
            let dirPath = item.path.split('/').concat(item.name);
            this.finder.getContent(dirPath.join('/')).then((r) => {
                r.list.forEach((i) => {
                    if (i.type == 'file') {
                        this.push(i);
                    }
                });
                resolve();
            });
        })
    }

    current() {
        if (this.currentIndex === null) {
            if (this.list.length > 0) {
                this.currentIndex = 0;
            }
        }
        if (typeof this.list[this.currentIndex] !== 'undefined') {
            return this.list[this.currentIndex];
        }
    }

    currentFileName() {
        let current = this.current();
        if (!current) {
            return null;
        }
        return this.finder.getFileName(current);
    }

    next() {
        let nextIndex = this.currentIndex + 1;
        if (typeof this.list[nextIndex] !== 'undefined') {
            this.currentIndex = nextIndex;
            return this.list[nextIndex];
        }
        this.currentIndex = null;
        return null;
    }

    clear() {
        this.list = [];
        this.currentIndex = null;
    }
}


module.exports = Playlist;