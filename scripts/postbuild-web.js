// Injects visitor analytics into the static web export (runs via `npm run build:web`).
// - GoatCounter: always injected — free, cookieless, anonymous. Counts start once the
//   site code "lawcosmos" is claimed at goatcounter.com; until then requests fail silently.
//   Dashboard: https://lawcosmos.goatcounter.com
// - Vercel Web Analytics: injected only on Vercel builds (the script 404s elsewhere).
const fs = require("fs");

const file = "dist/index.html";
let html = fs.readFileSync(file, "utf8");

const GOAT =
  '<script data-goatcounter="https://lawcosmos.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>';
if (!html.includes("goatcounter")) {
  html = html.replace("</body>", `${GOAT}</body>`);
  console.log("postbuild-web: GoatCounter injected");
}

if (process.env.VERCEL && !html.includes("/_vercel/insights/script.js")) {
  html = html.replace("</body>", '<script defer src="/_vercel/insights/script.js"></script></body>');
  console.log("postbuild-web: Vercel Web Analytics injected");
}

fs.writeFileSync(file, html);
