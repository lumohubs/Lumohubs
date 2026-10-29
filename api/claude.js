// Server side: keeps the Claude API key secret. Set ANTHROPIC_API_KEY in Vercel.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "The AI key is not set. Add ANTHROPIC_API_KEY in Vercel settings." });
  try {
    const { system, messages, max_tokens } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "No message sent." });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: Math.min(Number(max_tokens) || 1000, 2000),
        system: system || "You are a helpful mentor at Lumo Hubs. Use plain language.",
        messages,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "The AI service returned an error." });
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Could not reach the AI service. Try again in a minute." });
  }
}
