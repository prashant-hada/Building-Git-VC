const fs = require("fs");
const path = require("path");

const GitClient = require("./git/client.js");
const { CatFile, HashObject, LsTree, WriteTree, CommitTree } = require("./git/commands");


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
  case "ls-tree":
    handleLSTreeCommand();
    break;
  case "write-tree":
    handleWriteTreeCommand();
    break;
  case "commit-tree":
    handleCommitTreeCommand();
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

function handleLSTreeCommand(){
  let flag = process.argv[3];
  let sha = process.argv[4];

  if((!sha && flag === "--name-only") || !flag) throw new Error("command not found :  provide an object name");
  else if (flag && !sha){
    sha = flag;
    flag = null;
  }
  
  const commandObj = new LsTree(flag, sha);
  gitClient.run(commandObj);
}

function handleWriteTreeCommand(){
  const commandObj = new WriteTree();
  gitClient.run(commandObj);
}

function handleCommitTreeCommand(){
  const treeSHA = process.argv[3];
  const parentCommitSHA = process.argv[5];
  const commitMessage = process.argv[7];

  const commitFlag = process.argv[6];

  const errorStack = []

  if(!treeSHA) errorStack.push(new Error("Command is invalid : Tree object's hash is not present\n"));
  if(!parentCommitSHA) errorStack.push(new Error("Command is invalid : Parent commit's hash is not present\n"));
  if(!commitFlag || commitFlag !== "-m" ) errorStack.push(new Error(`Command is invalid : ${commitFlag} is not a valid Commit Flag\n`));
  if(!commitMessage) errorStack.push(new Error("Command is invalid : Commit message is not present\n"));

  if (errorStack.length()>0) throw errorStack;

  const commandObj = CommitTree(treeSHA, parentCommitSHA, commitMessage);
  gitClient.run(commandObj);
}