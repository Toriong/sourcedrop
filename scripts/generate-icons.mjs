import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRADIENT_START = { r: 209, g: 127, b: 247 };
const GRADIENT_END = { r: 157, g: 214, b: 252 };

async function createIcon(size) {
  console.log(`Creating ${size}x${size} icon...`);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${GRADIENT_START.r},${GRADIENT_START.g},${GRADIENT_START.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${GRADIENT_END.r},${GRADIENT_END.g},${GRADIENT_END.b});stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size/10}"/>
      <text 
        x="50%" 
        y="50%" 
        font-size="${size/2.5}" 
        text-anchor="middle" 
        dominant-baseline="central" 
        fill="white" 
        font-family="Arial, sans-serif" 
        font-weight="bold"
      >SD</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icons', `icon${size}.png`));
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, '..', 'branding', `icon${size}.png`));
}

async function generateAllIcons() {
  const sizes = [16, 32, 48, 128, 512];
  
  const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
  const brandingDir = path.join(__dirname, '..', 'branding');
  
  if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
  }
  if (!fs.existsSync(brandingDir)) {
    fs.mkdirSync(brandingDir, { recursive: true });
  }
  
  console.log('Generating SourceDrop icons...');
  
  for (const size of sizes) {
    await createIcon(size);
  }
  
  console.log('✓ All icons generated!');
}

generateAllIcons().catch(console.error);
