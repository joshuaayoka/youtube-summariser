const fs = require("fs")

const extractTextFromTxt = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

console.log(extractTextFromTxt('qlearning.txt'))