const path = require("path")
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");
class HashObject{
    constructor(flag, filePath){
        this.flag = flag;
        this.filePath = filePath
    }

    execute(){
        const filePath = path.resolve(this.filePath);
        // console.log("filePath : ",filePath);


        if(!fs.existsSync(filePath))
            throw new Error(
                `Could not open ${filePath} for reading: No such file or directory`
            );

            let fileContent = fs.readFileSync(filePath, 'utf8'); // Read file as utf8 string
            fileContent = fileContent.replace(/\r\n/g, '\n'); // Normalize line endings to LF
    
            const fileLength = Buffer.byteLength(fileContent);

        // console.log("fileContent : ",fileContent);
        // console.log("fileLength : ",fileLength);

        const header = `blob ${fileLength}\0`;
        const blob = Buffer.concat([Buffer.from(header), Buffer.from(fileContent)]);

        // console.log("header : ",header);
        // console.log("blob : ",blob);


        const hash = crypto.createHash("sha1").update(blob).digest("hex")

        if(this.flag && this.flag === "-w"){
            const folder = hash.slice(0,2);
            const file = hash.slice(2);

            const completeFolderPath = path.join(process.cwd(), ".git","objects",folder);
            // console.log("completeFolderPath : ",completeFolderPath);

            if(!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

            const compressedData = zlib.deflateSync(blob);
            // console.log("compressedData : ",compressedData);

            fs.writeFileSync(
                path.join(completeFolderPath, file), compressedData
            )
        }

        process.stdout.write(hash);
    }
}

module.exports = HashObject;