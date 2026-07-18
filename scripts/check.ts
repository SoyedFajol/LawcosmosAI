// GROUNDEDNESS + REFUSAL CHECK (gates A1–A3, A5 logic paths). Run: npm run check
// Fails loudly if: any corpus entry is malformed, retrieval misroutes a domain keyword,
// an out-of-corpus question gets an answer instead of honest refusal, or demo flows break.
import { CORPUS } from "../src/corpus";
import { ask, analyzeImage, analyzePdf, retrieveLaw, MAX_QUERY_LEN } from "../src/engine";

function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg ?? "assertion failed");
}
assert.equal = (a: unknown, b: unknown, msg?: string) =>
  assert(a === b, `${msg ?? "equal"}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);

const NOW = 0;
let n = 0;
const pass = (msg: string) => console.log(`  ok ${++n}: ${msg}`);

// 1. Corpus schema integrity (D11): every entry fully cited, bilingual, versioned.
for (const e of CORPUS) {
  for (const f of ["act_bn", "act_en", "section", "offense_bn", "offense_en", "penalty_bn", "penalty_en", "next_bn", "next_en", "source", "effective_date", "last_verified"] as const) {
    assert(e[f] && e[f].length > 0, `corpus ${e.id}: missing ${f}`);
  }
  assert(e.keywords.length > 0, `corpus ${e.id}: no keywords`);
}
pass(`corpus schema: ${CORPUS.length} entries, all cited + bilingual`);

// 2. Demo 1 — Bangla text: "যৌতুক চাওয়া কি অপরাধ?" -> Dowry Prohibition Act s.3, exact penalty.
{
  const a = ask("যৌতুক চাওয়া কি অপরাধ?", NOW);
  assert.equal(a.entry?.id, "fa-dowry-demand");
  assert.equal(a.entry?.verdict, "illegal");
  assert(a.entry!.penalty_bn.includes("৫০,০০০") && a.entry!.penalty_bn.includes("৫ বছর"), "dowry penalty must match corpus figures");
  pass("demo 1: dowry question -> Dowry Prohibition Act 2018 s.3, illegal, exact penalty");
}

// 3. Demo 2 — photo: helmet-less rider -> Road Transport Act 2018.
{
  const a = analyzeImage("helmet-rider.jpg", NOW);
  assert.equal(a.entry?.id, "tr-helmet");
  assert(a.demoNote, "photo answers must be labeled demo analysis");
  pass("demo 2: helmet photo -> Road Transport Act 2018 s.92(1), demo-labeled");
}

// 4. Groundedness sweep: each entry's primary keyword routes back to that exact entry.
for (const e of CORPUS) {
  const a = retrieveLaw(e.keywords[0]);
  assert.equal(a?.id, e.id, `keyword "${e.keywords[0]}" routed to ${a?.id}, expected ${e.id}`);
}
pass(`groundedness: ${CORPUS.length}/${CORPUS.length} primary keywords route to their own entry`);

// 5. Disambiguation: demand vs give dowry.
assert.equal(retrieveLaw("যৌতুক নেওয়া কি বৈধ?")?.id, "fa-dowry-give");
assert.equal(retrieveLaw("is demanding dowry a crime")?.id, "fa-dowry-demand");
pass("disambiguation: dowry demand vs give");

// 6. Honest refusal (A3): out-of-corpus questions return null — the app never guesses.
const OUT_OF_CORPUS = [
  "আয়কর কত দিতে হবে?", // tax
  "what is the punishment for hacking", // cyber (not in corpus)
  "আমার জ্বর হয়েছে কী করব", // medical
  "can I get a US visa", // foreign law
  "চুরি করলে কি শাস্তি", // theft (not in corpus yet)
];
for (const q of OUT_OF_CORPUS) {
  assert.equal(ask(q, NOW).entry, null, `must refuse: "${q}"`);
}
pass(`honest refusal: ${OUT_OF_CORPUS.length}/${OUT_OF_CORPUS.length} out-of-corpus questions -> cannot-verify`);

// 7. Non-legal / unreadable uploads (A5): graceful null, still demo-labeled, no crash.
assert.equal(analyzeImage("cat.jpg", NOW).entry, null);
assert.equal(analyzePdf("random-notes.pdf", NOW).entry, null);
pass("uploads: non-legal image + unknown pdf -> graceful couldn't-read path");

// 8. Abuse cap (A7): input truncated to MAX_QUERY_LEN.
assert(ask("ক".repeat(9999), NOW).query.length <= MAX_QUERY_LEN);
pass(`abuse cap: query truncated to ${MAX_QUERY_LEN} chars`);

// 9. Empty input never answers.
assert.equal(retrieveLaw("   "), null);
pass("empty input -> no answer");

// 10. Home-screen example chips (i18n ex1-ex3, both languages) must never dead-end.
const CHIP_QUESTIONS = [
  "যৌতুক চাওয়া কি অপরাধ?",
  "হেলমেট ছাড়া বাইক চালালে কী হয়?",
  "তালাকের নিয়ম কী?",
  "Is demanding dowry a crime?",
  "Riding without a helmet — what happens?",
  "What are the rules for divorce?",
];
for (const q of CHIP_QUESTIONS) {
  assert(ask(q, NOW).entry != null, `example chip must resolve: "${q}"`);
}
pass(`example chips: ${CHIP_QUESTIONS.length}/${CHIP_QUESTIONS.length} resolve to corpus entries`);

console.log(`\nALL CHECKS PASSED (${n} groups)`);
