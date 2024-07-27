import fs from 'fs';
import path from 'path';

const translationKeyRegex = /getTranslation\(['"](.+?)['"]\)/g;
const translationKeys = new Set<string>();

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  while ((match = translationKeyRegex.exec(content)) !== null) {
    translationKeys.add(match[1]);
  }
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
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