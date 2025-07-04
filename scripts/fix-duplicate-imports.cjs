const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // File extensions to process
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // Directories to exclude
  excludeDirs: ['node_modules', 'dist', 'build', '.git'],
  // Root directory to start searching from
  rootDir: path.join(__dirname, '..'),
};

// Find all relevant files recursively
function findFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return files;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory() && !CONFIG.excludeDirs.includes(entry.name)) {
        files.push(...findFiles(fullPath));
      } else if (entry.isFile() && CONFIG.extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix merged import statements
    if (content.includes('import React') && content.includes('import { safeForwardRef }')) {
      // Check for the specific pattern of merged imports
      const mergedImportPattern = /import React(.*)from "react";import/;
      if (mergedImportPattern.test(content)) {
        // Fix by adding a line break between the imports
        content = content.replace(mergedImportPattern, 'import React$1from "react";\nimport');
        
        // Remove duplicate safeForwardRef from React import if present
        content = content.replace(/import React, \{ (.*)safeForwardRef(.*)\} from "react";/, (match, before, after) => {
          const imports = (before + after)
            .split(',')
            .map(item => item.trim())
            .filter(item => item && item !== 'safeForwardRef')
            .join(', ');
          
          if (imports) {
            return `import React, { ${imports} } from "react";`;
          } else {
            return `import React from "react";`;
          }
        });
      }
    }
    
    // Only write if content has changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { processed: true, changes: 'Fixed merged import statements' };
    }
    
    return { processed: false, reason: 'No changes needed' };
  } catch (error) {
    return { processed: false, error: error.message };
  }
}

// Main function
function main() {
  const files = findFiles(CONFIG.rootDir);
  console.log(`Found ${files.length} files to process`);
  
  let processedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const result = processFile(file);
    
    if (result.processed) {
      console.log(`✅ Processed: ${file}`);
      processedCount++;
    } else if (result.error) {
      console.error(`❌ Error processing ${file}: ${result.error}`);
      errorCount++;
    } else {
      console.log(`⏭️ Skipped: ${file} (${result.reason})`);
      skippedCount++;
    }
  }
  
  console.log('\nSummary:');
  console.log(`Total files: ${files.length}`);
  console.log(`Processed: ${processedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

main();