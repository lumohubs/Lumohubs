import React, { useEffect, useMemo, useRef, useState } from "react";
import { SECTORS, TRACKS, LIVE_TRACKS, trackById } from "../data/tracks";
import { QUIZ } from "../data/demo";
import { askClaude, readImage } from "../ai";
import { useWork, weekKey, newId, assignmentFor, SubmitWork, WeekQuiz } from "./Work";

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
  const [work] = useWork();
  if (!t) return null;
  const soon = t.status === "soon";
  const done = progress[t.id] || [];
  const markDone = (w) => {
    if (!done.includes(w)) setProgress({ ...progress, [t.id]: [...done, w] });
  };
  const submitted = t.weeks.filter((w) => work.weeks[weekKey(t, w)]?.submission).length;
  const passed = t.weeks.filter((w) => work.weeks[weekKey(t, w)]?.quiz?.passed).length;
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
            <div className="small muted">Your progress: {done.length} of 6 weeks done. {submitted} of 6 assignments submitted. {passed} of 6 quizzes passed.</div>
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
          <WeekCard key={w.week} t={t} w={w} locked={soon} done={done.includes(w.week)} onComplete={() => markDone(w.week)} />
        ))}
      </div>
    </div>
  );
}

// Turns the mentor's reply into clean text: bold, headings and lists, with no stars showing.
function renderInline(text, keyBase) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") && p.length > 4
      ? <strong key={keyBase + "-" + i}>{p.slice(2, -2)}</strong>
      : p.replace(/\*/g, "")
  );
}

function RichText({ text }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const out = [];
  let list = null;
  const flush = () => {
    if (!list) return;
    const k = "list-" + out.length;
    out.push(list.ordered ? <ol key={k} style={{ margin: "6px 0", paddingInlineStart: 22 }}>{list.items}</ol> : <ul key={k} style={{ margin: "6px 0", paddingInlineStart: 22 }}>{list.items}</ul>);
    list = null;
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || /^[-*_]{3,}$/.test(line)) { flush(); return; }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { flush(); out.push(<div key={i} style={{ fontWeight: 700, marginTop: 10 }}>{renderInline(h[1], i)}</div>); return; }
    const b = line.match(/^[-*•]\s+(.*)$/);
    const n = line.match(/^\d+[.)]\s+(.*)$/);
    if (b || n) {
      const ordered = !!n;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push(<li key={i}>{renderInline((b || n)[1], i)}</li>);
      return;
    }
    flush();
    out.push(<p key={i} style={{ margin: "6px 0" }}>{renderInline(line, i)}</p>);
  });
  flush();
  return <div>{out}</div>;
}

function WeekCard({ t, w, locked, done, onComplete }) {
  const [open, setOpen] = useState(w.week === 1);
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState([]);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [input, setInput] = useState("");
  const [work, update] = useWork();
  const boxRef = useRef(null);
  const starter = w.week <= 2;
  const mentor = t.agent || "AI Mentor";
  const key = weekKey(t, w);
  const rec = work.weeks[key] || {};
  const assignment = assignmentFor(t, w);
  const submitted = !!rec.submission;
  const quizPassed = !!(rec.quiz && rec.quiz.passed);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chat, busy]);

  // The week is done when the work is in and the quiz is passed.
  useEffect(() => {
    if (submitted && quizPassed && !done && onComplete) onComplete();
  }, [submitted, quizPassed, done, onComplete]);

  const system = [
    "You are " + mentor + ", the AI mentor at Lumo Hubs for the " + t.name + " track.",
    "You know this course well. The student is in Week " + w.week + " of 6: \"" + w.title + "\".",
    "This week's focus: " + w.focus + ".",
    "Tools this week: " + (w.tools || []).join(", ") + ".",
    w.ai ? "How AI helps this week: " + w.ai + "." : "",
    "This week's assignment: " + assignment,
    t.software ? "Company software in this track: " + t.software.join(", ") + "." : "",
    t.example ? "Hands on example for this track: " + t.example : "",
    "Never say you cannot see the course, syllabus, lessons or assignments. The details above are the course. Teach from them.",
    "This is a coaching chat. When the student asks to get started, walk them through the assignment in clear numbered steps they can do today, say what to submit at the end, then ask if they are ready for step 1.",
    "When the student asks for practice questions, ask ONE clear question about this week and stop so they can type an answer. When they answer, say what they got right, fix what is wrong or missing, give a score out of 10, then ask the next question.",
    "When the student submits work, review it against the assignment: what is good, what to improve, and a score out of 10.",
    "If the student asks their own question, answer it.",
    "Use plain language a beginner understands. Be practical and specific. Keep each reply under 220 words. Use short paragraphs, bold for key words, and simple lists. No tables. Do not use em dashes.",
    t.id === "healthcare" ? "This is for training only. Never give a medical diagnosis for a real patient. Say a licensed professional must decide." : "",
    t.sector === "trades" ? "Always include safety steps. Tell the learner when a licensed professional is needed." : "",
  ].filter(Boolean).join(" ");

  async function send(kind, sub) {
    const text = input.trim();
    let api, shown, img = null, blocks = null;
    if (kind === "start") {
      api = "Help me get started on this week's assignment. Walk me through it step by step.";
      shown = "Get started";
    } else if (kind === "practice") {
      api = "Give me a practice question about this week.";
      shown = "Practice Q and A";
    } else if (kind === "review") {
      const names = (sub.files || []).map((f) => f.name).join(", ");
      api = "I submitted my assignment. Here is my work." + (sub.text ? " What I did: " + sub.text : "") + (sub.link ? " Link: " + sub.link : "") + (names ? " Files: " + names + "." : "") + " Please review it.";
      shown = "I submitted my work. Please review it.";
      const attach = (sub.files || []).filter((f) => f.type.startsWith("image/") || f.type === "application/pdf").slice(0, 2);
      if (attach.length) {
        blocks = attach.map((f) => ({
          type: f.type === "application/pdf" ? "document" : "image",
          source: { type: "base64", media_type: f.type, data: String(f.url).split(",")[1] },
        }));
      }
    } else if (photo) {
      img = photo;
      api = "Look at my photo. Tell me: 1) what you see, 2) the likely issue, 3) the steps to fix it or what to do next." + (text ? " My question: " + text : "");
      shown = text || "Check my photo";
    } else if (text) {
      api = text;
      shown = text;
    } else {
      return;
    }
    if (img) blocks = [{ type: "image", source: { type: "base64", media_type: img.type, data: img.data } }];
    const before = chat;
    const next = [...chat, { role: "user", text: shown, api, img, blocks }];
    setChat(next);
    if (kind === "send") setInput("");
    if (img) setPhoto(null);
    setBusy(true);
    setError("");
    const messages = next.map((m, i) => {
      if (m.role === "user" && m.blocks && i === next.length - 1) {
        return { role: "user", content: [...m.blocks, { type: "text", text: m.api }] };
      }
      return { role: m.role, content: (m.api || m.text) + (m.blocks ? " (I shared files here.)" : "") };
    });
    const r = await askClaude({ system, messages, maxTokens: 1000 });
    if (r.error) {
      setError(r.error);
      setChat(before);
      if (kind === "send") setInput(text);
      if (img) setPhoto(img);
    } else {
      setChat([...next, { role: "assistant", text: r.text }]);
    }
    setBusy(false);
  }

  function submitWork(sub) {
    const err = update((s) => {
      const weeks = { ...s.weeks, [key]: { ...(s.weeks[key] || {}), submission: sub } };
      let portfolio = s.portfolio.filter((p) => p.fromWeek !== key);
      if (sub.inPortfolio) {
        portfolio = [{ id: newId(), fromWeek: key, title: t.name + ", Week " + w.week + ": " + w.title, text: sub.text, link: sub.link, files: sub.files, trackId: t.id, week: w.week, date: sub.date }, ...portfolio];
      }
      return { ...s, weeks, portfolio };
    });
    if (err) return err;
    send("review", sub);
    return null;
  }

  function saveQuiz(q) {
    update((s) => ({ ...s, weeks: { ...s.weeks, [key]: { ...(s.weeks[key] || {}), quiz: q } } }));
  }

  const waitingForAnswer = chat.length > 0 && chat[chat.length - 1].role === "assistant";
  const stepTitle = { margin: "0 0 8px", fontSize: "1rem" };

  return (
    <div className="panel">
      <button className="row between" style={{ width: "100%", border: 0, background: "none", padding: 0, textAlign: "start" }} onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="row">
          <span className="chip">{"Week " + w.week}</span>
          <strong>{w.title}</strong>
          {starter && !locked && <span className="chip green">Free starter</span>}
          {done && <span className="chip teal">Done</span>}
        </div>
        <span className="muted small">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          <div className="small"><strong>Tools:</strong> {w.tools.join(", ")}</div>
          {locked ? (
            <>
              <p style={{ marginTop: 10 }}>{w.focus}</p>
              <p className="muted small">The assignment, mentor, and quiz open when this track launches.</p>
            </>
          ) : (
            <>
              <div className="row small" style={{ marginTop: 10 }}>
                <span className={"chip " + (submitted ? "green" : "")}>{submitted ? "✓ Work submitted" : "Work: to do"}</span>
                <span className={"chip " + (quizPassed ? "green" : "")}>{quizPassed ? "✓ Quiz passed" : "Quiz: to do"}</span>
              </div>

              <div className="panel tint" style={{ marginTop: 12 }}>
                <h4 style={stepTitle}>Step 1: Your assignment</h4>
                <p style={{ margin: "0 0 10px" }}>{assignment}</p>
                {chat.length === 0 && (
                  <button className="btn teal" onClick={() => send("start")} disabled={busy}>{busy ? "Getting your steps..." : "Click here to get started"}</button>
                )}
              </div>

              {chat.length > 0 && (
                <div className="ai-box" ref={boxRef} style={{ maxHeight: 440, overflowY: "auto", whiteSpace: "normal", marginTop: 12 }}>
                  {chat.map((m, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div className="small" style={{ fontWeight: 700 }}>{m.role === "user" ? "You" : mentor}</div>
                      {m.img && <img src={m.img.url} alt="Your upload" style={{ maxHeight: 120, borderRadius: 8, marginTop: 4 }} />}
                      {m.role === "user" ? <p style={{ margin: "4px 0", whiteSpace: "pre-wrap" }}>{m.text}</p> : <RichText text={m.text} />}
                    </div>
                  ))}
                  {busy && <div className="muted small">{mentor} is thinking...</div>}
                  <div className="ai-src">{mentor}, powered by Claude</div>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <textarea
                  className="input"
                  placeholder={waitingForAnswer ? "Type your answer, or ask " + mentor + " a question" : "Ask " + mentor + " a question about this week"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy) send("send"); } }}
                />
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn teal small" onClick={() => send("send")} disabled={busy || (!input.trim() && !photo)}>
                    {busy ? "Thinking..." : photo ? "Check my photo" : waitingForAnswer ? "Send" : "Ask my mentor"}
                  </button>
                  <button className="btn ghost small" onClick={() => send("practice")} disabled={busy}>Practice Q and A</button>
                  {canPhoto(t) && (
                    <label className="btn ghost small" style={{ cursor: "pointer" }}>
                      {photo ? "Photo: " + photo.name : "Add a photo"}
                      <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files[0]; if (f) setPhoto(await readImage(f)); }} />
                    </label>
                  )}
                  {chat.length > 0 && <button className="btn ghost small" onClick={() => { setChat([]); setError(""); }} disabled={busy}>Clear chat</button>}
                </div>
                {photo && <img src={photo.url} alt="Your upload" style={{ maxHeight: 160, borderRadius: 8, marginTop: 10 }} />}
                {error && <div className="err">{error}</div>}
              </div>

              <div className="panel" style={{ marginTop: 14 }}>
                <h4 style={stepTitle}>Step 2: Submit your work</h4>
                <SubmitWork key={key + (rec.submission ? rec.submission.date : "")} t={t} w={w} saved={rec.submission} onSubmit={submitWork} busy={busy} />
              </div>

              <div className="panel" style={{ marginTop: 14 }}>
                <h4 style={stepTitle}>Step 3: Week {w.week} quiz</h4>
                <WeekQuiz t={t} w={w} saved={rec.quiz} onSave={saveQuiz} />
              </div>

              <p className="small muted" style={{ marginTop: 10 }}>This week is marked done when you submit your work and pass the quiz.</p>
            </>
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
