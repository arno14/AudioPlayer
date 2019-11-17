
const fs = require('fs');
const path = require("path");


class Finder {

    constructor(basePath) {
        basePath = path.resolve(basePath);
        this.basePath = basePath;
        this.currentPath = basePath;
    }

    async getFiles(path) {
        if(!path){
            path = '';
        }
        var fullPath = this.basePath+'/'+path;
        var Mreturn = {
            directory: path,
            files: [],
            subdirs: []
        };
        let dir = await fs.promises.opendir(fullPath);
        for await (const item of dir) {
            if (item.isDirectory()) {
                Mreturn.subdirs.push(item.name);
            } else if (item.isFile()) {
                Mreturn.files.push(item.name);
            }
        }

        Mreturn.files.sort();
        Mreturn.subdirs.sort();

        return Mreturn;
    }
}


module.exports = Finder;