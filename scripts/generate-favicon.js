// Script to generate favicon.ico from SVG
// Run: node scripts/generate-favicon.js
// Requires: sharp package (npm install sharp --save-dev)

const fs = require('fs');
const path = require('path');

console.log('To generate favicon.ico:');
console.log('1. Install sharp: npm install sharp --save-dev');
console.log('2. Or use online tool: https://favicon.io/favicon-converter/');
console.log('3. Upload public/favicon.svg and download favicon.ico');
console.log('4. Place favicon.ico in the public/ folder');

// Check if sharp is available
try {
  const sharp = require('sharp');
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const icoPath = path.join(__dirname, '../public/favicon.ico');
  
  if (fs.existsSync(svgPath)) {
    console.log('\nGenerating favicon.ico from SVG...');
    sharp(svgPath)
      .resize(32, 32)
      .toFile(icoPath)
      .then(() => {
        console.log('✓ favicon.ico generated successfully!');
      })
      .catch((err) => {
        console.error('Error generating favicon:', err);
        console.log('\nPlease use an online converter instead.');
      });
  } else {
    console.log('favicon.svg not found!');
  }
} catch (e) {
  console.log('\nSharp not installed. Please use an online converter:');
  console.log('https://favicon.io/favicon-converter/');
}
