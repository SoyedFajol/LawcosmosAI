// AI fallback endpoint (Vercel serverless). Called only when the verified corpus
// can't answer AND the user explicitly taps "Ask AI (beta)".
// - GEMINI_API_KEY lives only in Vercel env — never in the client bundle.
// - Topic lock is enforced HERE (server-side), so clients can't bypass it.
// - Until the key is configured, returns 503 and the app shows "AI unavailable".
const SYSTEM = `You are the AI assistant inside LawCosmosAI, a legal information app for Bangladesh, built by The Mavericks.
STRICT SCOPE: you only answer questions about the law of Bangladesh — acts, offences, penalties, procedures, and legal rights. If the question is about anything else (other countries' law, medical, technology, homework, personal advice, general chat), refuse in ONE short sentence in the user's language and suggest asking a Bangladeshi legal question instead.
RULES:
- Answer in the requested language (Bangla or English), plainly, for ordinary citizens.
- Be concise: at most ~180 words.
- Cite the relevant Act and section when you are confident of it. NEVER invent citations, section numbers, or penalty figures — if unsure, say you are unsure and recommend a lawyer.
- Always end with one line stating this is AI-generated legal information, not legal advice, and a lawyer should be consulted for important decisions.`;

// ponytail: best-effort per-instance rate limit; move to a shared store if abuse appears
const hits = new Map();

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "AI not configured" });

  const { q, lang } = req.body || {};
  if (typeof q !== "string" || !q.trim() || q.length > 500) return res.status(400).json({ error: "bad query" });

  const ip = String(req.headers["x-forwarded-for"] || "?").split(",")[0];
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 8) return res.status(429).json({ error: "rate limited" });
  recent.push(now);
  hits.set(ip, recent);

  // gemini-flash-latest: rolling alias, survives model retirements (2.5-flash is closed to new users)
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: `Answer language: ${lang === "bn" ? "Bangla" : "English"}\nQuestion: ${q.trim()}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
    }),
  }).catch(() => null);
  if (!r || !r.ok) return res.status(502).json({ error: "upstream failed" });

  const data = await r.json().catch(() => null);
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  if (!text.trim()) return res.status(502).json({ error: "empty answer" });
  return res.status(200).json({ text: text.trim() });
};
