const path = require('path');
const fs = require('fs');
const find = require('find');

// for ordering the list with dir first
const itemComparator = (a, b) => {
  if (a.type !== b.type) {
    return a.type === 'dir' ? -1 : 1;
  }
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  }
  return 0;
};

const AUDIO_EXTENSIONS = /.mp3|.wav|.wma/i;

class Finder {
  constructor(basePath, logger) {
    this.basePath = path.resolve(basePath);
    this.logger = logger;
  }

  filter(term) {
    const resolution = {
      term,
      path: this.basePath,
      type: 'dir',
      list: [],
      parent: null
    };

    const pushItem = (type, filename) => {
      const paths = filename.replace(this.basePath, '').split('/');
      const item = { type, name: paths[paths.length - 1] };
      paths.pop();
      item.path = paths.join('/');
      if (type === 'file' && !item.name.match(AUDIO_EXTENSIONS)) {
        return;
      }
      resolution.list.push(item);
    };

    const regexp = new RegExp(term, 'i');
    let countResolved = 0;

    return new Promise(resolve => {
      const finalize = () => {
        if (countResolved !== 2) {
          return;
        }
        resolution.list.sort(itemComparator);
        resolve(resolution);
      };

      find.dir(regexp, this.basePath, dirs => {
        dirs.forEach(d => {
          pushItem('dir', d);
        });
        countResolved += 1;
        finalize();
      });

      find.file(regexp, this.basePath, files => {
        files.forEach(f => {
          pushItem('file', f);
        });
        countResolved += 1;
        finalize();
      });
    });
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
        path: directory
      };
      if (i.type === 'file') {
        if (!i.name.match(AUDIO_EXTENSIONS)) {
          // eslint-disable-next-line no-continue
          continue;
        }
      }
      resolution.list.push(i);
    }

    resolution.list.sort(itemComparator);

    return resolution;
  }

  getFileName(item) {
    const fullFileName = `/${this.basePath
      .split('/')
      .concat(item.path.split('/'))
      .concat([item.name])
      .filter(Boolean) // remove empty string
      .join('/')}`;

    if (!fs.existsSync(fullFileName)) {
      this.logger.warn('File ', fullFileName, ' does not exists', item);
      return null;
    }
    return fullFileName;
  }
}

module.exports = Finder;
