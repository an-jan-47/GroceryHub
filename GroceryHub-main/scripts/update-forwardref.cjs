const fs = require('fs');
const path = require('path');

function findTsxFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file uses forwardRef
  if (!content.includes('forwardRef') && !content.includes('React.forwardRef')) {
    return;
  }

  // Remove any existing forwardRef import
  let updatedContent = content.replace(
    /import\s*{[^}]*forwardRef[^}]*}\s*from\s*['"]react['"]/g,
    ''
  );

  // Remove empty React import destructuring
  updatedContent = updatedContent.replace(
    /import\s*{\s*}\s*from\s*['"]react['"]/g,
    ''
  );

  // Update or add React import with forwardRef
  if (updatedContent.includes('import * as React from "react"')) {
    updatedContent = updatedContent.replace(
      /import\s*\*\s*as\s*React\s*from\s*['"]react['"]/,
      'import * as React from "react"\nimport { forwardRef } from "react"'
    );
  } else {
    updatedContent = 'import * as React from "react"\nimport { forwardRef } from "react"\n' + updatedContent;
  }

  // Replace React.forwardRef with forwardRef
  updatedContent = updatedContent.replace(/React\.forwardRef/g, 'forwardRef');

  // Clean up multiple blank lines
  updatedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${filePath}`);
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const tsxFiles = findTsxFiles(srcDir);

  let updatedCount = 0;
  for (const file of tsxFiles) {
    try {
      updateFile(file);
      updatedCount++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  console.log(`\nUpdated ${updatedCount} files successfully`);
}

main();