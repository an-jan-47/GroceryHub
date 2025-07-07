import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Source and destination directories
const sourceDir = './dist';
const targetDir = './android/app/src/main/assets';

// Clean the target directory if it exists
if (existsSync(targetDir)) {
  console.log('🧹 Cleaning Android assets directory...');
  rmSync(targetDir, { recursive: true, force: true });
}

// Ensure the target directory exists
mkdirSync(targetDir, { recursive: true });

// Copy and fix index.html
let indexHtml = readFileSync(join(sourceDir, 'index.html'), 'utf8');
// Fix asset paths to work in Android WebView (remove leading slash)
indexHtml = indexHtml.replace(/src=\"\//g, 'src="');
indexHtml = indexHtml.replace(/href=\"\//g, 'href="');
writeFileSync(join(targetDir, 'index.html'), indexHtml);
console.log('✅ index.html copied and fixed for Android assets');

// Create assets directory in the target if it doesn't exist
const assetsTargetDir = join(targetDir, 'assets');
mkdirSync(assetsTargetDir, { recursive: true });

// Copy all files from dist/assets to android assets
const assetsSourceDir = join(sourceDir, 'assets');
if (existsSync(assetsSourceDir)) {
  const files = readdirSync(assetsSourceDir);
  
  files.forEach(file => {
    const sourcePath = join(assetsSourceDir, file);
    const targetPath = join(assetsTargetDir, file);
    
    if (statSync(sourcePath).isFile()) {
      copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${file} copied to Android assets`);
    }
  });
}

// Copy other necessary files from dist root
const rootFiles = ['favicon.ico', 'manifest.json', 'service-worker.js'];
rootFiles.forEach(file => {
  const sourcePath = join(sourceDir, file);
  const targetPath = join(targetDir, file);
  
  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, targetPath);
    console.log(`✅ ${file} copied to Android assets`);
  }
});

console.log('✅ All assets copied successfully');