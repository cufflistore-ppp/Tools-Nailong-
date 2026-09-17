/**
 * Vercel Serverless Function — AI Tools backend
 * Path: /api/ai
 *
 * Set environment variable OPENAI_API_KEY (or another provider key) in Vercel.
 * Never put the key in frontend files.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(501).json({
      error: "AI API is not configured",
      hint: "Add OPENAI_API_KEY in Vercel project environment variables."
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { tool, input, style } = body || {};
  if (!input || !String(input).trim()) {
    res.status(400).json({ error: "Input is required" });
    return;
  }

  const prompts = {
    "ai-summarizer": "Summarize the text clearly and briefly.",
    "ai-rewriter": "Rewrite the text so it is clearer and more natural.",
    "ai-translator": "Translate the text. If no target language is given, translate to English.",
    "ai-caption": "Write 5 short social captions about this topic. Keep them friendly.",
    "ai-product": "Write a short product description.",
    "ai-title": "Suggest 8 title options.",
    "ai-hashtag": "Suggest relevant hashtags.",
    "ai-helper": "Help improve or expand the text.",
    "ai-ideas": "Brainstorm useful ideas.",
    "ai-email": "Write a polite email draft.",
    "ai-study": "Explain this topic in simple language for a student.",
    "ai-qa": "Answer the question clearly."
  };
  const instruction = prompts[tool] || "Help with the user's text.";

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: instruction + " Style: " + (style || "Neutral") + ". Keep the answer suitable for all ages." },
          { role: "user", content: String(input).slice(0, 8000) }
        ],
        temperature: 0.7
      })
    });
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: data.error?.message || "AI provider error" });
      return;
    }
    res.status(200).json({ text: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    res.status(500).json({ error: "Network or provider failure" });
  }
}
