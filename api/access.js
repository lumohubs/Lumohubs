// Checks the access code on the server, so it never sits in the public code.
// Set ACCESS_CODE in Vercel. If it is not set, the site stays open.
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const expected = process.env.ACCESS_CODE;
  if (!expected) return res.status(200).json({ ok: true, open: true });
  const { code } = req.body || {};
  return res.status(200).json({ ok: String(code || "").trim() === expected });
}
