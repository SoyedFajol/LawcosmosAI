// Answer engine. Pure TS — no React Native imports, so scripts/check.ts can run it in node.
//
// ARCHITECTURE SEAM: ask() / analyzeImage() / analyzePdf() are the swap points.
// Today: deterministic keyword retrieval over the local corpus (zero hallucination
// by construction, works offline — this IS the F2 offline demo layer).
// Later: point these at /api/ask (RAG + constrained LLM) without touching screens.
// ponytail: keyword retrieval, swap for vector RAG when a server + corpus embeddings exist.

import { CORPUS, CorpusEntry, CORPUS_VERSION } from "./corpus";

export interface Answer {
  query: string;
  source: "text" | "photo" | "pdf";
  entry: CorpusEntry | null; // null => cannot-verify -> lawyer escalation
  demoNote: boolean; // true when produced by the offline demo analyzer (photo/pdf)
  corpusVersion: string;
  ts: number;
}

export const MAX_QUERY_LEN = 500; // abuse cap (A7)

export function retrieveLaw(query: string): CorpusEntry | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  let best: CorpusEntry | null = null;
  let bestScore = 0;
  for (const entry of CORPUS) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.includes(" ") ? 2 : 1; // multi-word match = stronger signal
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore >= 1 ? best : null; // no match => honest "cannot verify", never guess
}

export function ask(query: string, now: number): Answer {
  const trimmed = query.slice(0, MAX_QUERY_LEN);
  return {
    query: trimmed,
    source: "text",
    entry: retrieveLaw(trimmed),
    demoNote: false,
    corpusVersion: CORPUS_VERSION,
    ts: now,
  };
}

// Offline demo analyzers (F2). Honest labeling: every result carries demoNote=true and
// the UI shows "ডেমো বিশ্লেষণ (অফলাইন ক্যাশ)". Filename hints route to the cached demo
// answer; anything unrecognized takes the graceful "couldn't read this" path (A5).
const PHOTO_DEMO_ROUTES: Array<{ hints: string[]; entryId: string }> = [
  { hints: ["helmet", "bike", "rider", "moto"], entryId: "tr-helmet" },
  { hints: ["deed", "dolil", "land"], entryId: "la-forgery" },
];

function demoAnalyze(fileName: string, source: "photo" | "pdf", now: number): Answer {
  const name = fileName.toLowerCase();
  const route = PHOTO_DEMO_ROUTES.find((r) => r.hints.some((h) => name.includes(h)));
  return {
    query: fileName,
    source,
    entry: route ? CORPUS.find((e) => e.id === route.entryId) ?? null : null,
    demoNote: true,
    corpusVersion: CORPUS_VERSION,
    ts: now,
  };
}

export function analyzeImage(fileName: string, now: number): Answer {
  return demoAnalyze(fileName, "photo", now);
}

export function analyzePdf(fileName: string, now: number): Answer {
  return demoAnalyze(fileName, "pdf", now);
}
