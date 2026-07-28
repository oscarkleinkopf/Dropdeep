/**
 * Generates optimized PWA icons from an inline SVG (no external deps).
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1020"/>
      <stop offset="100%" stop-color="#070a13"/>
    </linearGradient>
    <linearGradient id="cyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="pink" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="url(#cyan)" stroke-width="3" opacity="0.35"/>
  <g filter="url(#glow)" transform="translate(256 230)">
    <path d="M0-120 L88-72 V16 C88 72 44 108 0 128 C-44 108 -88 72 -88 16 V-72 Z" fill="none" stroke="url(#cyan)" stroke-width="14" stroke-linejoin="round"/>
    <path d="M0-72 L52-44 V12 C52 44 26 64 0 76 C-26 64 -52 44 -52 12 V-44 Z" fill="rgba(6,182,212,0.12)" stroke="url(#pink)" stroke-width="6"/>
    <path d="M0-36 L0 20 M0 36 L0 44" stroke="url(#pink)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="0" cy="-8" r="6" fill="#f472b6"/>
  </g>
  <text x="256" y="410" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="url(#cyan)" letter-spacing="6">DROP</text>
  <text x="256" y="458" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="url(#pink)" letter-spacing="6">DEEP</text>
</svg>`;

const sizes = [192, 512];

for (const size of sizes) {
  const buffer = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toBuffer();

  const outPath = join(publicDir, `icon-${size}.png`);
  writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}
