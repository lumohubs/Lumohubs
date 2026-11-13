import React, { useEffect, useRef, useState } from "react";
import { LIVE_TRACKS, SECTORS, trackById, isVocational } from "../data/tracks";
import { askClaude } from "../ai";
import { useLearner, signIn, signOut, saveLearner } from "../learner";
import { Markdown } from "./Markdown";
import { Icon, IconBadge } from "./Icons";

// The live coach. It knows each learner by name, remembers their goal, track, and progress,
// greets them first, and guides them to the next step.

let greetedThisVisit = false;

const CATALOG = LIVE_TRACKS.map((t) => `${t.id}: ${t.name} (tools: ${(t.software || []).join(", ")})`).join("; ");

function nextWeek(progress, trackId) {
  const done = (progress && progress[trackId]) || [];
  for (let w = 1; w <= 6; w++) if (!done.includes(w)) return w;
  return null;
}

const BIZ = "business-systems";

// Business Tools runs alongside every main track, unless the learner tests out.
function bizStatus(l) {
  if (l.bizTools === "tested-out") return "tested-out";
  if (l.trackId === BIZ) return "main";
  return "on";
}

// Quick check to test out of Business Tools. Pass with 4 of 5.
const BIZ_CHECK = [
  { q: "What is Salesforce mostly used for?", a: ["Tracking customers and sales", "Editing photos", "Writing code", "Filing taxes"], c: 0 },
  { q: "On a Monday.com or Asana board, what is a task?", a: ["A chat message", "A piece of work with an owner and a due date", "A type of invoice", "A login page"], c: 1 },
  { q: "In HubSpot, what is a deal?", a: ["A discount code", "A possible sale you are tracking", "A team meeting", "A saved email draft"], c: 1 },
  { q: "What is the best way to ask a coworker a quick question in Slack?", a: ["Email the whole company", "Send a short, clear message to the right person or channel", "Wait for the weekly meeting", "Post it on social media"], c: 1 },
  { q: "In Excel or Google Sheets, what does a pivot table do?", a: ["Changes the font", "Turns many rows into a short summary", "Sends the file to your boss", "Deletes empty cells"], c: 1 },
];

function BizCheck({ onDone, onCancel }) {
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);
  const score = BIZ_CHECK.filter((x, i) => ans[i] === x.c).length;
  function submit() {
    const pass = score >= 4;
    setResult({ pass, score });
    if (pass) onDone();
  }
  return (
    <div className="panel" style={{ marginTop: 10 }}>
      <strong>Quick check: 5 questions</strong>
      <div className="small muted">Get 4 right to skip Business Tools.</div>
      {BIZ_CHECK.map((x, i) => (
        <fieldset key={i} style={{ border: 0, padding: 0, margin: "12px 0 0" }}>
          <legend style={{ fontWeight: 600, marginBottom: 4 }}>{i + 1}. {x.q}</legend>
          {x.a.map((opt, j) => (
            <label key={j} className="small" style={{ display: "block", padding: "3px 0" }}>
              <input type="radio" name={"bc" + i} checked={ans[i] === j} onChange={() => setAns({ ...ans, [i]: j })} disabled={!!result} /> {opt}
            </label>
          ))}
        </fieldset>
      ))}
      {result ? (
        <div style={{ marginTop: 12 }}>
          {result.pass
            ? <strong>You got {result.score} of 5. Nice work! You can skip Business Tools. You can still take it anytime.</strong>
            : <><strong>You got {result.score} of 5.</strong> <span>Business Tools will help you a lot. It runs next to your main track, so it won't slow you down.</span></>}
          <div><button className="btn ghost small" style={{ marginTop: 8 }} onClick={onCancel}>Close</button></div>
        </div>
      ) : (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" disabled={Object.keys(ans).length < 5} onClick={submit}>Check my answers</button>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function daysAgo(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - ts) / 86400000);
}

function buildSystem(l) {
  const t = l.trackId ? trackById(l.trackId) : null;
  const nw = t ? nextWeek(l.progress, t.id) : null;
  const doneCount = t ? ((l.progress || {})[t.id] || []).length : 0;
  const ago = daysAgo(l.lastSeenBefore);
  return [
    "You are Lumo, the personal coach at Lumo Hubs, a training platform that teaches people job skills with AI and connects them to work.",
    "You are warm, upbeat, and direct. Use plain words a 5th grader can read. Keep replies under 120 words. Short paragraphs. Ask only ONE question at a time. Do not use em dashes.",
    `Learner's first name: ${l.name}. Use it.`,
    l.goal ? `Their goal: ${l.goal}.` : "You do not know their goal yet. Find out what they want: a first job, a better job, a career change, start a business, or a new skill.",
    "Lumo Hubs plan: every learner takes Business Systems & Tools (Salesforce, Monday.com, Asana, HubSpot, Slack, Google Workspace, Excel, Copilot) at the same time as their main track. They work on both each week. For trades and vocational learners, explain that these tools help them find customers, book and track jobs, send quotes, and run their own business. Learners who already know the tools can tap 'I already know these' on their plan and pass a 5 question check to skip it.",
    bizStatus(l) === "tested-out" ? "This learner tested out of Business Tools. Do not push it." : bizStatus(l) === "on" ? `Business Tools: ${((l.progress || {})[BIZ] || []).length} of 6 weeks done.` : "",
    t ? `Their main track: ${t.name}. Weeks done: ${doneCount} of 6. ${nw ? "Next up: Week " + nw + "." : isVocational(t) ? "They finished the online basics. They are NOT finished yet: the next step is hands on, in person training. Tell them to tap 'Request my in person spot' on their plan." : "They finished all 6 weeks. Congratulate them and point them to their portfolio and the Talent Network for jobs."}` : "They have not picked a track yet.",
    t && isVocational(t) ? (l.inPerson === "requested" ? "They already requested their in person training spot. The Lumo Hubs team will contact them." : "") : "",
    "Vocational (trades) tracks like Plumbing, Electrical, HVAC, Solar, and Agriculture have two steps: online basics in the app, then required hands on, in person training with an instructor at a Lumo Hubs location or partner site. A learner finishes only after the in person step. Say this clearly when you recommend a trades track.",
    ago != null ? `Their last visit was ${ago === 0 ? "earlier today" : ago + " days ago"}.` : "",
    `Tracks you can recommend (id: name): ${CATALOG}.`,
    "How to guide them: 1) learn their goal and what they already know, 2) recommend ONE or TWO tracks that fit and say why in one line each, 3) once they choose, tell them to press the button to start their week, 4) on later visits, cheer their progress and point to the next week.",
    "Special lines (the app reads these and hides them). When you learn their goal, add a line at the very end: GOAL: <their goal in under 12 words>. When you recommend a track, add a line at the very end for each: TRACK: <track id>. Use exact ids from the list.",
    "Every track teaches the real company software listed with it. When asked about a tool, name the track that teaches it. Recommend a MAIN track that fits their goal; Business Tools comes with it automatically.",
    "The app shows the full list of tracks under this chat, grouped by area, so the learner can browse and pick. When they seem unsure, tell them to look at the list below or name 2 or 3 tracks.",
    "Never make up jobs, pay, or promises. If you do not know, say so.",
  ].filter(Boolean).join(" ");
}

// Pull out GOAL: and TRACK: lines.
function parseReply(text) {
  const goals = [], tracks = [];
  const clean = text.split("\n").filter((line) => {
    const g = line.match(/^\s*\**GOAL:\**\s*(.+)$/i);
    const tr = line.match(/^\s*\**TRACK:\**\s*([a-z0-9-]+)/i);
    if (g) { goals.push(g[1].replace(/\*+$/, "").trim()); return false; }
    if (tr) { if (trackById(tr[1].toLowerCase())) tracks.push(tr[1].toLowerCase()); return false; }
    return true;
  }).join("\n").replace(/\s*[\u2014\u2013]\s*/g, ", ").trim();
  return { clean, goal: goals[0], tracks: Array.from(new Set(tracks)).slice(0, 2) };
}

function SignIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await signIn({ name, email, pin });
    if (r.error) setError(r.error);
    setBusy(false);
  }
  return (
    <form className="panel" onSubmit={submit} style={{ maxWidth: 460 }}>
      <h2 style={{ marginTop: 0 }}>Meet your Lumo coach</h2>
      <p className="muted">Your coach remembers you, your goal, and your progress on any phone or computer.</p>
      <label className="small" htmlFor="g-name">First name</label>
      <input id="g-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" autoComplete="given-name" />
      <label className="small" htmlFor="g-email" style={{ display: "block", marginTop: 10 }}>Email</label>
      <input id="g-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
      <label className="small" htmlFor="g-pin" style={{ display: "block", marginTop: 10 }}>4 number PIN</label>
      <input id="g-pin" className="input" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="1234" />
      <p className="small muted" style={{ marginTop: 6 }}>New here? Pick any 4 numbers and remember them. Coming back? Use the same email and PIN.</p>
      {error && <div className="err">{error}</div>}
      <button className="btn" style={{ marginTop: 12, width: "100%" }} disabled={busy || !email || pin.length !== 4}>{busy ? "One moment..." : "Start"}</button>
    </form>
  );
}

// Everything Lumo Hubs offers, grouped by area, so learners can pick instead of guessing.
function Offer({ onStart, onAsk, busy, currentId }) {
  const [sel, setSel] = useState(null);
  const t = sel ? trackById(sel) : null;
  return (
    <div className="panel" style={{ marginTop: 14 }}>
      <h3 style={{ marginTop: 0 }}>What we offer</h3>
      <p className="small muted" style={{ marginTop: -6 }}>{LIVE_TRACKS.length} free Foundation tracks in {SECTORS.length} areas. Every track teaches the real software companies use. Tap one to see what you learn.</p>
      <div className="panel tint" style={{ marginTop: 10 }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <IconBadge name="Monitor" size={36} index={1} />
          <div style={{ flex: 1 }}>
            <strong>Every student gets Business Tools</strong>
            <div className="small" style={{ marginTop: 4 }}>You learn these next to your main track, even in the trades. They help you get hired, find customers, and run jobs. Already know them? Take a quick check to skip.</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {["Salesforce", "HubSpot", "Monday.com", "Asana", "Slack", "Google Workspace", "Excel", "Microsoft Copilot"].map((x) => <span key={x} className="chip">{x}</span>)}
            </div>
            <button className="btn small" style={{ marginTop: 10 }} onClick={() => setSel("business-systems")}>See this track</button>
          </div>
        </div>
      </div>
      {SECTORS.map((sec) => {
        const list = LIVE_TRACKS.filter((x) => x.sector === sec.id);
        if (!list.length) return null;
        return (
          <div key={sec.id} style={{ marginTop: 12 }}>
            <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{sec.name}</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {list.map((x) => (
                <button key={x.id} className={"btn small " + (sel === x.id ? "" : "ghost")} onClick={() => setSel(sel === x.id ? null : x.id)} aria-pressed={sel === x.id}>
                  <Icon name={x.icon} size={16} /> {x.name}{currentId === x.id ? " (yours)" : ""}
                </button>
              ))}
            </div>
            {t && t.sector === sec.id && (
              <div className="panel tint" style={{ marginTop: 10 }}>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <IconBadge name={t.icon} size={36} />
                  <div style={{ flex: 1 }}>
                    <strong>{t.name}</strong>
                    {t.tagline && <div className="small muted">{t.tagline}</div>}
                    {t.description && <p style={{ margin: "6px 0" }}>{t.description}</p>}
                    {t.software && t.software.length > 0 && (
                      <div style={{ margin: "6px 0" }}>
                        <div className="small" style={{ fontWeight: 600 }}>Tools you will learn</div>
                        <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 4 }}>{t.software.map((x) => <span key={x} className="chip">{x}</span>)}</div>
                      </div>
                    )}
                    <div className="small">{isVocational(t) ? "Step 1: 6 weeks of online basics (first 2 weeks free to try). Step 2: hands on, in person training. You finish after Step 2." : "6 weeks. First 2 weeks free to try."}{t.avgPay ? " Typical pay: " + t.avgPay + "." : ""}</div>
                  </div>
                </div>
                <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
                  <button className="btn teal" onClick={() => onStart(t.id)}>Start this track</button>
                  <button className="btn ghost" disabled={busy} onClick={() => onAsk(t)}>Ask the coach about it</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Guide({ openTrack }) {
  const { learner: l, ready, noStore } = useLearner();
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picks, setPicks] = useState([]);
  const [showOffer, setShowOffer] = useState(false);
  const [checking, setChecking] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => { if (l) setChat(l.chat || []); }, [l && l.email]);
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [chat, busy]);

  async function ask(history, hidden) {
    setBusy(true); setError("");
    const msgs = history.slice(-12).map((m) => ({ role: m.role, content: m.text }));
    if (hidden) msgs.push({ role: "user", content: hidden });
    // The chat must start with the learner speaking.
    if (msgs.length && msgs[0].role === "assistant") msgs.unshift({ role: "user", content: "Hi" });
    const r = await askClaude({ system: buildSystem(l), messages: msgs, maxTokens: 1500 });
    setBusy(false);
    if (r.error) { setError(r.error); return null; }
    const p = parseReply(r.text);
    const patch = {};
    if (p.goal) patch.goal = p.goal;
    if (p.tracks.length) setPicks(p.tracks);
    const next = [...history, { role: "assistant", text: p.clean, at: Date.now() }];
    setChat(next);
    saveLearner({ ...patch, chat: next });
    return next;
  }

  // The coach speaks first, once per visit.
  useEffect(() => {
    if (!l || greetedThisVisit) return;
    greetedThisVisit = true;
    const isNew = !(l.chat && l.chat.length);
    const hidden = isNew
      ? `(I just signed up. Greet me by name, say in one line what you can do for me, say that every Lumo student learns business tools like Salesforce next to their main track, tell me I can browse all the tracks in the list below the chat, and ask what I want to get out of Lumo Hubs.)`
      : `(I just came back. Welcome me back by name, remind me where I left off in one line, and tell me the next step.)`;
    ask(l.chat || [], hidden);
  }, [l]);

  async function send(text) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    const next = [...chat, { role: "user", text: t, at: Date.now() }];
    setChat(next); setInput("");
    saveLearner({ chat: next, asked: 1 });
    const done = await ask(next);
    if (!done) { setChat(chat); setInput(t); }
  }

  function chooseTrack(id) {
    saveLearner({ trackId: id, bizTools: l.bizTools === "tested-out" ? "tested-out" : "on", event: "picked " + id });
    setPicks([]);
    openTrack(id);
  }

  if (!ready) return <div className="panel muted">Loading your coach...</div>;
  if (noStore) return <div className="panel"><h2 style={{ marginTop: 0 }}>Your coach is almost ready</h2><p className="muted">The Lumo Hubs team is turning on saving. Try again soon.</p></div>;
  if (!l) return <SignIn />;

  const t = l.trackId ? trackById(l.trackId) : null;
  const nw = t ? nextWeek(l.progress, t.id) : null;
  const biz = bizStatus(l);
  const bizWeek = nextWeek(l.progress, BIZ);
  const quick = !l.goal
    ? ["Get my first job", "Switch careers", "Start a business", "Learn AI for my job"]
    : !t ? ["Which track fits me?", "What jobs pay well?"] : ["What do I do this week?", "Quiz me", "I'm stuck"];

  return (
    <div>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Hi {l.name}</h2>
          <div className="small muted">{t ? `${t.name}: ${((l.progress || {})[t.id] || []).length} of 6 weeks done` : "Let's find your track"}{l.goal ? ` · Goal: ${l.goal}` : ""}</div>
        </div>
        <button className="btn ghost small" onClick={() => { greetedThisVisit = false; setChat([]); signOut(); }}>Sign out</button>
      </div>

      {t && (
        <div className="panel tint" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>Your plan</h3>
          <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
            <span><strong>Main track:</strong> {t.name}, {nw ? (isVocational(t) ? "online basics, Week " + nw : "Week " + nw) : isVocational(t) ? "online basics done" : "done"}</span>
            {nw ? <button className="btn teal small" onClick={() => openTrack(t.id)}>Continue Week {nw}</button> : !isVocational(t) && <span className="chip green">Finished</span>}
          </div>
          {isVocational(t) && (
            <div className="small" style={{ marginTop: 6 }}>
              {nw
                ? "Step 1 is online basics. Step 2 is hands on, in person training. You finish after Step 2."
                : l.inPerson === "requested"
                  ? <span className="chip green">In person spot requested. We will contact you to set it up.</span>
                  : <span className="row" style={{ gap: 8, flexWrap: "wrap" }}><strong>Next: hands on, in person training (required to finish).</strong><button className="btn small" onClick={() => saveLearner({ inPerson: "requested", event: "requested in person " + t.id })}>Request my in person spot</button></span>}
            </div>
          )}
          {biz === "on" && (
            <div className="row between" style={{ flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <span><strong>Business Tools:</strong> {bizWeek ? "Week " + bizWeek : "done"} <span className="small muted">(Salesforce, HubSpot, Monday.com and more)</span></span>
              <div className="row" style={{ gap: 8 }}>
                {bizWeek ? <button className="btn small" onClick={() => openTrack(BIZ)}>Continue Week {bizWeek}</button> : <span className="chip green">Finished</span>}
                {bizWeek === 1 && !checking && <button className="btn ghost small" onClick={() => setChecking(true)}>I already know these</button>}
              </div>
            </div>
          )}
          {biz === "tested-out" && (
            <div className="small muted" style={{ marginTop: 10 }}>Business Tools: you tested out. <button className="btn ghost small" onClick={() => saveLearner({ bizTools: "on", event: "rejoined business tools" })}>Take it anyway</button></div>
          )}
          {checking && <BizCheck onDone={() => saveLearner({ bizTools: "tested-out", event: "tested out of business tools" })} onCancel={() => setChecking(false)} />}
        </div>
      )}

      <div className="ai-box" ref={boxRef} style={{ maxHeight: 460, minHeight: 200, overflowY: "auto", whiteSpace: "normal" }} aria-live="polite">
        {chat.map((m, i) => (
          <div key={i} style={{ margin: "0 0 12px", textAlign: m.role === "user" ? "end" : "start" }}>
            <div className="small muted">{m.role === "user" ? "You" : "Lumo coach"}</div>
            {m.role === "user" ? <div>{m.text}</div> : <Markdown text={m.text} />}
          </div>
        ))}
        {busy && <div className="muted small">Lumo coach is typing...</div>}
      </div>

      {picks.length > 0 && (
        <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
          {picks.map((id) => <button key={id} className="btn" onClick={() => chooseTrack(id)}>Start {trackById(id).name}</button>)}
        </div>
      )}

      {error && <div className="err">{error}</div>}

      <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
        {quick.map((q) => <button key={q} className="btn ghost small" onClick={() => send(q)} disabled={busy}>{q}</button>)}
      </div>

      <form className="row" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="input" style={{ flex: 1, minWidth: 0, width: "auto" }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message to your coach" aria-label="Message to your coach" />
        <button className="btn" disabled={busy || !input.trim()}><Icon name="Rocket" size={16} /> Send</button>
      </form>

      {t && !showOffer ? (
        <button className="btn ghost small" style={{ marginTop: 14 }} onClick={() => setShowOffer(true)}>See all tracks we offer</button>
      ) : (
        <Offer currentId={t && t.id} busy={busy} onStart={chooseTrack} onAsk={(x) => { send("Tell me about the " + x.name + " track. Is it a good fit for me?"); setPicks([x.id]); }} />
      )}
    </div>
  );
}
