# SKILLS.md — how LawCosmosAI is built and maintained

Company: **The Mavericks** · Contact: soyedsf@gmail.com

## Where answers come from

1. **Verified corpus (primary, on-device)** — [src/corpus.ts](src/corpus.ts) holds hand-curated
   Bangladeshi law entries: act + section, penalty, next steps, bilingual, with source and
   last-verified date. [src/engine.ts](src/engine.ts) retrieves them deterministically by
   keyword — answers are quoted **verbatim**, so this path cannot hallucinate. Out-of-corpus
   questions get an honest "cannot verify".
2. **AI fallback (beta, opt-in)** — only when the corpus misses AND the user taps
   "Ask AI (beta)", the question goes to [api/ask.js](api/ask.js), a Vercel serverless
   function calling **Google Gemini (free tier)**. The Bangladesh-law-only scope, the
   no-invented-citations rule, and rate limiting are enforced **server-side**; the API key
   never ships in the app. Answers are labeled unverified in the UI.

   **Enable it (one time):** get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey),
   then `npx vercel env add GEMINI_API_KEY production` and `npx vercel deploy --prod`.
   Until then the button reports "AI unavailable" gracefully.

## Design system ("Constellation")

- Identity: Bangladesh bottle green `#0F5D44` + courtroom brass `#D9A13B` on green mist
  `#F4F7F3`; constellation-scales logo. Tokens live in [src/ui.tsx](src/ui.tsx)
  (`C` colors, `F` type scale, `R` radius scale, `ICON` sizes).
- **4pt/8pt grid is enforced**: [scripts/uilint.js](scripts/uilint.js) fails CI on any
  off-grid spacing, off-scale fontSize/lineHeight, or off-scale borderRadius.
- Regenerate every icon/splash/logo asset after editing the mark:
  `node scripts/gen-icons.js` ([scripts/gen-icons.js](scripts/gen-icons.js)).
- Interactive minimums: touch targets ≥44px, press scale feedback, entrance animations
  respect OS reduce-motion.

## Claude skills used to build this (installed under `~/.claude/skills/`)

| Skill / resource | Used for |
|---|---|
| `ui-ux-pro-max` | Design-system generation, UX rule audits (grid, touch, contrast) |
| `logo-generator` (op7418) | Logo workflow: 6 SVG variants → chosen mark → asset export |
| `ai-design-components` (ancoleman) | 76-skill collection; registered: providing-feedback, guiding-users, building-forms, designing-layouts, theming-components |
| `ant-design` design spec (sparse clone) | Feedback patterns: confirm-before-destructive, actionable empty states, share affordances |

## Quality gates (all run in CI on every push)

```bash
npm run typecheck   # tsc strict
npm run check       # groundedness + refusal suite (10 groups) + UI grid lint
```

## Deploys

| Target | How |
|---|---|
| Web (primary) | https://lawcosmosai.vercel.app — `npx vercel deploy --prod` |
| Web (mirror) | GitHub Pages, auto on push to `main` |
| Android APK | auto on `v*` tag → GitHub Release (`releases/latest`) |
| Analytics | Vercel Web Analytics (anonymous, cookieless) — [dashboard](https://vercel.com/relbais-projects/lawcosmosai/analytics) |
