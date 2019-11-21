
const path = require("path");
const fs = require('fs');

const compare = function compare(a, b) {
    if (a.type !== b.type) {
        return (a.type == 'dir') ? -1 : 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}


class Finder {

    constructor(basePath, logger) {
        this.basePath = path.resolve(basePath);
        this.logger = logger;
    }

    async getContent(path) {
        this.logger.log('getContent(', path, ')');
        if (!path) {
            path = '';
        }
        var fullPath = this.basePath + '/' + path;
        var list = [];

        let dir = await fs.promises.opendir(fullPath);
        for await (const item of dir) {
            let i = {
                name: item.name,
                type: (item.isDirectory()) ? 'dir' : 'file',
                path: path
            };
            if(i.type==='file'){
                if(!i.name.match(/.mp3/)){
                    continue;
                }
            }
            list.push(i);
        }

        list.sort(compare);

        let parent = null;
        if (path) {
            let exploded = path.split('/');
            exploded.pop();
            parent = {
                path: exploded.join('/'),
                type: 'dir',
                name: '',
            }
        }

        return {
            path: path,
            type: 'dir',
            list: list,
            parent,
        };
    }

    getFileName(item) {
        let fullFileName = this.basePath
            .split('/')
            .concat(item.path.split('/'))
            .concat([item.name])
            .join('/');

        if (!fs.existsSync(fullFileName)) {
            this.logger.warn('File ', fullFileName, ' does not exists', item, paths);
            return null;
        }
        return fullFileName;
    }


}


module.exports = Finder;