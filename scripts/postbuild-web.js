// Injects Vercel Web Analytics into the static web export (runs via `npm run build:web`).
// Vercel-only by owner preference: the insights script 404s on other hosts (e.g. the
// GitHub Pages mirror), so injection is skipped off-Vercel.
const fs = require("fs");

const file = "dist/index.html";
const html = fs.readFileSync(file, "utf8");

if (!process.env.VERCEL) {
  console.log("postbuild-web: not a Vercel build, skipping analytics injection");
  process.exit(0);
}
if (!html.includes("/_vercel/insights/script.js")) {
  fs.writeFileSync(file, html.replace("</body>", '<script defer src="/_vercel/insights/script.js"></script></body>'));
  console.log("postbuild-web: Vercel Web Analytics injected");
} else {
  console.log("postbuild-web: analytics script already present");
}
