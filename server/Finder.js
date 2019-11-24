const path = require('path');
const fs = require('fs');

const comparator = function compare(a, b) {
  if (a.type !== b.type) {
    return a.type === 'dir' ? -1 : 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

class Finder {
  constructor(basePath, logger) {
    this.basePath = path.resolve(basePath);
    this.logger = logger;
  }

  async getContent(directory = '') {
    this.logger.log('getContent(', directory, ')');
    const fullPath = `${this.basePath}/${directory}`;

    const resolution = {
      path: directory,
      type: 'dir',
      list: [],
      parent: null
    };
    if (directory) {
      const exploded = directory.split('/');
      exploded.pop();
      resolution.parent = {
        path: exploded.join('/'),
        type: 'dir',
        name: ''
      };
    }

    const dir = await fs.promises.opendir(fullPath);
    // eslint-disable-next-line no-restricted-syntax
    for await (const item of dir) {
      const i = {
        name: item.name,
        type: item.isDirectory() ? 'dir' : 'file',
        path
      };
      if (i.type === 'file') {
        if (!i.name.match(/.mp3|.wav/i)) {
          // eslint-disable-next-line no-continue
          continue;
        }
      }
      resolution.list.push(i);
    }

    resolution.list.sort(comparator);

    return resolution;
  }

  getFileName(item) {
    const fullFileName = `/${this.basePath
      .split('/')
      .concat(item.path.split('/'))
      .concat([item.name])
      .filter(Boolean)
      .join('/')}`;

    if (!fs.existsSync(fullFileName)) {
      this.logger.warn('File ', fullFileName, ' does not exists', item);
      return null;
    }
    return fullFileName;
  }
}

module.exports = Finder;
