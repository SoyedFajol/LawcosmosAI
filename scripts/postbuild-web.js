// Injects Vercel Web Analytics into the static web export.
// Runs ONLY on Vercel builds (the insights script 404s on other hosts, e.g. GitHub Pages).
const fs = require("fs");

if (!process.env.VERCEL) {
  console.log("postbuild-web: not a Vercel build, skipping analytics injection");
  process.exit(0);
}

const file = "dist/index.html";
const html = fs.readFileSync(file, "utf8");
if (!html.includes("/_vercel/insights/script.js")) {
  fs.writeFileSync(file, html.replace("</body>", '<script defer src="/_vercel/insights/script.js"></script></body>'));
  console.log("postbuild-web: Vercel Web Analytics script injected");
} else {
  console.log("postbuild-web: analytics script already present");
}
