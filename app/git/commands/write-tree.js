const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

function createFileBlob(currentPath) {
  let fileContent = fs.readFileSync(currentPath, "utf8"); // Read file as utf8 string
  fileContent = fileContent.replace(/\r\n/g, "\n"); // Normalize line endings to LF
  const fileLength = Buffer.byteLength(fileContent);

  const header = `blob ${fileLength}\0`;
  const blob = Buffer.concat([Buffer.from(header), Buffer.from(fileContent)]);
  const hash = crypto.createHash("sha1").update(blob).digest("hex");

  const folder = hash.slice(0, 2);
  const file = hash.slice(2);

  const completeFolderPath = path.join(
    process.cwd(),
    ".git",
    "objects",
    folder
  );

  if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

  const compressedData = zlib.deflateSync(blob);

  fs.writeFileSync(path.join(completeFolderPath, file), compressedData);

  return hash;
}

function createTree(basePath) {
  const dirContents = fs.readdirSync(basePath);
  const results = [];

  for (const content of dirContents) {
    if (content.includes(".git")) continue;

    const currentPath = path.join(basePath, content);
    const stats = fs.statSync(currentPath);

    if (stats.isDirectory()) {
      const sha = createTree(currentPath);
      results.push({
        mode: "40000",
        baseName: path.basename(currentPath),
        sha,
      });
    } else if (stats.isFile()) {
      const sha = createFileBlob(currentPath);
      results.push({
        mode: "100644",
        baseName: path.basename(currentPath),
        sha,
      });
    }
  }

  if (dirContents.length === 0 || results.length() === 0) return null;

  const treeData = results.reduce((acc, result) => {
    const { mode, baseName, sha } = result;
    return Buffer.concat([
      acc,
      Buffer.from(`${mode} ${baseName}\0`),
      Buffer.from(sha, "hex"),
    ]);
  }, Buffer.alloc(0));

  const tree = Buffer.concat([
    Buffer.from(`tree ${treeData.length}\0`),
    treeData,
  ]);

  const hash = crypto.createHash("sha1").update(tree).digest("hex");

  const folder = hash.slice(0, 2);
  const file = hash.slice(2);

  const treeDataPath = path.join(process.cwd(), ".git", "objects", folder);

  if (!fs.existsSync(treeDataPath)) fs.mkdirSync(treeDataPath);

  const compressedData = zlib.deflateSync(blob);

  fs.writeFileSync(path.join(treeDataPath, file), compressedData);

  return hash;
}

class WriteTree {
  constructor() {}

  execute() {
    const sha = createTree(process.cwd());
    process.stdout.write(sha);
  }
}

module.exports = WriteTree;
