import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA icons...');
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  // maskable 512x512: center 400x400 within 512x512 padded canvas with #FFF9F5 background
  const innerResized = await sharp(svgBuffer)
    .resize(410, 410)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 249, b: 245, alpha: 1 },
    },
  })
    .composite([{ input: innerResized, top: 51, left: 51 }])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  console.log('PWA icons generated successfully.');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
