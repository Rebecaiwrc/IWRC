const fs = require('fs');
const path = require('path');

const png512 = fs.readFileSync(path.join(__dirname, '..', 'public', 'icon-512.png'));
const base64 = png512.toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64}" width="512" height="512" />
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgContent);
console.log('favicon.svg updated with authentic high-res iWrc emblem!');
