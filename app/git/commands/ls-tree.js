const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
class LsTree{
    constructor(flag , sha){
        this.flag = flag;
        this.sha= sha;
    }

    execute(){
        const folder = this.sha.slice(0,2);
        const file = this.sha.slice(2);

        const folderPath = path.join(process.cwd(),".git", "objects", folder);
        const filePath = path.join(folderPath, file);

        if(!fs.existsSync(folderPath) || !fs.existsSync(filePath)) throw new Error(`Not a valid object name ${sha}`);

        const fileContent = fs.readFileSync(filePath);
        const outputBuffer = zlib.inflateSync(fileContent);
        const fileOutput = outputBuffer.toString().split("\0");

        const pairs = fileOutput.slice(1).filter(e=> e.includes(" "));

        const names = pairs.map(e=> e.split(" ")[1]);

        names.forEach(name=>process.stdout.write(`${name}\n`))

    }
}

module.exports = LsTree;