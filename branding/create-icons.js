// Simple script to create placeholder icons
const fs = require('fs');
const path = require('path');

// Create public/icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG icon (will be used as placeholder)
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(209,127,247);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(157,214,252);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size/8}"/>
  <text x="50%" y="50%" font-size="${size/2}" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">SD</text>
</svg>
`;

// Write SVG files
[16, 32, 48, 128].forEach(size => {
  fs.writeFileSync(
    path.join(iconsDir, `icon${size}.svg`),
    createIconSVG(size)
  );
});

console.log('Placeholder icons created!');
