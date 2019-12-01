const path = require('path');
const fs = require('fs');
const find = require('find');

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

const audioExtension = /.mp3|.wav/i;

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
      dirs: [],
      files: [],
      parent: null
    };
    // const regexp = /\.mp3$/;
    const regexp = new RegExp(term, 'i');
    let countResolved = 0;

    return new Promise(resolve => {
      const finalize = () => {
        if (countResolved !== 2) {
          return;
        }
        resolution.list = resolution.dirs.concat(resolution.files);
        delete resolution.dirs;
        delete resolution.files;
        resolve(resolution);
      };

      find.dir(regexp, this.basePath, dirs => {
        dirs.forEach(d => {
          const item = { type: 'dir' };
          const paths = d.replace(this.basePath, '').split('/');
          item.name = paths[paths.length - 1];
          paths.pop();
          item.path = paths.join('/');
          resolution.dirs.push(item);
        });
        countResolved += 1;
        finalize();
      });

      find.file(regexp, this.basePath, files => {
        files.forEach(f => {
          const item = { type: 'file' };
          const paths = f.replace(this.basePath, '').split('/');
          item.name = paths[paths.length - 1];
          paths.pop();
          item.path = paths.join('/');

          if (item.name.match(audioExtension)) {
            resolution.files.push(item);
          }
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
        if (!i.name.match(audioExtension)) {
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
