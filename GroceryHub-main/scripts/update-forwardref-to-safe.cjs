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
    
    // Skip files that don't use forwardRef
    if (!content.includes('forwardRef')) {
      return { processed: false, reason: 'No forwardRef usage' };
    }
    
    // Check if already using safeForwardRef
    if (content.includes('safeForwardRef')) {
      return { processed: false, reason: 'Already using safeForwardRef' };
    }
    
    // Add import for safeForwardRef if not already present
    if (!content.includes('import { safeForwardRef }') && !content.includes('import {safeForwardRef}')) {
      // Check if we need to add the import statement
      content = content.replace(
        /import React(.*) from ['"]react['"];?/,
        'import React$1 from "react";\
import { safeForwardRef } from "@/lib/forwardRefWrapper";'
      );
      
      // If no React import was found, add both imports at the top
      if (!content.includes('safeForwardRef')) {
        content = 'import React from "react";\
import { safeForwardRef } from "@/lib/forwardRefWrapper";\n' + content;
      }
    }
    
    // Replace forwardRef with safeForwardRef
    content = content.replace(/import\s+{([^}]*)forwardRef([^}]*)}\s+from\s+['"]react['"];?/g, (match, before, after) => {
      // Remove forwardRef from the import list
      const newImports = (before + after)
        .split(',')
        .map(item => item.trim())
        .filter(item => item && item !== 'forwardRef')
        .join(', ');
      
      if (newImports) {
        return `import { ${newImports} } from "react";`;
      } else {
        return '';
      }
    });
    
    // Replace React.forwardRef with safeForwardRef
    content = content.replace(/React\.forwardRef/g, 'safeForwardRef');
    
    // Replace standalone forwardRef with safeForwardRef
    content = content.replace(/\bforwardRef\b(?!\s*from)/g, 'safeForwardRef');
    
    // Clean up multiple blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Only write if content has changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { processed: true, changes: 'Updated forwardRef to safeForwardRef' };
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