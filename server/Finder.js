
const fs = require('fs');


class Finder {

    constructor(basePath) {
        this.basePath = basePath;
        this.currentPath = basePath;
    }

    getFiles() {
        var Mreturn ={
            directory:this.currentPath,
            files:[]
        }
        return new Promise((resolve,reject)=>{
            fs.readdir(this.currentPath, function (err, items) {
                Mreturn.files=items
                resolve(Mreturn);
            });
        })
    }
}


module.exports = Finder;