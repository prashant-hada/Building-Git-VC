const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");

class CommitTree {
  constructor(treeSHA, parentSHA, commitMessage) {
    this.treeSHA = treeSHA;
    this.parentSHA = parentSHA;
    this.commitMessage = commitMessage;
  }

  execute() {
    const commitBuffer = Buffer.concat([
      Buffer.from(`tree ${this.treeSHA}\n`),
      Buffer.from(`parent ${this.parentSHA}`),
      Buffer.from(
        `author Test User <testUser@gmail.com> ${Date.now()} +0000\n`
      ),
      Buffer.from(
        `commiter Test User <testUser@gmail.com> ${Date.now()} +0000\n\n`
      ),
      Buffer.from(`${this.commitMessage}`),
    ]);

    const header = `commmit ${commitBuffer.lenght}\0`;
    const data = Buffer.concat([Buffer.from(header), commitBuffer]);
    const hash = crypto.createHash("sha1").update(data).digest("hex");

    const folder = hash.slice(0, 2);
    const file = hash.slice(2);

    const commitPath = path.join(process.cwd(), ".git", "objects", folder);

    if (!fs.existsSync(commitPath)) fs.mkdirSync(commitPath);

    const compressedData = zlib.deflateSync(data);

    fs.writeFileSync(path.join(commitPath, file), compressedData);
    process.stdout.write(hash);
  }
}

module.exports = CommitTree;
