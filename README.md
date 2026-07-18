# LawCosmosAI

**আইন জানুন। খরচ জানুন। আইনজীবী নিন।** · Know the law. Know the cost. Get a lawyer.

Bangla-first legal information app for Bangladesh. Ask a question → see the applicable law + section, a legal/illegal verdict, the exact penalty, and what to do next — every answer quoted **verbatim** from a versioned, human-cited law corpus. Unknown questions get an honest "cannot verify" and one-tap lawyer escalation; the app never guesses. One Expo codebase → **Android app + web app**.

> ⚠️ **Legal information, not legal advice.** Consult a lawyer before important decisions.

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

**Android (EAS Build, free tier):**

```bash
npx eas-cli login                              # free Expo account
npx eas-cli build -p android --profile production   # produces an installable APK
```

Distribute the APK directly (link/QR) for the soft launch; Play Store submission can come later.

## Architecture

Answers come verbatim from [src/corpus.ts](src/corpus.ts) via deterministic retrieval in [src/engine.ts](src/engine.ts). `ask()` / `analyzeImage()` / `analyzePdf()` are the seams for a future RAG/OCR backend. State: zustand + AsyncStorage ([src/store.ts](src/store.ts)). UI: design-token kit in [src/ui.tsx](src/ui.tsx) (navy/gold "Trust & Authority" system).

## Launch status (phase 1)

| Area | Status |
|---|---|
| Legal Q&A from cited corpus | ✅ Live — entries marked `PENDING-HUMAN` show a "verification pending" chip until human-verified against [bdlaws.minlaw.gov.bd](http://bdlaws.minlaw.gov.bd) |
| Photo / PDF analysis | 🧪 Offline demo cache (labeled in-app) — real OCR backend is phase 2 |
| Lawyer directory & booking | 🧪 Demo data (labeled in-app) — real lawyer onboarding is phase 2 |
| bKash payment | 🧪 Sandbox only (labeled in-app) — no real money moves |

## Contact

Found a wrong answer? Email **tariqbin004@gmail.com** — corpus corrections are the highest-priority issue type.

## License

See [LICENSE](LICENSE).
