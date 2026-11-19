// Learner memory for Lumo Hubs. Saves each learner on the server so the coach remembers them on any device.
// Storage: Upstash Redis (free) from the Vercel Marketplace. Connecting it to this project adds
// KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).
// If storage is not connected, the app keeps working and saves in the browser only.
// Optional: ADMIN_CODE lets hub staff see the learner list (action "admin").
import crypto from "crypto";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SESSION_DAYS = 120;
const MAX_CHAT = 40;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error(d.error || "Storage error");
  return d.result;
}

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const emailKey = (email) => "learner:" + sha(String(email).trim().toLowerCase());
const hashPin = (pin, salt) => crypto.scryptSync(String(pin), salt, 32).toString("hex");

async function getJSON(key) {
  const v = await redis(["GET", key]);
  return v ? JSON.parse(v) : null;
}
const setJSON = (key, obj) => redis(["SET", key, JSON.stringify(obj)]);

// What the app gets back. Never send the PIN hash.
function publicView(l) {
  const { pinHash, pinSalt, failed, ...rest } = l;
  return rest;
}

async function fromToken(token) {
  if (!token || typeof token !== "string") return null;
  const key = await redis(["GET", "session:" + token]);
  if (!key) return null;
  const l = await getJSON(key);
  return l ? { key, l } : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  if (!URL_ || !TOKEN) return res.status(200).json({ noStore: true });
  const b = req.body || {};
  try {
    if (b.action === "login") {
      const name = String(b.name || "").trim().slice(0, 60);
      const email = String(b.email || "").trim().toLowerCase().slice(0, 120);
      const pin = String(b.pin || "").trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Please enter a real email." });
      if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: "Your PIN must be 4 numbers." });
      const key = emailKey(email);
      let l = await getJSON(key);
      let isNew = false;
      if (l) {
        if ((l.failed || 0) >= 8 && Date.now() - (l.failedAt || 0) < 15 * 60 * 1000)
          return res.status(429).json({ error: "Too many tries. Wait 15 minutes and try again." });
        if (hashPin(pin, l.pinSalt) !== l.pinHash) {
          l.failed = (l.failed || 0) + 1; l.failedAt = Date.now();
          await setJSON(key, l);
          return res.status(401).json({ error: "That PIN does not match this email. Try again." });
        }
        l.failed = 0;
        l.lastSeenBefore = l.lastSeen;
      } else {
        if (!name) return res.status(400).json({ error: "Please enter your first name." });
        const salt = crypto.randomBytes(16).toString("hex");
        l = { name, email, pinSalt: salt, pinHash: hashPin(pin, salt), createdAt: Date.now(), visits: 0, goal: "", trackId: "", progress: {}, weeks: {}, chat: [] };
        isNew = true;
      }
      l.visits = (l.visits || 0) + 1;
      l.lastSeen = Date.now();
      await setJSON(key, l);
      await redis(["SADD", "learners", key]);
      const token = crypto.randomBytes(24).toString("hex");
      await redis(["SET", "session:" + token, key, "EX", SESSION_DAYS * 86400]);
      return res.status(200).json({ token, isNew, learner: publicView(l) });
    }

    if (b.action === "get") {
      const s = await fromToken(b.token);
      if (!s) return res.status(401).json({ error: "Please sign in again." });
      s.l.lastSeenBefore = s.l.lastSeen;
      s.l.lastSeen = Date.now();
      await setJSON(s.key, s.l);
      return res.status(200).json({ learner: publicView(s.l) });
    }

    if (b.action === "save") {
      const s = await fromToken(b.token);
      if (!s) return res.status(401).json({ error: "Please sign in again." });
      const p = b.patch || {};
      const l = s.l;
      if (typeof p.goal === "string") l.goal = p.goal.slice(0, 300);
      // Profile the learner can edit: first name, a short "about me", and a small photo.
      if (typeof p.name === "string" && p.name.trim()) l.name = p.name.trim().slice(0, 60);
      if ([1, 2, 3].includes(p.level)) { if (p.level !== l.level) l.levelAt = Date.now(); l.level = p.level; }
      if (p.levelFailedAt) l.levelFailedAt = Date.now();
      if (typeof p.about === "string") l.about = p.about.slice(0, 300);
      if (p.photo === "") l.photo = "";
      else if (typeof p.photo === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.photo) && p.photo.length < 80000) l.photo = p.photo;
      if (typeof p.trackId === "string") l.trackId = p.trackId.slice(0, 60);
      if (p.bizTools === "on" || p.bizTools === "tested-out") l.bizTools = p.bizTools;
      if (p.bizCheckFailedAt) l.bizCheckFailedAt = Date.now();
      if (p.inPerson === "requested" && l.inPerson !== "requested") { l.inPerson = "requested"; l.inPersonAt = Date.now(); }
      if (p.progress && typeof p.progress === "object") l.progress = p.progress;
      if (p.weeks && typeof p.weeks === "object") l.weeks = p.weeks;
      if (Array.isArray(p.chat)) l.chat = p.chat.slice(-MAX_CHAT).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", text: String(m.text || "").slice(0, 3000), at: m.at || Date.now() }));
      if (p.asked) l.questions = (l.questions || 0) + Math.min(Number(p.asked) || 0, 5);
      if (p.event) l.events = [...(l.events || []), { e: String(p.event).slice(0, 80), at: Date.now() }].slice(-100);
      l.lastSeen = Date.now();
      // Keep each learner under about 400 KB. Drop big file copies first, so the chat is kept.
      if (JSON.stringify(l).length > 400000) {
        for (const w of Object.values(l.weeks || {})) {
          if (w && w.submission && Array.isArray(w.submission.files)) w.submission.files = w.submission.files.map((f) => ({ ...f, url: "" }));
        }
      }
      if (JSON.stringify(l).length > 400000) l.chat = l.chat.slice(-20);
      await setJSON(s.key, l);
      return res.status(200).json({ ok: true });
    }

    if (b.action === "admin") {
      if (!process.env.ADMIN_CODE || b.code !== process.env.ADMIN_CODE) return res.status(401).json({ error: "Wrong admin code." });
      const keys = (await redis(["SMEMBERS", "learners"])) || [];
      const out = [];
      for (const k of keys) {
        const l = await getJSON(k);
        if (!l) continue;
        out.push({
          name: l.name, email: l.email, goal: l.goal, trackId: l.trackId, bizTools: l.bizTools || "on", inPerson: l.inPerson || "", visits: l.visits,
          createdAt: l.createdAt, lastSeen: l.lastSeen,
          weeksDone: Object.values(l.progress || {}).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0),
          submitted: Object.values(l.weeks || {}).filter((w) => w.submission).length,
          questions: l.questions || 0, level: l.level || 1,
        });
      }
      out.sort((a, b2) => (b2.lastSeen || 0) - (a.lastSeen || 0));
      return res.status(200).json({ learners: out });
    }

    if (b.action === "instructor") {
      if (!process.env.ADMIN_CODE || b.code !== process.env.ADMIN_CODE) return res.status(401).json({ error: "Wrong staff code." });
      const keys = (await redis(["SMEMBERS", "learners"])) || [];
      const out = [];
      for (const k of keys) {
        const l = await getJSON(k);
        if (!l) continue;
        if (!b.all && l.inPerson !== "requested") continue;
        out.push({
          name: l.name, email: l.email, goal: l.goal || "", trackId: l.trackId || "", bizTools: l.bizTools || "on",
          inPerson: l.inPerson || "", inPersonAt: l.inPersonAt || null, createdAt: l.createdAt, lastSeen: l.lastSeen,
          questions: l.questions || 0, level: l.level || 1, progress: l.progress || {}, weeks: l.weeks || {},
        });
      }
      out.sort((a, c) => (c.inPersonAt || c.lastSeen || 0) - (a.inPersonAt || a.lastSeen || 0));
      return res.status(200).json({ learners: out });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (e) {
    return res.status(500).json({ error: "Could not reach learner storage. Try again in a minute." });
  }
}
