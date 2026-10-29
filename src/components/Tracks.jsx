import React, { useMemo, useState } from "react";
import { SECTORS, TRACKS, LIVE_TRACKS, trackById } from "../data/tracks";
import { QUIZ } from "../data/demo";
import { askClaude, readImage } from "../ai";

const PHOTO_SECTORS = ["trades"];
const canPhoto = (t) => PHOTO_SECTORS.includes(t.sector) || t.id === "healthcare";

export function TrackLibrary({ onOpen, lang }) {
  const [sector, setSector] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(
    () => TRACKS.filter((t) => (sector === "all" || t.sector === sector) && t.name.toLowerCase().includes(q.toLowerCase())),
    [sector, q]
  );
  const live = list.filter((t) => t.status === "live");
  const soon = list.filter((t) => t.status === "soon");
  return (
    <div>
      <h2>Tracks</h2>
      <p className="muted">{LIVE_TRACKS.length} tracks are open now. Each starts with a free 2 week starter. Foundation is free for students and community. Advanced is paid by employers.</p>
      <div className="row" style={{ margin: "16px 0" }}>
        <div className="seg" role="tablist" aria-label="Filter by sector">
          <button className={sector === "all" ? "on" : ""} onClick={() => setSector("all")}>All</button>
          {SECTORS.map((s) => (
            <button key={s.id} className={sector === s.id ? "on" : ""} onClick={() => setSector(s.id)}>{lang === "ar" ? s.nameAr : s.name}</button>
          ))}
        </div>
        <input className="input" style={{ maxWidth: 240 }} placeholder="Search tracks" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tracks" />
      </div>
      <div className="grid g3">
        {live.map((t) => <TrackCard key={t.id} t={t} onOpen={onOpen} />)}
      </div>
      {soon.length > 0 && (
        <div className="section">
          <h3>Coming soon</h3>
          <p className="muted small">Open any of these to see the full plan. Join the waitlist and we'll tell you when it launches.</p>
          <div className="grid g3">{soon.map((t) => <TrackCard key={t.id} t={t} onOpen={onOpen} />)}</div>
        </div>
      )}
      {list.length === 0 && <div className="empty">No tracks match that search. Try a shorter word.</div>}
    </div>
  );
}

function TrackCard({ t, onOpen }) {
  return (
    <button className="card-btn" onClick={() => onOpen(t.id)}>
      <div className="row between">
        <span style={{ fontSize: 28 }} aria-hidden>{t.icon}</span>
        {t.status === "soon" ? <span className="chip gold">Coming soon</span> : <span className="chip teal">{t.demand} demand</span>}
      </div>
      <h3 style={{ marginTop: 8 }}>{t.name}</h3>
      <p className="muted small" style={{ marginBottom: 8 }}>{t.tagline}</p>
      <div className="small"><strong>{t.avgPay}</strong>{t.agent ? <span className="muted"> with {t.agent}</span> : null}</div>
    </button>
  );
}

export function TrackDetail({ id, onBack, onJoinWaitlist, waitlist, progress, setProgress }) {
  const t = trackById(id);
  const [level, setLevel] = useState("foundation");
  if (!t) return null;
  const soon = t.status === "soon";
  const done = progress[t.id] || [];
  const toggle = (w) => {
    const next = done.includes(w) ? done.filter((x) => x !== w) : [...done, w];
    setProgress({ ...progress, [t.id]: next });
  };
  return (
    <div>
      <button className="back" onClick={onBack}>Back to tracks</button>
      <div className="row" style={{ alignItems: "flex-start", gap: 18 }}>
        <span style={{ fontSize: 46 }} aria-hidden>{t.icon}</span>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="row">
            <h2 style={{ margin: 0 }}>{t.name}</h2>
            {soon && <span className="chip gold">Coming soon</span>}
          </div>
          <p className="muted" style={{ marginTop: 6 }}>{t.description}</p>
          <div className="row small">
            <span className="chip teal">{t.demand} demand</span>
            <span className="chip">Avg pay {t.avgPay}</span>
            {t.agent && <span className="chip plum">AI agent: {t.agent}</span>}
            <span className="chip">6 weeks, 5 hours a week</span>
          </div>
          {t.subTracks && <p className="small" style={{ marginTop: 8 }}>Includes: {t.subTracks.join(", ")}</p>}
        </div>
      </div>

      {soon ? (
        <div className="panel tint section">
          <h3>This track opens soon</h3>
          <p className="muted">You can read the full plan below. The AI mentor and photo checks turn on at launch.</p>
          {waitlist.includes(t.id)
            ? <span className="chip green">You're on the waitlist</span>
            : <button className="btn" onClick={() => onJoinWaitlist(t.id)}>Join the waitlist</button>}
        </div>
      ) : (
        <div className="grid g2 section">
          <div className="panel">
            <div className="row between">
              <h3 style={{ margin: 0 }}>Levels</h3>
              <div className="seg">
                <button className={level === "foundation" ? "on" : ""} onClick={() => setLevel("foundation")}>Foundation</button>
                <button className={level === "advanced" ? "on" : ""} onClick={() => setLevel("advanced")}>Advanced</button>
              </div>
            </div>
            {level === "foundation" ? (
              <p style={{ marginTop: 12 }}>Free for students and community members. Start with the free 2 week starter (weeks 1 and 2), then finish all 6 weeks online and at the hub. Ends with a portfolio project.</p>
            ) : (
              <p style={{ marginTop: 12 }}>Paid by employers. Companies send their staff, or sponsor students they want to hire. Advanced runs on real company systems and a live employer project.</p>
            )}
            <div className="small muted">Your progress: {done.length} of 6 weeks</div>
            <div className="bar" style={{ marginTop: 6 }}><span style={{ width: `${(done.length / 6) * 100}%` }} /></div>
          </div>
          <div className="panel">
            <h3>Company software</h3>
            <div>{t.software.map((s) => <span key={s} className="chip plum">{s}</span>)}</div>
            <h3 style={{ marginTop: 14 }}>Hands on example</h3>
            <p style={{ margin: 0 }}>{t.example}</p>
          </div>
        </div>
      )}

      <h3>Your 6 week plan</h3>
      <div className="grid" style={{ gap: 12 }}>
        {t.weeks.map((w) => (
          <WeekCard key={w.week} t={t} w={w} locked={soon} done={done.includes(w.week)} onToggle={() => toggle(w.week)} />
        ))}
      </div>
    </div>
  );
}

function WeekCard({ t, w, locked, done, onToggle }) {
  const [open, setOpen] = useState(w.week === 1);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [question, setQuestion] = useState("");
  const starter = w.week <= 2;

  async function ask() {
    setBusy(true); setAnswer(""); setError("");
    const role = t.agent || "an AI mentor";
    const system = `You are ${role}, an AI mentor at Lumo Hubs for the ${t.name} track. Use plain language a beginner understands. Be practical and specific. Keep answers under 220 words. No dashes. ${t.id === "healthcare" ? "This is for training only. Never give a medical diagnosis for a real patient. Say a licensed professional must decide." : ""} ${t.sector === "trades" ? "Always include safety steps. Tell the learner when a licensed professional is needed." : ""}`;
    let prompt;
    if (photo) {
      prompt = `I'm in Week ${w.week}: ${w.title}. Focus: ${w.focus}. Look at my photo. Tell me: 1) what you see, 2) the likely issue, 3) the steps to fix it or what to do next. ${question ? "My question: " + question : ""}`;
    } else {
      prompt = question
        ? `I'm in Week ${w.week}: ${w.title} (${w.focus}). My question: ${question}`
        : `I'm in Week ${w.week}: ${w.title}. Focus: ${w.focus}. Give me 3 specific things to know or do this week, 2 sentences each. End with one short motivating line.`;
    }
    const r = await askClaude({ system, prompt, image: photo });
    if (r.error) setError(r.error); else setAnswer(r.text);
    setBusy(false);
  }

  return (
    <div className="panel">
      <button className="row between" style={{ width: "100%", border: 0, background: "none", padding: 0, textAlign: "start" }} onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="row">
          <span className="chip">{`Week ${w.week}`}</span>
          <strong>{w.title}</strong>
          {starter && !locked && <span className="chip green">Free starter</span>}
          {done && <span className="chip teal">Done</span>}
        </div>
        <span className="muted small">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          <p>{w.focus}</p>
          <div className="small"><strong>Tools:</strong> {w.tools.join(", ")}</div>
          <div className="small" style={{ marginTop: 4 }}><strong>How AI helps:</strong> {w.ai}</div>
          {locked ? (
            <p className="muted small" style={{ marginTop: 12 }}>The AI mentor opens when this track launches.</p>
          ) : (
            <div style={{ marginTop: 14 }}>
              <textarea className="input" placeholder={`Ask ${t.agent || "your AI mentor"} a question about this week (optional)`} value={question} onChange={(e) => setQuestion(e.target.value)} />
              <div className="row" style={{ marginTop: 10 }}>
                {canPhoto(t) && (
                  <label className="btn ghost small" style={{ cursor: "pointer" }}>
                    {photo ? `Photo: ${photo.name}` : "Add a photo"}
                    <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files[0]; if (f) setPhoto(await readImage(f)); }} />
                  </label>
                )}
                <button className="btn teal small" onClick={ask} disabled={busy}>
                  {busy ? "Thinking..." : photo ? "Check my photo" : question ? "Ask my mentor" : `Get Week ${w.week} tips`}
                </button>
                <button className="btn ghost small" onClick={onToggle}>{done ? "Mark not done" : "Mark week done"}</button>
              </div>
              {photo && <img src={photo.url} alt="Your upload" style={{ maxHeight: 160, borderRadius: 8, marginTop: 10 }} />}
              {error && <div className="err">{error}</div>}
              {answer && (
                <div className="ai-box">{answer}<div className="ai-src">{t.agent || "AI Mentor"}, powered by Claude</div></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TrackQuiz({ onOpen }) {
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const step = answers.length;

  async function finish(all) {
    setBusy(true); setError("");
    const list = LIVE_TRACKS.map((t) => `${t.id}: ${t.name}`).join("\n");
    const prompt = `A person answered a short quiz:\n${QUIZ.map((x, i) => `${x.q} ${all[i]}`).join("\n")}\n\nPick the 3 best tracks for them from this list:\n${list}\n\nReply ONLY with JSON, no other text: {"picks":[{"id":"track id","why":"one short plain sentence"}]}`;
    const r = await askClaude({ system: "You match people to training tracks. Reply with JSON only.", prompt, maxTokens: 400 });
    let picks = null;
    if (!r.error) {
      try { picks = JSON.parse(r.text.replace(/```json|```/g, "").trim()).picks.filter((p) => trackById(p.id)); } catch { picks = null; }
    }
    if (!picks || picks.length === 0) {
      picks = fallbackPicks(all);
      if (r.error) setError("The AI matcher is offline, so these picks come from your answers directly.");
    }
    setResult(picks);
    setBusy(false);
  }

  function choose(a) {
    const next = [...answers, a];
    setAnswers(next);
    if (next.length === QUIZ.length) finish(next);
  }

  if (result || busy) {
    return (
      <div>
        <h2>Your best tracks</h2>
        {busy && <p className="muted">Matching your answers to tracks...</p>}
        {error && <div className="err">{error}</div>}
        <div className="grid g3" style={{ marginTop: 14 }}>
          {(result || []).map((p) => {
            const t = trackById(p.id);
            return (
              <button key={p.id} className="card-btn" onClick={() => onOpen(p.id)}>
                <span style={{ fontSize: 28 }} aria-hidden>{t.icon}</span>
                <h3 style={{ marginTop: 6 }}>{t.name}</h3>
                <p className="small muted" style={{ margin: 0 }}>{p.why}</p>
              </button>
            );
          })}
        </div>
        {!busy && <button className="btn ghost" style={{ marginTop: 18 }} onClick={() => { setAnswers([]); setResult(null); setError(""); }}>Take the quiz again</button>}
      </div>
    );
  }

  const item = QUIZ[step];
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Find your track</h2>
      <p className="muted">Four quick questions. Not one size fits all, so we match you to the tracks that fit your life and goals.</p>
      <div className="small muted" style={{ marginTop: 18 }}>Question {step + 1} of {QUIZ.length}</div>
      <div className="bar" style={{ margin: "6px 0 18px" }}><span style={{ width: `${(step / QUIZ.length) * 100}%` }} /></div>
      <h3>{item.q}</h3>
      <div className="grid" style={{ gap: 8 }}>
        {item.a.map((a) => <button key={a} className="card-btn" onClick={() => choose(a)}>{a}</button>)}
      </div>
    </div>
  );
}

function fallbackPicks(all) {
  const field = all[2] || "";
  const map = {
    "Banking and finance": ["banking", "data-analytics", "business-systems"],
    "Energy and utilities": ["energy", "solar", "electrical"],
    "Government and public service": ["government", "data-analytics", "ai-pm"],
    Healthcare: ["healthcare", "data-analytics", "ai-hr"],
    "Media and design": ["media-youtube", "freelance-design", "freelance-marketing"],
    "Trades and building": ["plumbing", "electrical", "hvac"],
    Technology: ["ai-cybersecurity", "freelance-tech", "data-analytics"],
    "My own business": ["entrepreneurship", "ecommerce", "freelance-marketing"],
  };
  return (map[field] || ["data-analytics", "business-systems", "entrepreneurship"]).map((id) => ({ id, why: "A strong match for the field you picked." }));
}
