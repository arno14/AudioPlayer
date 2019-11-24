const fs = require('fs');

class Playlist {
  constructor(finder, savePath, logger) {
    this.finder = finder;
    this.savePath = savePath;
    this.logger = logger;
    this.list = [];
    this.currentIndex = null;

    if (fs.existsSync(this.savePath)) {
      const rawdata = fs.readFileSync(this.savePath);
      const saved = JSON.parse(rawdata);
      if (saved.list) {
        this.list = saved.list;
        this.currentIndex = saved.currentIndex;
      }
    } else {
      this.save();
    }
  }

  find(item) {
    this.logger.log('find(', item, ')');
    for (let i = 0; i < this.list.length; i += 1) {
      const currentItem = this.list[i];
      if (item.name === currentItem.name && item.path === currentItem.path) {
        return i;
      }
    }
    return null;
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
    return null;
  }

  currentFileName() {
    const current = this.current();
    if (!current) {
      return null;
    }
    return this.finder.getFileName(current);
  }

  next() {
    const nextIndex = this.currentIndex + 1;
    if (typeof this.list[nextIndex] !== 'undefined') {
      this.currentIndex = nextIndex;
      return this.list[nextIndex];
    }
    this.currentIndex = null;
    this.save();
    return null;
  }

  remove(item) {
    this.logger.log('remove(', item, ')');
    const existingIndex = this.find(item);
    if (existingIndex >= 0) {
      this.list.splice(existingIndex, 1);
      this.currentIndex -= 1;
    } else {
      this.logger.warn('remove(), not found', existingIndex);
    }
    this.save();
    return new Promise(resolve => resolve());
  }

  replace(item) {
    const existingIndex = this.find(item);
    this.logger.log('replace(', item, existingIndex, ')');
    if (existingIndex !== null) {
      this.logger.log('already in list change index');
      this.currentIndex = existingIndex;
    } else {
      this.logger.log('push in the list');
      this.list.push(item);
      this.currentIndex = this.list.length - 1;
    }
    this.save();
  }

  push(item) {
    this.logger.log('push(', item, ')');
    const existingIndex = this.find(item);
    if (existingIndex !== null) {
      return new Promise(resolve => resolve());
    }
    if (item.type === 'file') {
      this.list.push(item);
      this.save();
      return new Promise(resolve => resolve());
    }
    return new Promise(resolve => {
      const dirPath = item.path.split('/').concat(item.name);
      this.finder.getContent(dirPath.join('/')).then(r => {
        r.list.forEach(i => {
          if (i.type === 'file') {
            this.push(i);
          }
        });
        resolve();
      });
    });
  }

  clear() {
    this.list = [];
    this.currentIndex = null;
    this.save();
  }

  save() {
    const content = JSON.stringify(
      {
        list: this.list,
        currentIndex: this.currentIndex
      },
      null,
      '\t'
    );

    fs.writeFileSync(this.savePath, content, { flag: 'w' });
  }
}

module.exports = Playlist;
