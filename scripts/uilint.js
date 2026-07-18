// UI grid lint — enforces the design system documented in src/ui.tsx:
//   spacing (padding/margin/gap) on the 4pt grid (|2| allowed as an optical nudge)
//   fontSize in the type scale, lineHeight on the 4pt grid, borderRadius in the radius scale
// Runs in CI via `npm run check`. Fails loudly with file:line for every off-system value.
const fs = require("fs");
const path = require("path");

const TYPE_SCALE = new Set([12, 14, 16, 18, 20, 24, 28, 32, 40]);
const RADII = new Set([4, 8, 12, 16, 24, 999]);
const SPACING = /^(padding|margin)(Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?$|^(gap|rowGap|columnGap)$/;
const onGrid = (v) => v % 4 === 0 || Math.abs(v) === 2;

const errors = [];
function scan(file) {
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const m of line.matchAll(/(\w+):\s*(-?\d+(?:\.\d+)?)(?![.\w])/g)) {
        const prop = m[1];
        const v = parseFloat(m[2]);
        const loc = `${path.relative(".", file).replace(/\\/g, "/")}:${i + 1}`;
        if (SPACING.test(prop) && !onGrid(v)) errors.push(`${loc}  ${prop}: ${m[2]} — off the 4pt grid`);
        else if (prop === "fontSize" && !TYPE_SCALE.has(v)) errors.push(`${loc}  fontSize: ${m[2]} — not in type scale [${[...TYPE_SCALE]}]`);
        else if (prop === "lineHeight" && !onGrid(v)) errors.push(`${loc}  lineHeight: ${m[2]} — off the 4pt grid`);
        else if (prop === "borderRadius" && !RADII.has(v)) errors.push(`${loc}  borderRadius: ${m[2]} — not in radius scale [${[...RADII]}]`);
      }
    });
}

for (const f of fs.readdirSync("src/screens")) scan(path.join("src/screens", f));
scan(path.join("src", "ui.tsx"));
scan("App.tsx");

if (errors.length) {
  console.error(`UI GRID LINT: ${errors.length} value(s) off-system\n` + errors.join("\n"));
  process.exit(1);
}
console.log("ui grid lint: all spacing, type, and radius values on system");
