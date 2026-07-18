// Brand asset generator — renders the LawCosmosAI mark into every app icon Expo needs.
// Rerun after editing the mark: node scripts/gen-icons.js
// Mark: "Constellation of Justice" — the scales drawn as a constellation: a pivot star
// with two pan stars of unequal weight. Law (balance) + Cosmos (stars) + AI (geometry).
// Identity: Bangladesh bottle green field, courtroom-brass mark. Deliberately NOT the
// cream/terracotta/serif or black/white looks of existing AI products.
const sharp = require("sharp");

const GREEN_DEEP = "#0B4A38"; // icon field
const GREEN = "#0F5D44"; // primary
const BRASS = "#D9A13B"; // mark on green
const MIST = "#F4F7F3"; // app background

const mark = (color) => `
  <g fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round">
    <line x1="50" y1="30" x2="28" y2="62"/>
    <line x1="50" y1="30" x2="72" y2="62"/>
    <circle cx="50" cy="30" r="6" fill="${color}" stroke="none"/>
    <circle cx="28" cy="62" r="8" fill="${color}" stroke="none"/>
    <circle cx="72" cy="62" r="5" fill="${color}" stroke="none"/>
  </g>`;

const svg = (size, inner) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`);

// scale%: how much of the canvas the 100-unit mark occupies (centered)
const placed = (color, scalePct) => {
  const s = scalePct / 100;
  const off = (100 - 100 * s) / 2;
  return `<g transform="translate(${off} ${off}) scale(${s})">${mark(color)}</g>`;
};

const jobs = [
  // App icon: full-bleed deep-green square, brass mark (OS applies its own corner mask)
  ["assets/icon.png", 1024, `<rect width="100" height="100" fill="${GREEN_DEEP}"/>${placed(BRASS, 78)}`],
  // Android adaptive: fg/monochrome inside the ~66% safe zone, solid deep-green bg
  ["assets/android-icon-foreground.png", 1024, placed(BRASS, 52)],
  ["assets/android-icon-monochrome.png", 1024, placed("#FFFFFF", 52)],
  ["assets/android-icon-background.png", 1024, `<rect width="100" height="100" fill="${GREEN_DEEP}"/>`],
  // Favicon: rounded deep-green tile so it reads on any tab color
  ["assets/favicon.png", 64, `<rect width="100" height="100" rx="22" fill="${GREEN_DEEP}"/>${placed(BRASS, 84)}`],
  // Splash: green mark on transparent (splash background color comes from app.json = mist)
  ["assets/splash-icon.png", 512, placed(GREEN, 96)],
  // In-app header mark: green on transparent
  ["assets/logo-mark.png", 256, placed(GREEN, 100)],
];

(async () => {
  for (const [file, size, inner] of jobs) {
    await sharp(svg(size, inner)).png().toFile(file);
    console.log(`ok ${file} (${size}px)`);
  }
  console.log(`palette: green ${GREEN} / brass ${BRASS} on mist ${MIST}`);
})();
