export async function askClaude({ system, prompt, image, maxTokens = 900 }) {
  const content = image
    ? [{ type: "image", source: { type: "base64", media_type: image.type, data: image.data } }, { type: "text", text: prompt }]
    : prompt;
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, max_tokens: maxTokens, messages: [{ role: "user", content }] }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { error: data.error || "The AI mentor is not available right now." };
    return { text: data.text };
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
