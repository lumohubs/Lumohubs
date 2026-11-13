// Signed in learner, shared across the app. Talks to /api/learner.
// If server storage is not connected, everything still works in this browser only.
import { useEffect, useState } from "react";

const TOKEN_KEY = "lh-token";
let state = { learner: null, token: null, ready: false, noStore: false };
const subs = new Set();
const emit = () => subs.forEach((f) => f(state));
const set = (patch) => { state = { ...state, ...patch }; emit(); };

async function call(body) {
  const r = await fetch("/api/learner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { error: d.error || "Something went wrong. Try again." };
  return d;
}

// Work saved by week, minus big file data, so it fits on the server.
function slimWeeks(weeks) {
  const out = {};
  for (const [k, v] of Object.entries(weeks || {})) {
    const sub = v.submission ? { ...v.submission, files: (v.submission.files || []).map((f) => ({ name: f.name, type: f.type, size: f.size, url: f.url && f.url.length < 150000 ? f.url : "" })) } : undefined;
    out[k] = { ...v, submission: sub };
  }
  return out;
}

// Put server progress and work into this browser so the rest of the app sees it.
function mergeIntoBrowser(l) {
  try {
    const local = JSON.parse(localStorage.getItem("lh-progress") || "{}");
    const merged = { ...local };
    for (const [t, arr] of Object.entries(l.progress || {})) merged[t] = Array.from(new Set([...(local[t] || []), ...arr]));
    localStorage.setItem("lh-progress", JSON.stringify(merged));
    const work = JSON.parse(localStorage.getItem("lh-work") || "{}");
    work.weeks = { ...(l.weeks || {}), ...(work.weeks || {}) };
    localStorage.setItem("lh-work", JSON.stringify(work));
    window.dispatchEvent(new Event("lh-work"));
    window.dispatchEvent(new Event("lh-progress"));
  } catch {}
}

export async function initLearner() {
  let token = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch {}
  if (!token) {
    const d = await call({ action: "get", token: "" }).catch(() => ({}));
    return set({ ready: true, noStore: !!d.noStore });
  }
  const d = await call({ action: "get", token }).catch(() => ({ error: "offline" }));
  if (d.noStore) return set({ ready: true, noStore: true });
  if (d.learner) { mergeIntoBrowser(d.learner); return set({ ready: true, token, learner: d.learner }); }
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
  set({ ready: true });
}

export async function signIn({ name, email, pin }) {
  const d = await call({ action: "login", name, email, pin });
  if (d.noStore) { set({ noStore: true }); return { error: "Saving is not turned on yet. Ask the Lumo Hubs team." }; }
  if (d.error) return d;
  try { localStorage.setItem(TOKEN_KEY, d.token); } catch {}
  mergeIntoBrowser(d.learner);
  set({ token: d.token, learner: d.learner });
  return { ok: true, isNew: d.isNew };
}

export function signOut() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
  set({ token: null, learner: null });
}

let timer = null;
let pending = {};
// Save changes to the server. Small delay so quick changes go together.
export function saveLearner(patch) {
  if (!state.token) return;
  const { asked, ...rest } = patch;
  pending = { ...pending, ...rest, asked: (pending.asked || 0) + (asked || 0) };
  set({ learner: { ...state.learner, ...rest } });
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const p = pending; pending = {};
    if (!p.asked) delete p.asked;
    if (p.weeks) p.weeks = slimWeeks(p.weeks);
    await call({ action: "save", token: state.token, patch: p }).catch(() => {});
  }, 800);
}

export function getLearner() { return state.learner; }

export function useLearner() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); setS(state); return () => subs.delete(setS); }, []);
  return s;
}
