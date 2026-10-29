export async function askClaude({ system, prompt, image, messages, maxTokens = 1500 }) {
  // Send a full chat (messages) for Q and A, or a single prompt (with an optional photo).
  let msgs = messages;
  if (!Array.isArray(msgs) || msgs.length === 0) {
    const content = image
      ? [{ type: "image", source: { type: "base64", media_type: image.type, data: image.data } }, { type: "text", text: prompt }]
      : prompt;
    msgs = [{ role: "user", content }];
  }
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, max_tokens: maxTokens, messages: msgs }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { error: data.error || "The AI mentor is not available right now." };
    // If the answer still ran out of room, say so instead of stopping mid sentence.
    const note = data.truncated ? "\n\n*This answer was cut short. Ask me to continue.*" : "";
    return { text: (data.text || "") + note, truncated: !!data.truncated };
  } catch {
    return { error: "No connection. Check your internet and try again." };
  }
}

export function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ data: String(e.target.result).split(",")[1], type: file.type, name: file.name, url: e.target.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
