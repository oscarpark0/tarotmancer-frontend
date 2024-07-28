const fs = require('fs');
const path = require('path');

interface ZIndexEntry {
  zIndex: string;
  filePath: string;
  lineNumber: number;
}

const projectRoot: string = path.resolve(__dirname, '..', 'src');
console.log("Attempting to scan directory:", projectRoot);

const zIndexMap: Map<string, ZIndexEntry> = new Map();

function extractZIndex(content: string, filePath: string): void {
  const regex = /z-index:\s*(-?\d+|auto)|zIndex:\s*(-?\d+|auto)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const zIndex = match[1] || match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const key = `${filePath}:${lineNumber}`;
    zIndexMap.set(key, { zIndex, filePath, lineNumber });
  }
}

function walkDir(dir: string): void {
  console.log("Scanning directory:", dir);
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx|css|scss)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`Scanning file: ${filePath}`);
      extractZIndex(content, filePath);
    }
  }
}

function generateHTML(sortedZIndexes: [string, ZIndexEntry][]): string {
  console.log("Starting HTML generation...");
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Z-Index Visualization</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { display: flex; flex-direction: column-reverse; align-items: start; }
    .z-level { display: flex; align-items: center; margin-bottom: 5px; }
    .z-level span { margin-right: 10px; width: 150px; text-align: right; }
    .component { background-color: #4CAF50; color: white; padding: 5px; border-radius: 5px; margin-left: 10px; }
  </style>
</head>
<body>
  <h1>Z-Index Visualization</h1>
  <div class="container">
  `;

  console.log("HTML base structure created");

  const maxZIndex = Math.max(...sortedZIndexes.map(([, value]) => parseInt(value.zIndex)));
  const minZIndex = Math.min(...sortedZIndexes.map(([, value]) => parseInt(value.zIndex)));

  console.log(`Processing z-index range: ${minZIndex} to ${maxZIndex}`);

  for (let i = maxZIndex; i >= minZIndex; i--) {
    console.log(`Processing z-index: ${i}`);
    const elementsAtThisLevel = sortedZIndexes.filter(([, value]) => parseInt(value.zIndex) === i);
    if (elementsAtThisLevel.length > 0) {
      let levelHtml = `<div class="z-level"><span>z-index: ${i}</span>\n`;
      elementsAtThisLevel.forEach(([, value]) => {
        const fileName = path.basename(value.filePath);
        levelHtml += `<div class="component">${fileName}:${value.lineNumber}</div>\n`;
      });
      levelHtml += `</div>\n`;
      html += levelHtml;
    }
  }

  html += `
  </div>
</body>
</html>
  `;

  console.log("HTML generation complete");
  return html;
}

try {
  console.log("Starting directory walk...");
  walkDir(projectRoot);
  console.log("Directory walk complete. Found", zIndexMap.size, "z-index entries.");

  console.log("Sorting z-index values...");
  const sortedZIndexes: [string, ZIndexEntry][] = Array.from(zIndexMap.entries()).sort((a, b) => {
    const aValue = parseInt(a[1].zIndex);
    const bValue = parseInt(b[1].zIndex);
    return bValue - aValue;
  });
  console.log("Sorting complete.");

  console.log("Generating report...");
  let report = "Z-Index Summary Report\n\n";
  sortedZIndexes.forEach(([, value]) => {
    report += `File: ${value.filePath}\n`;
    report += `Line: ${value.lineNumber}\n`;
    report += `Z-Index: ${value.zIndex}\n\n`;
  });
  console.log("Report generation complete.");

  try {
    console.log("Starting HTML generation...");
    const htmlContent = generateHTML(sortedZIndexes);
    console.log("HTML generation complete.");

    console.log("Writing files...");
    fs.writeFileSync('z-index-report.txt', report);
    fs.writeFileSync('z-index-visualization.html', htmlContent);
    console.log("File writing complete.");
  } catch (error) {
    console.error("Error during HTML generation or file writing:", (error as Error).message);
  }
} catch (error) {
  console.error("Error occurred:", (error as Error).message);
  console.log("Please ensure the path to your src directory is correct.");
  console.log("Current path being used:", projectRoot);
}

console.log("Script execution complete.");

export {};