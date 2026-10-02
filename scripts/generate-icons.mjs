import sharp from "sharp";
import fs from "fs";
import path from "path";

const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#09090B"/>
  <path d="M164 112V348C164 363 176 375 191 375H288" stroke="white" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M288 112H368" stroke="white" stroke-width="40" stroke-linecap="round"/>
  <path d="M288 194H336" stroke="white" stroke-width="40" stroke-linecap="round"/>
  <path d="M288 276H368" stroke="white" stroke-width="40" stroke-linecap="round"/>
  <circle cx="416" cy="416" r="40" fill="#10B981"/>
</svg>
`;

const ICON_MASKABLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#09090B"/>
  <rect x="128" y="128" width="256" height="256" rx="40" fill="#09090B"/>
  <path d="M192 176V320C192 328 198 334 206 334H262" stroke="white" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M262 176H328" stroke="white" stroke-width="32" stroke-linecap="round"/>
  <path d="M262 230H300" stroke="white" stroke-width="32" stroke-linecap="round"/>
  <path d="M262 284H328" stroke="white" stroke-width="32" stroke-linecap="round"/>
  <circle cx="352" cy="352" r="24" fill="#10B981"/>
</svg>
`;

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const icons = [
  { svg: ICON_SVG, size: 192, name: "icon-192.png" },
  { svg: ICON_SVG, size: 512, name: "icon-512.png" },
  { svg: ICON_SVG, size: 180, name: "apple-touch-icon.png" },
  { svg: ICON_SVG, size: 32, name: "favicon-32.png" },
  { svg: ICON_SVG, size: 16, name: "favicon-16.png" },
  { svg: ICON_MASKABLE_SVG, size: 512, name: "icon-maskable-512.png" },
];

async function main() {
  for (const icon of icons) {
    const svgBuffer = Buffer.from(icon.svg);
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(ICONS_DIR, icon.name));
    console.log(`✅ Generated ${icon.name}`);
  }
  console.log("\n🎉 All icons generated!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});