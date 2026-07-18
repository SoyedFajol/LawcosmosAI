# LawCosmosAI

**আইন জানুন। খরচ জানুন। আইনজীবী নিন।** · Know the law. Know the cost. Get a lawyer.

Built by **The Mavericks**.

Bangla-first legal information app for Bangladesh. Ask a question → see the applicable law + section, a legal/illegal verdict, the exact penalty, and what to do next — every answer quoted **verbatim** from a versioned, human-cited law corpus. Unknown questions get an honest "cannot verify" and one-tap lawyer escalation; the app never guesses. One Expo codebase → **Android app + web app**.

> ⚠️ **Legal information, not legal advice.** Consult a lawyer before important decisions.

## Live

- 🌐 **Web:** https://lawcosmosai.vercel.app (primary, with visitor analytics) · mirror: https://soyedfajol.github.io/LawcosmosAI/ (GitHub Pages)
- 📱 **Android APK:** https://github.com/SoyedFajol/LawcosmosAI/releases/latest — download `LawCosmosAI.apk` and install directly (soft-launch channel; Play Store is phase 2) ![APK downloads](https://img.shields.io/github/downloads/SoyedFajol/LawcosmosAI/total?label=APK%20downloads)

### Visitor analytics (free, anonymous)

- **Web — Vercel Web Analytics** (cookieless, injected at build time on Vercel only): dashboard at [vercel.com/relbais-projects/lawcosmosai/analytics](https://vercel.com/relbais-projects/lawcosmosai/analytics). The GitHub Pages mirror is not tracked.
- **Android**: the badge above counts APK downloads via GitHub — no in-app tracking; the mobile app stays analytics-free as promised in the privacy note.
- **Deploying to Vercel**: `npx vercel deploy --prod` (or connect the repo in the Vercel dashboard for auto-deploys on push; Pages auto-deploys already).

## Features

- 🔍 Ask in Bangla or English — deterministic retrieval over a cited corpus (zero hallucination by construction)
- ⚖️ Verdict card: applicable act + section, penalty, next steps, source + last-verified date
- 🌐 Bangla-first bilingual UI with persistent language toggle
- 📱 On-device only: no server, no API keys, no analytics — history stays in local storage
- ♿ Reduce-motion aware animations, 48pt touch targets, screen-reader labels

## Run locally

```bash
npm install
npx expo start        # scan QR with Expo Go (Android) — press "w" for web
npm run check         # groundedness + refusal test suite
npm run typecheck     # tsc strict
npm run build:web     # static web build -> dist/
```

## Deploy

**Web (GitHub Pages, free):** pushing to `main` runs [.github/workflows/deploy-web.yml](.github/workflows/deploy-web.yml) — typecheck + test suite + static export, then deploys to `https://<user>.github.io/<repo>/`. No secrets required.

**Android APK (GitHub Actions, free):** pushing a `v*` tag runs [.github/workflows/build-android.yml](.github/workflows/build-android.yml) — it builds a release APK and attaches it to a GitHub Release. No accounts or secrets needed. (EAS Build profiles in [eas.json](eas.json) remain as an alternative: `npx eas-cli build -p android --profile production`.)

**Vercel (free, with visitor analytics):** import the repo at [vercel.com/new](https://vercel.com/new) → framework preset **Other** (build/output come from [vercel.json](vercel.json)) → after the first deploy, open the project's **Analytics** tab and click **Enable**. The build injects the analytics script automatically on Vercel only; visitors are counted anonymously (no cookies), and the mobile app stays analytics-free — as disclosed in the in-app privacy note.

## Architecture

Answers come verbatim from [src/corpus.ts](src/corpus.ts) via deterministic retrieval in [src/engine.ts](src/engine.ts). When the corpus can't answer, users may opt in per-question to **Ask AI (beta)**: [api/ask.js](api/ask.js) (Vercel serverless) calls Google Gemini free tier with a server-enforced Bangladesh-law-only scope — the key stays server-side; enable with `npx vercel env add GEMINI_API_KEY production` (free key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). See [SKILLS.md](SKILLS.md) for the full build/maintenance guide. State: zustand + AsyncStorage ([src/store.ts](src/store.ts)). UI: design-token kit in [src/ui.tsx](src/ui.tsx) — the "Constellation" identity: Bangladesh bottle green + courtroom brass on green mist, with the constellation-scales mark (regenerate icons via `node scripts/gen-icons.js`).

## Launch status (phase 1)

| Area | Status |
|---|---|
| Legal Q&A from cited corpus | ✅ Live — entries marked `PENDING-HUMAN` show a "verification pending" chip until human-verified against [bdlaws.minlaw.gov.bd](http://bdlaws.minlaw.gov.bd) |
| AI fallback answers (Gemini) | 🧪 Beta — opt-in per question, labeled unverified, activates once `GEMINI_API_KEY` is set on Vercel |
| Photo / PDF analysis | 🧪 Offline demo cache (labeled in-app) — real OCR backend is phase 2 |
| Lawyer directory & booking | 🧪 Demo data (labeled in-app) — real lawyer onboarding is phase 2 |
| bKash payment | 🧪 Sandbox only (labeled in-app) — no real money moves |

## Contact

**The Mavericks** · Found a wrong answer? Email **soyedsf@gmail.com** — corpus corrections are the highest-priority issue type.

## License

See [LICENSE](LICENSE).
