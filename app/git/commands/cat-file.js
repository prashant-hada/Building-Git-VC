const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class CatFile {
  constructor(flag, commitSHA) {
    this.flag = flag;
    this.commitSHA = commitSHA;
  }

  execute() {
    const flag = this.flag;
    const commitSHA = this.commitSHA;

    switch (flag) {
      case "-p":
        {
          const folder = commitSHA.slice(0, 2);
          const file = commitSHA.slice(2);

          const completeFilePath = path.join(
            process.cwd(),
            ".git",
            "objects",
            folder,
            file
          );

          if (!fs.existsSync(completeFilePath))
            throw new Error(`Not a valid object name ${commitSHA}`);

          const fileContent = fs.readFileSync(completeFilePath);
          const outputBuffer = zlib.inflateSync(fileContent);
          const output = outputBuffer.toString();

          process.stdout.write(output);
        }
        break;

      default:
        break;
    }
  }
}

module.exports = CatFile;
