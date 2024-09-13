const fs = require("fs");
const path = require("path");

const GitClient = require("./git/client.js");
const { CatFile, HashObject } = require("./git/commands");


// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage

const gitClient = new GitClient();
const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    handleCatFileCommand();
    break;
  case "hash-object":
    handleHashObjectCommand();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(path.join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}

function handleCatFileCommand(){

  const flag = process.argv[3];
  const commitSHA = process.argv[4];

  const commandObj = new CatFile(flag, commitSHA);
  gitClient.run(commandObj);

}

function handleHashObjectCommand(){
  let flag = process.argv[3];
  let filePath = process.argv[4];

  //If Flag "-w" is missing then file path would be in process.argv[3]
  if(!filePath){
    filePath = flag;
    flag = null;
  }

  const commandObj = new HashObject(flag,filePath);
  gitClient.run(commandObj);
}
