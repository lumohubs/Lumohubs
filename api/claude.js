// Server side AI mentor for Lumo Hubs.
// Default: a small open model (Ministral 8B, 8 billion parameters) through Vercel AI Gateway.
// On Vercel, the gateway signs in with the project's built in OIDC token, so no key is needed.
// Optional settings in Vercel:
//   SMALL_MODEL        another small open model id (default mistral/ministral-8b)
//   AI_GATEWAY_API_KEY a gateway key, only if the OIDC token is not available
//   AI_PROVIDER=claude switch back to Claude (needs ANTHROPIC_API_KEY)

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

// The app sends messages in Claude's format. Turn them into the open (OpenAI style) format.
function toOpenMessages(system, messages) {
  const out = [{ role: "system", content: system }];
  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    const parts = [];
    for (const b of m.content || []) {
      if (b.type === "text") parts.push({ type: "text", text: b.text });
      else if (b.type === "image" && b.source?.data)
        parts.push({ type: "image_url", image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` } });
      else if (b.type === "document")
        parts.push({ type: "text", text: "(The learner attached a PDF. Ask them to paste the key parts as text or add a photo.)" });
    }
    if (m.role === "assistant") out.push({ role: "assistant", content: parts.map((p) => p.text || "").join("\n") });
    else out.push({ role: "user", content: parts.length ? parts : "" });
  }
  return out;
}

async function askSmallModel({ system, messages, max_tokens }) {
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) throw { status: 500, msg: "The AI gateway is not set up. Turn on AI Gateway for this Vercel project." };
  const r = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      model: process.env.SMALL_MODEL || "mistral/ministral-8b",
      max_tokens,
      temperature: 0.4,
      messages: toOpenMessages(system, messages),
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw { status: r.status, msg: data?.error?.message || "The AI service returned an error." };
  const choice = data.choices?.[0] || {};
  return { text: choice.message?.content || "", truncated: choice.finish_reason === "length" };
}

async function askClaude({ system, messages, max_tokens }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw { status: 500, msg: "The AI key is not set. Add ANTHROPIC_API_KEY in Vercel settings." };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5", max_tokens, system, messages }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw { status: r.status, msg: data?.error?.message || "The AI service returned an error." };
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return { text, truncated: data.stop_reason === "max_tokens" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "No message sent." });
  const args = {
    system: system || "You are a helpful mentor at Lumo Hubs. Use plain language.",
    messages,
    max_tokens: Math.min(Math.max(Number(max_tokens) || 1500, 1500), 2000),
  };
  try {
    const result = process.env.AI_PROVIDER === "claude" ? await askClaude(args) : await askSmallModel(args);
    return res.status(200).json(result);
  } catch (e) {
    if (e && e.msg) return res.status(e.status || 500).json({ error: e.msg });
    return res.status(500).json({ error: "Could not reach the AI service. Try again in a minute." });
  }
}
