
const fs = require('fs');
const path = require('path');

function fixGradleFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/VERSION_21/g, 'VERSION_17');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix Capacitor Android Gradle files
const capacitorGradlePath = path.join(__dirname, '../node_modules/@capacitor/android/capacitor/build.gradle');
const capacitorAppGradlePath = path.join(__dirname, '../node_modules/@capacitor/app/android/build.gradle');

fixGradleFile(capacitorGradlePath);
fixGradleFile(capacitorAppGradlePath);

console.log('Capacitor Gradle files fixed successfully');
