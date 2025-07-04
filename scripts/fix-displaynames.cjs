const fs = require('fs');
const path = require('path');

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regular expression to match displayName assignments
  const displayNameRegex = /([A-Za-z]+)\.displayName\s*=\s*([A-Za-z]+(?:\.[A-Za-z]+)*)\.displayName/g;
  
  // Replace displayName assignments with safe versions
  content = content.replace(displayNameRegex, (match, component, primitive) => {
    const componentName = component;
    const fallbackName = componentName;
    return `${component}.displayName = ${primitive}?.displayName || '${fallbackName}'`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Function to recursively process all TypeScript/JavaScript files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      console.log(`Processing ${fullPath}...`);
      processFile(fullPath);
    }
  });
}

// Start processing from the UI components directory
const uiDirectory = path.join(__dirname, '..', 'src', 'components', 'ui');
console.log(`Starting to process files in ${uiDirectory}...`);
processDirectory(uiDirectory);
console.log('Finished processing all files.');