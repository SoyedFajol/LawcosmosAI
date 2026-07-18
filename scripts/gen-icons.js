// Brand asset generator — renders the LawCosmosAI mark ("Orbital Balance") into every
// app icon Expo needs. Rerun after editing the mark: node scripts/gen-icons.js
// Mark: one orbit ring + two bodies in equilibrium — law (balance) + cosmos (orbit), minimal AI geometry.
const sharp = require("sharp");

const EMBER = "#C65D3B";
const PAPER = "#FAF9F5";

// viewBox 0 0 100 100; dots sit on the ring at 220° / 40° (heavy low-left, light high-right)
const mark = (color) => `
  <g fill="none">
    <circle cx="50" cy="50" r="30" stroke="${color}" stroke-width="4.5"/>
    <circle cx="27.02" cy="69.28" r="7.5" fill="${color}"/>
    <circle cx="72.98" cy="30.72" r="4.5" fill="${color}"/>
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
  // App icon: full-bleed ember square, white mark (OS applies its own corner mask)
  ["assets/icon.png", 1024, `<rect width="100" height="100" fill="${EMBER}"/>${placed("#FFFFFF", 66)}`],
  // Android adaptive: fg/monochrome inside the ~66% safe zone, solid ember bg
  ["assets/android-icon-foreground.png", 1024, placed("#FFFFFF", 46)],
  ["assets/android-icon-monochrome.png", 1024, placed("#FFFFFF", 46)],
  ["assets/android-icon-background.png", 1024, `<rect width="100" height="100" fill="${EMBER}"/>`],
  // Favicon: rounded ember tile so it reads on any tab color
  ["assets/favicon.png", 64, `<rect width="100" height="100" rx="22" fill="${EMBER}"/>${placed("#FFFFFF", 70)}`],
  // Splash: ember mark on transparent (splash background color comes from app.json = paper)
  ["assets/splash-icon.png", 512, placed(EMBER, 90)],
  // In-app header mark: ember on transparent
  ["assets/logo-mark.png", 256, placed(EMBER, 100)],
];

(async () => {
  for (const [file, size, inner] of jobs) {
    await sharp(svg(size, inner)).png().toFile(file);
    console.log(`ok ${file} (${size}px)`);
  }
  console.log(`palette: ember ${EMBER} on paper ${PAPER}`);
})();
