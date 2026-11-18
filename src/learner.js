// Signed in learner, shared across the app. Talks to /api/learner.
// If server storage is not connected, everything still works in this browser only.
import { useEffect, useState } from "react";

const TOKEN_KEY = "lh-token";
let state = { learner: null, token: null, ready: false, noStore: false };
const subs = new Set();
const emit = () => subs.forEach((f) => f(state));
const set = (patch) => { state = { ...state, ...patch }; if ("learner" in patch) writeCache(state.learner); emit(); };

async function call(body, opts) {
  const r = await fetch("/api/learner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), ...(opts || {}) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { error: d.error || "Something went wrong. Try again.", status: r.status };
  return d;
}

// A copy of the learner (with their chat) kept in this browser. If the server is slow or a save
// is lost, the chat is not wiped: we keep whichever copy has the newer messages.
const CACHE_KEY = "lh-learner-cache";
function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
}
function writeCache(l) {
  try { if (l) localStorage.setItem(CACHE_KEY, JSON.stringify(l)); else localStorage.removeItem(CACHE_KEY); } catch {}
}
const lastAt = (chat) => (Array.isArray(chat) && chat.length ? chat[chat.length - 1].at || 0 : 0);
// Use the local chat if it is newer than the server copy for the same email, then save it back.
function withBestChat(server) {
  const local = readCache();
  if (!local || !server || (local.email || "").toLowerCase() !== (server.email || "").toLowerCase()) return { learner: server, fixed: false };
  if (lastAt(local.chat) > lastAt(server.chat) && (local.chat || []).length >= (server.chat || []).length / 2) {
    return { learner: { ...server, chat: local.chat }, fixed: true };
  }
  return { learner: server, fixed: false };
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
  if (d.learner) {
    const best = withBestChat(d.learner);
    mergeIntoBrowser(best.learner);
    set({ ready: true, token, learner: best.learner });
    if (best.fixed) saveLearner({ chat: best.learner.chat });
    return;
  }
  // Only sign out when the server says the session is really gone.
  // A slow network or a busy server should not wipe the learner's screen.
  if (d.status === 401) {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    return set({ ready: true, learner: null });
  }
  const cached = readCache();
  if (cached) { mergeIntoBrowser(cached); return set({ ready: true, token, learner: cached }); }
  set({ ready: true });
}

export async function signIn({ name, email, pin }) {
  const d = await call({ action: "login", name, email, pin });
  if (d.noStore) { set({ noStore: true }); return { error: "Saving is not turned on yet. Ask the Lumo Hubs team." }; }
  if (d.error) return d;
  try { localStorage.setItem(TOKEN_KEY, d.token); } catch {}
  const best = withBestChat(d.learner);
  mergeIntoBrowser(best.learner);
  set({ token: d.token, learner: best.learner });
  if (best.fixed) saveLearner({ chat: best.learner.chat });
  return { ok: true, isNew: d.isNew };
}

export function signOut() {
  flushSave();
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
  timer = setTimeout(() => flushSave(), 800);
}

// Send any waiting changes now. keepalive lets the save finish even if the phone
// closes the tab or switches apps right after the coach answers.
function flushSave() {
  clearTimeout(timer);
  if (!state.token || !Object.keys(pending).length) return;
  const p = pending; pending = {};
  if (!p.asked) delete p.asked;
  if (p.weeks) p.weeks = slimWeeks(p.weeks);
  const body = { action: "save", token: state.token, patch: p };
  const small = JSON.stringify(body).length < 60000;
  call(body, small ? { keepalive: true } : undefined).catch(() => {});
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushSave);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });
}

export function getLearner() { return state.learner; }

export function useLearner() {
  const [s, setS] = useState(state);
  useEffect(() => { subs.add(setS); setS(state); return () => subs.delete(setS); }, []);
  return s;
}
