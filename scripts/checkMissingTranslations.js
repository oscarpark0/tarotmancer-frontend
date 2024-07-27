const fs = require('fs');
const path = require('path');

const translationKeyRegex = /getTranslation\(['"](.+?)['"]\)/g;
const translationKeys = new Set();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  while ((match = translationKeyRegex.exec(content)) !== null) {
    translationKeys.add(match[1]);
  }
}

function scanDirectory(dir) {
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

// Get all language files
const languageDir = path.join(__dirname, '..', 'src', 'utils', 'translations');
const languageFiles = fs.readdirSync(languageDir).filter(file => file.endsWith('.json'));

// Object to store missing keys for each language
const missingTranslations = {};

// Check missing translations for each language
languageFiles.forEach(file => {
  const language = path.basename(file, '.json');
  const translations = JSON.parse(fs.readFileSync(path.join(languageDir, file), 'utf-8'));
  
  const missingKeys = Array.from(translationKeys).filter(key => !(key in translations));
  
  if (missingKeys.length > 0) {
    missingTranslations[language] = missingKeys;
  }
});

// Group languages by missing keys
const groupedMissingTranslations = {};
Object.entries(missingTranslations).forEach(([language, keys]) => {
  const keyString = keys.sort().join(',');
  if (!groupedMissingTranslations[keyString]) {
    groupedMissingTranslations[keyString] = [];
  }
  groupedMissingTranslations[keyString].push(language);
});

// Output grouped missing translations
Object.entries(groupedMissingTranslations).forEach(([keyString, languages]) => {
  console.log(`\nMissing translations for ${languages.join(', ')}:`);
  keyString.split(',').forEach(key => console.log(`  - ${key}`));
});

// Output languages with all translations present
const completeLanguages = languageFiles
  .map(file => path.basename(file, '.json'))
  .filter(language => !missingTranslations[language]);

if (completeLanguages.length > 0) {
  console.log(`\nAll translations are present for: ${completeLanguages.join(', ')}`);
}

// Output all used keys
console.log('\nAll used translation keys:');
console.log(Array.from(translationKeys).sort().join('\n'));

// Optionally, write to a file
fs.writeFileSync('usedTranslationKeys.json', JSON.stringify(Array.from(translationKeys), null, 2));