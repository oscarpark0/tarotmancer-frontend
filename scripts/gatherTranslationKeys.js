"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var translationKeyRegex = /getTranslation\(['"](.+?)['"]\)/g;
var translationKeys = new Set();
function scanFile(filePath) {
    var content = fs.readFileSync(filePath, 'utf-8');
    var match;
    while ((match = translationKeyRegex.exec(content)) !== null) {
        translationKeys.add(match[1]);
    }
}
function scanDirectory(dir) {
    var files = fs.readdirSync(dir);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path.join(dir, file);
        var stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanDirectory(filePath);
        }
        else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
            scanFile(filePath);
        }
    }
}
// Start scanning from the src directory
scanDirectory(path.join(__dirname, '..', 'src'));
// Output the results
console.log('Translation keys found:');
console.log(Array.from(translationKeys).sort().join('\n'));
// Optionally, write to a file
fs.writeFileSync('translationKeys.json', JSON.stringify(Array.from(translationKeys), null, 2));
