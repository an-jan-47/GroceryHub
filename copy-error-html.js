import { existsSync, mkdirSync } from 'fs';

// Ensure the public directory exists in dist
const targetDir = './dist/public';
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

// No longer copying error.html
console.log('✅ Skipping error.html copy');