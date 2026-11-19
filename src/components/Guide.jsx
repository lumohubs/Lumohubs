import React, { useEffect, useRef, useState } from "react";
import { LIVE_TRACKS, SECTORS, trackById, isVocational } from "../data/tracks";
import { askClaude, shrinkImage } from "../ai";
import { useLearner, signIn, signOut, saveLearner } from "../learner";
import { Markdown } from "./Markdown";
import { Icon, IconBadge } from "./Icons";
import { WeekQuiz, LEVELS, levelOf, LEVEL_DEPTH } from "./Work";

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

// Check to test out of Business Tools. 10 real work questions. Pass with 8 of 10.
// Answers are shuffled each time, and a failed try locks the check for 24 hours.
const PASS = 8;
const RETRY_HOURS = 24;
const BIZ_CHECK = [
  { q: "In Salesforce, you convert a qualified Lead. What does Salesforce usually create?",
    ok: "An Account and a Contact, and an Opportunity if you choose",
    no: ["A Case and a Task", "A Campaign and a Report", "A new User login"] },
  { q: "In Salesforce, what is the difference between a Report and a Dashboard?",
    ok: "A Report pulls a list of records with filters. A Dashboard shows charts built from Reports.",
    no: ["They are the same thing with different names", "A Dashboard is used to enter new data and a Report is used to delete it", "A Report is only for admins and a Dashboard is only for sales reps"] },
  { q: "In HubSpot, what does a contact's lifecycle stage tell you?",
    ok: "How close the contact is to becoming a customer",
    no: ["How long the contact has been in the database", "Which email template the contact last opened", "The contact's age group"] },
  { q: "In HubSpot, what is an MQL?",
    ok: "A lead that marketing thinks is ready to hand to sales",
    no: ["A customer who has already paid", "A lead that sales has rejected", "A list of email addresses bought from a vendor"] },
  { q: "In Asana or Monday.com, Task B cannot start until Task A is done. Which feature shows this?",
    ok: "A dependency",
    no: ["A subtask", "A tag", "A private board"] },
  { q: "On a Monday.com board, \"When Status changes to Done, notify the manager\" is an example of what?",
    ok: "An automation (a trigger and an action)",
    no: ["An integration with another app", "A formula column", "A dashboard widget"] },
  { q: "Your 12 person project team made a decision everyone needs to find later. What is the best way to share it in Slack?",
    ok: "Post it in the project channel and pin it",
    no: ["Send each person a direct message", "Post it in #general for the whole company", "Say it in a huddle and do not write it down"] },
  { q: "You want a coworker to suggest changes to your Google Doc without changing your text. Which access do you give?",
    ok: "Commenter, so they can comment and suggest",
    no: ["Editor", "Viewer", "Owner"] },
  { q: "In Excel, what does =SUMIFS(C:C, A:A, \"East\", B:B, \">100\") do?",
    ok: "Adds the numbers in column C where column A is East and column B is more than 100",
    no: ["Counts the rows where column A is East", "Adds all of column C, then adds 100", "Finds the first row where column B is more than 100"] },
  { q: "Copilot wrote a reply to a customer complaint. What should you do before you send it?",
    ok: "Check every fact, number, and promise, fix the tone, and remove private data",
    no: ["Send it right away because AI does not make mistakes", "Only check the spelling", "Add more AI text so it looks longer"] },
];

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

function BizCheck({ onPass, onFail, onCancel }) {
  const [qs] = useState(() => shuffle(BIZ_CHECK).map((x) => ({ q: x.q, ok: x.ok, opts: shuffle([x.ok, ...x.no]) })));
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);
  function submit() {
    const score = qs.filter((x, i) => ans[i] === x.ok).length;
    const pass = score >= PASS;
    setResult({ pass, score });
    if (pass) onPass(); else onFail();
  }
  return (
    <div className="panel" style={{ marginTop: 10 }}>
      <strong>Business Tools check: 10 questions</strong>
      <div className="small muted">Get {PASS} of 10 right to skip Business Tools. If you do not pass, you can try again in {RETRY_HOURS} hours.</div>
      {qs.map((x, i) => (
        <fieldset key={i} style={{ border: 0, padding: 0, margin: "12px 0 0" }}>
          <legend style={{ fontWeight: 600, marginBottom: 4 }}>{i + 1}. {x.q}</legend>
          {x.opts.map((opt) => (
            <label key={opt} className="small" style={{ display: "block", padding: "3px 0" }}>
              <input type="radio" name={"bc" + i} checked={ans[i] === opt} onChange={() => setAns({ ...ans, [i]: opt })} disabled={!!result} /> {opt}
            </label>
          ))}
        </fieldset>
      ))}
      {result ? (
        <div style={{ marginTop: 12 }}>
          {result.pass
            ? <strong>You got {result.score} of 10. Great job! You can skip Business Tools. You can still take it anytime.</strong>
            : <><strong>You got {result.score} of 10.</strong> <span>You need {PASS} to skip. Business Tools runs next to your main track, so keep going. You can try the check again in {RETRY_HOURS} hours.</span></>}
          <div><button className="btn ghost small" style={{ marginTop: 8 }} onClick={onCancel}>Close</button></div>
        </div>
      ) : (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" disabled={Object.keys(ans).length < qs.length} onClick={submit}>Check my answers</button>
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
    "You are warm, upbeat, and direct. Use plain words a 5th grader can read. Keep replies under 120 words. When they send a photo of a problem like a leak, you may use up to 200 words: name the problem, give the first safety step, then give 2 or 3 short numbered fix steps. Short paragraphs. Ask only ONE question at a time. Do not use em dashes.",
    `Learner's first name: ${l.name}. Use it.`,
    `${LEVEL_DEPTH[levelOf(l)]} Match every answer to this level.${levelOf(l) < 3 ? " If they say it feels too easy, tell them to tap 'Take the level up check' on their plan. Everyone moves through all 3 levels: Beginner, Intermediate, Advanced." : ""}`,
    l.about ? `About them, in their own words: ${l.about}.` : "",
    l.goal ? `Their goal: ${l.goal}.` : "You do not know their goal yet. Find out what they want: a first job, a better job, a career change, start a business, or a new skill.",
    "Lumo Hubs plan: every learner takes Business Systems & Tools (Salesforce, Monday.com, Asana, HubSpot, Slack, Google Workspace, Excel, Copilot) at the same time as their main track. They work on both each week. For trades and vocational learners, explain that these tools help them find customers, book and track jobs, send quotes, and run their own business. Learners who already know the tools can tap 'I already know these' on their plan and pass a 10 question check to skip it.",
    bizStatus(l) === "tested-out" ? "This learner tested out of Business Tools. Do not push it." : bizStatus(l) === "on" ? `Business Tools: ${((l.progress || {})[BIZ] || []).length} of 6 weeks done.` : "",
    t ? `Their main track: ${t.name}. Weeks done: ${doneCount} of 6. ${nw ? "Next up: Week " + nw + "." : isVocational(t) ? "They finished the online basics. They are NOT finished yet: the next step is hands on, in person training. Tell them to tap 'Request my in person spot' on their plan." : "They finished all 6 weeks. Congratulate them and point them to their portfolio and the Talent Network for jobs."}` : "They have not picked a track yet.",
    t && isVocational(t) ? (l.inPerson === "requested" ? "They already requested their in person training spot. The Lumo Hubs team will contact them." : "") : "",
    "Hands on tracks (all trades like Plumbing, Electrical, HVAC, Solar, and Agriculture, plus Healthcare and Medical Careers) have two steps: online basics in the app, then required in person training at a Lumo Hubs location or partner site, such as a partner hospital or clinic for healthcare. The AI teaches the basics online. In person, an instructor goes over those basics with the learner, answers questions, and then takes them further with real equipment. A learner finishes only after the in person step. Say this clearly when you recommend one of these tracks.",
    ago != null ? `Their last visit was ${ago === 0 ? "earlier today" : ago + " days ago"}.` : "",
    `Tracks you can recommend (id: name): ${CATALOG}.`,
    "How to guide them: 1) learn their goal and what they already know, 2) recommend ONE or TWO tracks that fit and say why in one line each, 3) once they choose, tell them to press the button to start their week, 4) on later visits, cheer their progress and point to the next week.",
    "Special lines (the app reads these and hides them). When you learn their goal, add a line at the very end: GOAL: <their goal in under 12 words>. When you recommend a track, add a line at the very end for each: TRACK: <track id>. Use exact ids from the list.",
    "Every track teaches the real company software listed with it. When asked about a tool, name the track that teaches it. Recommend a MAIN track that fits their goal; Business Tools comes with it automatically.",
    "The app shows the full list of tracks under this chat, grouped by area, so the learner can browse and pick. When they seem unsure, tell them to look at the list below or name 2 or 3 tracks.",
    "Never show track ids to the learner. In your message, use only track names like Marketing & Social Media. Ids go only in the TRACK: lines.",
    "Button names in the app: 'Continue Week N' on the plan, 'Start this track' and 'See all tracks we offer' in the track list. Use these exact names.",
    "When the learner asks to see all choices, tell them to tap 'See all tracks we offer' below the chat, then name 2 or 3 that fit their goal.",
    "Never make up jobs, pay, or promises. If you do not know, say so.",
    "If the learner sends a photo, look at it closely, say what you see in one line, then help with their question about it. If the photo is not clear, ask for a closer or brighter one.",
    "Follow up ideas: at the very end of EVERY reply, add 2 or 3 lines, each starting with NEXT: and then a short question the learner could ask you next (under 10 words, in their voice, like 'How do I price my first job?'). Make them go a little deeper or more advanced than your answer. The app shows these as buttons and hides the NEXT: lines.",
  ].filter(Boolean).join(" ");
}

// Removes "track-id: " labels the model sometimes puts before a track name.
// Only at the start of a line or list item, so normal sentences are not touched.
const ID_LABEL = new RegExp("^(\\s*(?:[-*\\u2022]\\s+|\\d+[.)]\\s+)?)(?:\\*\\*)?(?:" + LIVE_TRACKS.map((t) => t.id.replace(/[-]/g, "\\-")).join("|") + ")\\s*:\\s*(?:\\*\\*)?\\s*", "gim");

// Also catch ids anywhere in a line, like "**media-youtube**: YouTube ...".
const ID_ANYWHERE = new RegExp("(?:\\*\\*)?\\b(?:" + LIVE_TRACKS.map((t) => t.id.replace(/[-]/g, "\\-")).join("|") + ")\\b(?:\\*\\*)?\\s*:\\s*", "gi");

// Pull out GOAL: and TRACK: lines.
function parseReply(text) {
  const goals = [], tracks = [], next = [];
  const clean = text.split("\n").filter((line) => {
    const g = line.match(/^\s*\**GOAL:\**\s*(.+)$/i);
    const tr = line.match(/^\s*\**TRACK:\**\s*([a-z0-9-]+)/i);
    const nx = line.match(/^\s*\**NEXT:\**\s*(.+)$/i);
    if (nx) { const q = nx[1].replace(/\*+$/, "").replace(/^["']|["']$/g, "").trim(); if (q && q.length < 90) next.push(q); return false; }
    if (g) { goals.push(g[1].replace(/\*+$/, "").trim()); return false; }
    if (tr) { if (trackById(tr[1].toLowerCase())) tracks.push(tr[1].toLowerCase()); return false; }
    return true;
  }).join("\n").replace(/\s*[\u2014\u2013]\s*/g, ", ").replace(ID_LABEL, "$1").replace(ID_ANYWHERE, "").trim();
  return { clean, goal: goals[0], tracks: Array.from(new Set(tracks)).slice(0, 2), next: Array.from(new Set(next)).slice(0, 3) };
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
                    <div className="small">{isVocational(t) ? "Step 1: 6 weeks of online basics with your AI mentor (first 2 weeks free to try). Step 2: in person, an instructor goes over the basics with you and takes you further with real equipment. You finish after Step 2." : "6 weeks. First 2 weeks free to try."}{t.avgPay ? " Typical pay: " + t.avgPay + "." : ""}</div>
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

// Round profile photo, or the first letter of the name if there is no photo.
export function Avatar({ l, size = 44 }) {
  const style = { width: size, height: size, borderRadius: "50%", flex: "0 0 auto", objectFit: "cover" };
  return l.photo
    ? <img src={l.photo} alt="" style={style} />
    : <span aria-hidden="true" style={{ ...style, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--teal-soft)", color: "var(--teal)", fontWeight: 700, fontSize: size * 0.45 }}>{(l.name || "?").slice(0, 1).toUpperCase()}</span>;
}

// "My profile": the learner can change their name, goal, a short about me, and their photo.
export function ProfileEditor({ l, onClose }) {
  const [name, setName] = useState(l.name || "");
  const [goal, setGoal] = useState(l.goal || "");
  const [about, setAbout] = useState(l.about || "");
  const [photo, setPhoto] = useState(l.photo || "");
  const [msg, setMsg] = useState("");
  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { setMsg("Please pick a photo."); return; }
    try { const img = await shrinkImage(f, 200, 0.8); setPhoto(img.url); setMsg(""); } catch { setMsg("That photo did not work. Try another one."); }
  }
  function save(e) {
    e.preventDefault();
    if (!name.trim()) { setMsg("Please enter your first name."); return; }
    saveLearner({ name: name.trim(), goal: goal.trim(), about: about.trim(), photo, event: "edited profile" });
    setMsg("Saved!");
    setTimeout(onClose, 700);
  }
  return (
    <form className="panel" style={{ marginBottom: 12 }} onSubmit={save}>
      <h3 style={{ marginTop: 0 }}>My profile</h3>
      <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar l={{ name, photo }} size={64} />
        <label className="btn ghost small" style={{ cursor: "pointer" }}>
          <Icon name="Camera" size={16} /> {photo ? "Change photo" : "Add a photo"}
          <input type="file" accept="image/*" hidden onChange={pick} />
        </label>
        {photo && <button type="button" className="btn ghost small" onClick={() => setPhoto("")}>Remove photo</button>}
      </div>
      <label className="small" htmlFor="p-name" style={{ display: "block", marginTop: 12 }}>First name</label>
      <input id="p-name" className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
      <label className="small" htmlFor="p-goal" style={{ display: "block", marginTop: 10 }}>My goal</label>
      <input id="p-goal" className="input" value={goal} maxLength={300} onChange={(e) => setGoal(e.target.value)} placeholder="For example: get my first tech job" />
      <label className="small" htmlFor="p-about" style={{ display: "block", marginTop: 10 }}>About me <span className="muted">(your coach reads this)</span></label>
      <textarea id="p-about" className="input" rows={3} value={about} maxLength={300} onChange={(e) => setAbout(e.target.value)} placeholder="Where you live, what you do now, what you already know" />
      <div className="small muted" style={{ marginTop: 6 }}>Your email ({l.email}) is how you sign in, so it stays the same.</div>
      {msg && <div className={msg === "Saved!" ? "chip green" : "err"} style={{ marginTop: 8 }}>{msg}</div>}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn">Save</button>
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// A short help guide, written for testers and new learners.
function HelpGuide({ open }) {
  return (
    <details className="panel" style={{ marginBottom: 12 }} open={open}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>How to use Lumo (quick help)</summary>
      <ol style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.6 }}>
        <li><strong>Talk to your coach.</strong> Type a question in the box at the bottom and tap <strong>Send</strong>. The coach answers right here. Tap a button under <strong>Ask next</strong> to go deeper.</li>
        <li><strong>Send a photo.</strong> Tap the <strong>camera</strong> next to the message box to show your coach a problem, like a leak or an error on your screen.</li>
        <li><strong>Levels.</strong> Everyone starts at Beginner and moves up to Intermediate, then Advanced. On <strong>Your plan</strong>, tap <strong>Take the level up check</strong>: 10 questions, 8 right to move up. Your coach and quizzes get harder at each level.</li>
        <li><strong>Your profile.</strong> Tap <strong>My profile</strong> at the top to change your name, goal, about me, or photo.</li>
        <li><strong>New line on a phone:</strong> the Enter key starts a new line. Tap <strong>Send</strong> when you are done. On a computer, press Enter to send and Shift + Enter for a new line.</li>
        <li><strong>Pick a track.</strong> Tap <strong>See all tracks we offer</strong> under the chat. Tap a track to see what you learn, then tap <strong>Start this track</strong>.</li>
        <li><strong>Do your week.</strong> On <strong>Your plan</strong>, tap <strong>Continue Week</strong>. Each week has work to submit, a 10 question quiz, and a written check. Already know a week? Tap <strong>Test out of Week</strong> and pass 8 of 10 to skip it.</li>
        <li><strong>Business Tools</strong> (Salesforce, HubSpot, Excel and more) run next to your main track. Already know them? Tap <strong>I already know these</strong> to take a check.</li>
        <li><strong>Come back anytime.</strong> Use the <strong>same email and PIN</strong> every time. Your coach and your chat are saved to that email on any phone or computer.</li>
        <li><strong>Stuck?</strong> Tap <strong>I'm stuck</strong> or ask the coach. You can also message the Lumo Hubs team.</li>
      </ol>
    </details>
  );
}

// Phones and tablets: Enter makes a new line. Computers: Enter sends, Shift + Enter makes a new line.
const isTouch = () => {
  try { return window.matchMedia("(pointer: coarse)").matches; } catch { return false; }
};

// Level up check: 10 questions at the NEXT level, 8 right to move up, 24 hour wait after a miss.
function LevelCheck({ l, t, onClose }) {
  const lv = levelOf(l);
  const next = lv + 1;
  const w = { week: "L" + next, title: LEVELS[next - 1] + " level check", focus: "Everything a strong " + LEVELS[next - 1].toLowerCase() + " learner in " + t.name + " should know and be able to do on the job.", tools: t.software || [] };
  return (
    <div className="panel" style={{ marginTop: 10 }}>
      <strong>Level up check: {LEVELS[lv - 1]} to {LEVELS[next - 1]}</strong>
      <div className="small muted" style={{ marginBottom: 8 }}>10 questions at the {LEVELS[next - 1]} level. Get 8 right to move up. If you miss, you can try again in {RETRY_HOURS} hours.</div>
      <WeekQuiz t={t} w={w} level={next} label={"Start the " + LEVELS[next - 1] + " check"} saved={null}
        onSave={(q) => {
          if (q.passed) saveLearner({ level: next, event: "leveled up to " + LEVELS[next - 1] });
          else saveLearner({ levelFailedAt: Date.now(), event: "missed level check " + LEVELS[next - 1] });
        }} />
      <button className="btn ghost small" style={{ marginTop: 8 }} onClick={onClose}>Close</button>
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
  const [showOffer, setShowOffer] = useState(null); // null = default (open until they pick a track)
  const [checking, setChecking] = useState(false);
  const [nexts, setNexts] = useState([]); // follow up questions the coach suggests
  const [photo, setPhoto] = useState(null); // photo waiting to be sent to the coach
  const [editing, setEditing] = useState(false); // "My profile" open
  const [leveling, setLeveling] = useState(false); // level up check open
  const boxRef = useRef(null);
  const lastRef = useRef(null);
  const offerRef = useRef(null);

  useEffect(() => { if (l) setChat(l.chat || []); }, [l && l.email]);
  // When the coach answers, jump to the START of the answer so nobody has to scroll up.
  // While the learner types or waits, keep the newest line in view.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const last = chat[chat.length - 1];
    if (!busy && last && last.role === "assistant" && lastRef.current) {
      box.scrollTop = Math.max(0, lastRef.current.offsetTop - 8);
      const r = box.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.6) {
        try { box.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { box.scrollIntoView(); }
      }
    } else {
      box.scrollTop = box.scrollHeight;
    }
  }, [chat, busy]);

  async function ask(history, hidden, image) {
    setBusy(true); setError(""); setNexts([]);
    const msgs = history.slice(-12).map((m) => ({ role: m.role, content: m.text }));
    // A photo goes only with the newest message, so older photos are not sent again.
    if (image && msgs.length) {
      const last = msgs[msgs.length - 1];
      last.content = [{ type: "image", source: { type: "base64", media_type: image.type, data: image.data } }, { type: "text", text: last.content || "What do you see in this photo?" }];
    }
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
    setNexts(p.next);
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
    const typed = (text ?? input).trim();
    const img = text == null ? photo : null;
    if ((!typed && !img) || busy) return;
    const t = typed || "Please look at my photo and help me.";
    // The chat keeps a short note that a photo was sent. The photo itself is not stored.
    const shown = img ? "[Photo sent] " + t : t;
    const next = [...chat, { role: "user", text: shown, at: Date.now(), ...(img ? { thumb: img.url } : {}) }];
    setChat(next); setInput(""); setPhoto(null);
    saveLearner({ chat: next, asked: 1 });
    const done = await ask(next, null, img);
    if (!done) { setChat(chat); setInput(typed); setPhoto(img); }
  }

  async function pickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { setError("Please pick a photo."); return; }
    try { setPhoto(await shrinkImage(f, 1024, 0.8)); setError(""); } catch { setError("That photo did not work. Try another one."); }
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
  const waitMs = l.bizCheckFailedAt ? l.bizCheckFailedAt + RETRY_HOURS * 3600000 - Date.now() : 0;
  const locked = waitMs > 0 ? Math.ceil(waitMs / 3600000) : 0;
  const lvWait = l.levelFailedAt ? l.levelFailedAt + RETRY_HOURS * 3600000 - Date.now() : 0;
  const lvLocked = lvWait > 0 ? Math.ceil(lvWait / 3600000) : 0;
  const quick = !l.goal
    ? ["Get my first job", "Switch careers", "Start a business", "Learn AI for my job"]
    : !t ? ["Which track fits me?", "What jobs pay well?"] : ["What do I do this week?", "Quiz me", "I'm stuck"];
  const offerOpen = showOffer === null ? false : showOffer;

  return (
    <div>
      <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <Avatar l={l} />
          <div>
            <h2 style={{ margin: 0 }}>Hi {l.name}</h2>
            <div className="small muted">{t ? `${t.name}: ${((l.progress || {})[t.id] || []).length} of 6 weeks done` : "Let's find your track"}{l.goal ? ` · Goal: ${l.goal}` : ""}</div>
            <span className="chip teal" style={{ marginTop: 4 }}>Level {levelOf(l)}: {LEVELS[levelOf(l) - 1]}</span>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost small" onClick={() => setEditing(!editing)} aria-expanded={editing}>My profile</button>
          <button className="btn ghost small" onClick={() => { greetedThisVisit = false; setChat([]); signOut(); }}>Sign out</button>
        </div>
      </div>

      {editing && <ProfileEditor l={l} onClose={() => setEditing(false)} />}

      <HelpGuide open={false} />

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
                ? "Step 1 is online basics with your AI mentor. Step 2 is in person: an instructor goes over the basics with you, then takes you further. You finish after Step 2."
                : l.inPerson === "requested"
                  ? <span className="chip green">In person spot requested. We will contact you to set it up.</span>
                  : <span className="row" style={{ gap: 8, flexWrap: "wrap" }}><strong>Next: hands on, in person training (required to finish).</strong><button className="btn small" onClick={() => saveLearner({ inPerson: "requested", event: "requested in person " + t.id })}>Request my in person spot</button></span>}
            </div>
          )}
          <div className="row between" style={{ flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <span><strong>Your level:</strong> {LEVELS[levelOf(l) - 1]} <span className="small muted">({levelOf(l)} of 3. Everyone does all 3 levels.)</span></span>
            {levelOf(l) < 3
              ? (lvLocked ? <span className="small muted">Try the level check again in {lvLocked} hours</span>
                : !leveling && <button className="btn small" onClick={() => setLeveling(true)}>Take the level up check</button>)
              : <span className="chip green">Top level</span>}
          </div>
          {leveling && levelOf(l) < 3 && <LevelCheck l={l} t={t} onClose={() => setLeveling(false)} />}
          {biz === "on" && (
            <div className="row between" style={{ flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <span><strong>Business Tools:</strong> {bizWeek ? "Week " + bizWeek : "done"} <span className="small muted">(Salesforce, HubSpot, Monday.com and more)</span></span>
              <div className="row" style={{ gap: 8 }}>
                {bizWeek ? <button className="btn small" onClick={() => openTrack(BIZ)}>Continue Week {bizWeek}</button> : <span className="chip green">Finished</span>}
                {bizWeek === 1 && !checking && (locked
                  ? <span className="small muted">Try the check again in {locked} hours</span>
                  : <button className="btn ghost small" onClick={() => setChecking(true)}>I already know these</button>)}
              </div>
            </div>
          )}
          {biz === "tested-out" && (
            <div className="small muted" style={{ marginTop: 10 }}>Business Tools: you tested out. <button className="btn ghost small" onClick={() => saveLearner({ bizTools: "on", event: "rejoined business tools" })}>Take it anyway</button></div>
          )}
          {checking && <BizCheck onPass={() => saveLearner({ bizTools: "tested-out", event: "tested out of business tools" })} onFail={() => saveLearner({ bizCheckFailedAt: Date.now(), event: "failed business tools check" })} onCancel={() => setChecking(false)} />}
        </div>
      )}

      <div className="ai-box" ref={boxRef} style={{ position: "relative", maxHeight: 460, minHeight: 200, overflowY: "auto", whiteSpace: "normal" }} aria-live="polite">
        {chat.map((m, i) => (
          <div key={i} ref={i === chat.length - 1 ? lastRef : null} style={{ margin: "0 0 12px", textAlign: m.role === "user" ? "end" : "start" }}>
            <div className="small muted">{m.role === "user" ? "You" : "Lumo coach"}</div>
            {m.thumb && <img src={m.thumb} alt="Photo you sent" style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, display: "inline-block", marginBottom: 4 }} />}
            {m.role === "user" ? <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div> : <Markdown text={m.text} />}
          </div>
        ))}
        {busy && <div className="muted small">Lumo coach is typing...</div>}
      </div>

      {picks.length > 0 && (
        <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
          {picks.map((id) => <button key={id} className="btn" onClick={() => chooseTrack(id)}>Start {trackById(id).name}</button>)}
        </div>
      )}

      {!busy && nexts.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Ask next</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {nexts.map((q) => <button key={q} className="btn ghost small" onClick={() => send(q)}>{q}</button>)}
            {t && nw && <button className="btn teal small" onClick={() => openTrack(t.id)}>Learn more in Week {nw}</button>}
          </div>
        </div>
      )}

      {error && <div className="err">{error}</div>}

      <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
        {quick.map((q) => <button key={q} className="btn ghost small" onClick={() => send(q)} disabled={busy}>{q}</button>)}
      </div>

      {photo && (
        <div className="row" style={{ marginTop: 10, gap: 8, alignItems: "center" }}>
          <img src={photo.url} alt="Photo ready to send" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
          <span className="small">Photo ready. Add a question if you like, then tap Send.</span>
          <button type="button" className="btn ghost small" onClick={() => setPhoto(null)}>Remove</button>
        </div>
      )}

      <form className="row" style={{ marginTop: 10, alignItems: "flex-end" }} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label className="btn ghost" style={{ cursor: "pointer", padding: "10px 12px" }} title="Send a photo to your coach">
          <Icon name="Camera" size={18} label="Add a photo" />
          <input type="file" accept="image/*" hidden onChange={pickPhoto} disabled={busy} />
        </label>
        <textarea
          className="input"
          rows={2}
          style={{ flex: 1, minWidth: 0, width: "auto", minHeight: 48, maxHeight: 160, resize: "vertical" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Computers: Enter sends, Shift + Enter is a new line. Phones: Enter is always a new line.
            if (e.key === "Enter" && !e.shiftKey && !isTouch() && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
          }}
          enterKeyHint="enter"
          placeholder="Type a message to your coach"
          aria-label="Message to your coach"
        />
        <button className="btn" disabled={busy || (!input.trim() && !photo)}><Icon name="Rocket" size={16} /> Send</button>
      </form>

      <button
        className="btn ghost small"
        style={{ marginTop: 14 }}
        aria-expanded={offerOpen}
        onClick={() => {
          const opening = !offerOpen;
          setShowOffer(opening);
          if (opening) setTimeout(() => { try { offerRef.current && offerRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {} }, 50);
        }}
      >
        {offerOpen ? "Hide the track list" : "See all tracks we offer"}
      </button>
      {offerOpen && (
        <div ref={offerRef}>
          <Offer currentId={t && t.id} busy={busy} onStart={chooseTrack} onAsk={(x) => { send("Tell me about the " + x.name + " track. Is it a good fit for me?"); setPicks([x.id]); }} />
        </div>
      )}
    </div>
  );
}
