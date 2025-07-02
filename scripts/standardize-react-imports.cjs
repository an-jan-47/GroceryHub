const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // File extensions to process
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // Directories to exclude
  excludeDirs: ['node_modules', 'dist', 'build', '.git'],
  // Import style: 'option-a' for namespace imports, 'option-b' for default+named imports
  importStyle: 'option-b',
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
    
    // Skip files that don't use React
    if (!content.includes('react')) {
      return { processed: false, reason: 'No React imports' };
    }
    
    // Extract all React imports
    const reactImportRegex = /import\s+(?:([^{*]*)\s*,\s*)?(?:{([^}]*)}\s*from\s*|\*\s*as\s+([^\s]*)\s+from\s+)['"]react['"];?/g;
    const reactImports = [];
    let match;
    
    while ((match = reactImportRegex.exec(content)) !== null) {
      reactImports.push({
        fullMatch: match[0],
        defaultImport: match[1] ? match[1].trim() : null,
        namedImports: match[2] ? match[2].trim() : null,
        namespaceImport: match[3] ? match[3].trim() : null,
      });
    }
    
    if (reactImports.length === 0) {
      return { processed: false, reason: 'No React imports found' };
    }
    
    // Collect all named imports
    const allNamedImports = new Set();
    let hasDefaultImport = false;
    
    reactImports.forEach(imp => {
      if (imp.defaultImport) {
        hasDefaultImport = true;
      }
      
      if (imp.namedImports) {
        imp.namedImports.split(',').forEach(named => {
          const cleanNamed = named.trim();
          if (cleanNamed) {
            allNamedImports.add(cleanNamed);
          }
        });
      }
      
      // If using namespace import, we need to check for React.X usage
      if (imp.namespaceImport) {
        const nsName = imp.namespaceImport;
        // Check for common React APIs that might be used with namespace
        ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'forwardRef'].forEach(api => {
          const apiRegex = new RegExp(`${nsName}\.${api}\b`, 'g');
          if (apiRegex.test(content)) {
            allNamedImports.add(api);
            // Replace namespace usage with direct usage
            content = content.replace(apiRegex, api);
          }
        });
      }
    });
    
    // Remove all existing React imports
    reactImports.forEach(imp => {
      content = content.replace(imp.fullMatch, '');
    });
    
    // Add standardized import based on configuration
    let newImport;
    if (CONFIG.importStyle === 'option-a') {
      // Option A: Namespace import
      newImport = 'import * as React from "react";';
    } else {
      // Option B: Default import with named imports
      const namedImportsArray = Array.from(allNamedImports);
      const namedImportsPart = namedImportsArray.length > 0 ? 
        `, { ${namedImportsArray.join(', ')} }` : '';
      newImport = `import React${namedImportsPart} from "react";`;
    }
    
    // Add the new import at the top of the file
    content = newImport + '\n' + content;
    
    // Clean up multiple blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Only write if content has changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return { processed: true, changes: 'Standardized React imports' };
    }
    
    return { processed: false, reason: 'No changes needed' };
  } catch (error) {
    return { processed: false, error: error.message };
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  console.log(`Searching for files in ${srcDir}...`);
  
  const files = findFiles(srcDir);
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