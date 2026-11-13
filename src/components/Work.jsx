import React, { useEffect, useState } from "react";
import { trackById } from "../data/tracks";
import { askClaude } from "../ai";
import { Icon } from "./Icons";

// Student work saves in this browser for now (no logins yet).
// Shape: { weeks: { "trackId:week": { submission, quiz } }, portfolio: [items] }
const KEY = "lh-work";
const MAX_FILE = 3 * 1024 * 1024; // 3 MB per file
const MAX_FILES = 3;

function readStore() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { weeks: d.weeks || {}, portfolio: d.portfolio || [] };
  } catch {
    return { weeks: {}, portfolio: [] };
  }
}

export function useWork() {
  const [work, setWork] = useState(readStore);
  useEffect(() => {
    const f = () => setWork(readStore());
    window.addEventListener("lh-work", f);
    return () => window.removeEventListener("lh-work", f);
  }, []);
  // Returns an error message, or null when saved.
  const update = (fn) => {
    const next = fn(readStore());
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return "This device is out of space for files. Try a smaller file, or paste a link instead.";
    }
    setWork(next);
    window.dispatchEvent(new Event("lh-work"));
    return null;
  };
  return [work, update];
}

export const weekKey = (t, w) => t.id + ":" + w.week;
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function assignmentFor(t, w) {
  if (w.assignment) return w.assignment;
  if (w.week === 6) {
    return "Final project: " + w.focus + " Upload your project, write a short summary of what you did, and share the results. This goes in your portfolio for employers to see.";
  }
  return w.focus + " " + (w.ai || "") + " When you finish, submit a short write up of what you did and what you learned, plus a file, photo, or link that shows your work.";
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ name: file.name, type: file.type || "application/octet-stream", size: file.size, url: e.target.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FilePicker({ files, setFiles, setError, label = "Add files" }) {
  async function pick(e) {
    const list = Array.from(e.target.files || []);
    e.target.value = "";
    const room = MAX_FILES - files.length;
    if (room <= 0) { setError("You can add up to " + MAX_FILES + " files."); return; }
    const out = [];
    for (const f of list.slice(0, room)) {
      if (f.size > MAX_FILE) { setError(f.name + " is over 3 MB. Use a smaller file, or paste a link to it instead."); continue; }
      out.push(await readFile(f));
    }
    if (out.length) setFiles([...files, ...out]);
  }
  return (
    <div style={{ marginTop: 8 }}>
      <label className="btn ghost small" style={{ cursor: "pointer" }}>
        {label}
        <input type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt" onChange={pick} />
      </label>
      <span className="small muted" style={{ marginInlineStart: 8 }}>Photos, PDFs, Word, Excel, or PowerPoint. Up to 3 files, 3 MB each.</span>
      {files.length > 0 && <FileList files={files} onRemove={(i) => setFiles(files.filter((_, j) => j !== i))} />}
    </div>
  );
}

export function FileList({ files, onRemove }) {
  return (
    <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
      {files.map((f, i) => (
        <span key={i} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {f.type.startsWith("image/") ? <img src={f.url} alt="" style={{ width: 22, height: 22, objectFit: "cover", borderRadius: 4 }} /> : <Icon name="FileText" size={16} />}
          <a href={f.url} download={f.name} style={{ color: "inherit" }}>{f.name}</a>
          {onRemove && <button aria-label={"Remove " + f.name} onClick={() => onRemove(i)} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}><Icon name="X" size={14} /></button>}
        </span>
      ))}
    </div>
  );
}

// Step 2: submit the week's work. Optional "add to portfolio".
export function SubmitWork({ t, w, saved, onSubmit, busy }) {
  const [text, setText] = useState(saved?.text || "");
  const [link, setLink] = useState(saved?.link || "");
  const [files, setFiles] = useState(saved?.files || []);
  const [toPortfolio, setToPortfolio] = useState(saved ? !!saved.inPortfolio : w.week === 6);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!saved);

  if (saved && !editing) {
    return (
      <div>
        <div className="row between">
          <span className="chip green">Submitted {new Date(saved.date).toLocaleDateString()}</span>
          <button className="btn ghost small" onClick={() => setEditing(true)}>Edit and resubmit</button>
        </div>
        {saved.text && <p style={{ whiteSpace: "pre-wrap", marginBottom: 4 }}>{saved.text}</p>}
        {saved.link && <div className="small"><a href={saved.link} target="_blank" rel="noreferrer">{saved.link}</a></div>}
        {saved.files?.length > 0 && <FileList files={saved.files} />}
        {saved.inPortfolio && <div className="small muted" style={{ marginTop: 6 }}>In your portfolio</div>}
      </div>
    );
  }

  async function submit() {
    setError("");
    if (!text.trim() && !link.trim() && files.length === 0) { setError("Write what you did, add a file, or paste a link before you submit."); return; }
    const cleanLink = link.trim() && !/^https?:\/\//i.test(link.trim()) ? "https://" + link.trim() : link.trim();
    const err = await onSubmit({ text: text.trim(), link: cleanLink, files, inPortfolio: toPortfolio, date: new Date().toISOString() });
    if (err) setError(err); else setEditing(false);
  }

  return (
    <div>
      <textarea className="input" placeholder="What did you do? What did you learn? What would you do better next time?" value={text} onChange={(e) => setText(e.target.value)} />
      <input className="input" style={{ marginTop: 8 }} placeholder="Link to your work (Google Drive, YouTube, GitHub, website). Optional" value={link} onChange={(e) => setLink(e.target.value)} />
      <FilePicker files={files} setFiles={setFiles} setError={setError} />
      <label className="row small" style={{ marginTop: 10 }}>
        <input type="checkbox" checked={toPortfolio} onChange={(e) => setToPortfolio(e.target.checked)} /> Add this to my portfolio
      </label>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn teal small" onClick={submit} disabled={busy}>{busy ? "Sending..." : "Submit my work"}</button>
        {saved && <button className="btn ghost small" onClick={() => setEditing(false)}>Cancel</button>}
      </div>
      {error && <div className="err">{error}</div>}
    </div>
  );
}

// Step 3: a short graded quiz for the week. Pass with 2 of 3 or better.
// Weekly quiz: 10 hard questions. Pass with 8 of 10.
const QUIZ_SIZE = 10;
const QUIZ_PASS = 8;

export function WeekQuiz({ t, w, saved, onSave }) {
  const [qs, setQs] = useState(null);
  const [picks, setPicks] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function load() {
    setBusy(true); setError(""); setResult(null); setPicks({});
    const prompt = [
      "Write a hard 12 question multiple choice quiz on Lumo Hubs " + t.name + ", Week " + w.week + ": " + w.title + ". Focus: " + w.focus + " Tools: " + (w.tools || []).join(", ") + ".",
      "Make it hard but fair. Most questions should be real work scenarios that test if the student can apply what they learned, not just repeat words.",
      t.sector === "trades" ? "Include questions on naming the right tool for a job, what a tool is used for, and safety steps." : "",
      /health|medical|radiolog/i.test(t.id + t.name) ? "Include questions on safe steps, the right order of steps, and patient safety." : "",
      t.sector !== "trades" && !/health|medical|radiolog/i.test(t.id + t.name) ? "Include questions on the exact steps to do a task in this week's software, like where to click or which setting to use." : "",
      "Each question has 4 options. All 4 options must sound believable. One is correct. Do not use all of the above or none of the above.",
      "Use plain words. Keep each question and option short. Keep why under 15 words. Do not use em dashes.",
      'Reply ONLY with JSON, no other text: {"questions":[{"q":"question","options":["a","b","c","d"],"answer":0,"why":"short"}]}',
    ].filter(Boolean).join(" ");
    const parse = (text) => {
      const raw = String(text || "");
      return JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    };
    const valid = (x) => x && x.q && Array.isArray(x.options) && x.options.length === 4 && Number.isInteger(x.answer) && x.answer >= 0 && x.answer < 4;
    let kept = [];
    let lastErr = "";
    // Up to 2 rounds: one small model writes questions, two other small models answer them without the key.
    // A question is kept only when 2 of the 3 models agree on the answer, so students are not graded on a wrong key.
    for (let round = 0; round < 2 && kept.length < QUIZ_SIZE; round++) {
      const r = await askClaude({ system: "You write hard, fair, practical training quizzes. Reply with JSON only.", prompt, maxTokens: 2000 });
      if (r.error) { lastErr = r.error; break; }
      let list = [];
      try { list = (parse(r.text).questions || []).filter(valid); } catch { list = []; }
      list = list.filter((x) => !kept.some((k) => k.q === x.q));
      if (!list.length) continue;
      const sheet = list.map((x, i) => (i + 1) + ". " + x.q + "\n" + x.options.map((o, k) => "   " + k + ") " + o).join("\n")).join("\n");
      const checkPrompt = "Topic: " + t.name + ", " + w.title + ". For each question pick the single best option number (0 to 3). Think about real work practice. Reply ONLY with JSON: {\"answers\":[n, n, ...]} with one number per question, in order.\n\n" + sheet;
      const sys = "You are an expert in this subject. Answer carefully. Reply with JSON only.";
      // Two other small models answer without the key. Keep a question when at least one agrees (2 of 3 votes).
      const [v1, v2] = await Promise.all([
        askClaude({ system: sys, prompt: checkPrompt, maxTokens: 600, prefer: "check" }),
        askClaude({ system: sys, prompt: checkPrompt, maxTokens: 600, prefer: "check2" }),
      ]);
      const read = (v) => { try { return v.error ? [] : parse(v.text).answers || []; } catch { return []; } };
      const a1 = read(v1), a2 = read(v2);
      if (!a1.length && !a2.length) { lastErr = v1.error || v2.error || ""; continue; }
      kept = kept.concat(list.filter((x, i) => Number(a1[i]) === x.answer || Number(a2[i]) === x.answer));
    }
    if (kept.length >= QUIZ_SIZE) {
      const clean = (v) => String(v).replace(/\*+/g, "").replace(/\s*[\u2014\u2013]\s*/g, ", ");
      setQs(kept.slice(0, QUIZ_SIZE).map((x) => {
        // Shuffle the options so the right answer is not always in the same spot.
        const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        return { q: clean(x.q), options: order.map((k) => clean(x.options[k])), answer: order.indexOf(x.answer), why: clean(x.why || "") };
      }));
    } else {
      setError(lastErr || "The quiz did not load. Press the button again.");
    }
    setBusy(false);
  }

  function grade() {
    const score = qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);
    const missed = qs.filter((q, i) => picks[i] !== q.answer).map((q) => q.q);
    const tries = ((saved && saved.tries) || (saved ? 1 : 0)) + 1;
    const res = { score, total: qs.length, passed: score >= QUIZ_PASS, date: new Date().toISOString(), missed };
    setResult(res);
    onSave(saved && saved.score > score ? { ...saved, tries, lastTry: res } : { ...res, tries });
  }

  if (!qs) {
    return (
      <div>
        {saved && <div style={{ marginBottom: 8 }}><span className={"chip " + (saved.passed ? "green" : "")}>{saved.passed ? "Passed" : "Not passed yet"}: {saved.score} of {saved.total}</span></div>}
        <button className="btn small" onClick={load} disabled={busy}>{busy ? "Making your quiz..." : saved ? "Take a new quiz" : "Start the Week " + w.week + " quiz"}</button>
        <div className="small muted" style={{ marginTop: 6 }}>{QUIZ_SIZE} questions. You need {QUIZ_PASS} right to pass. Each try has new questions.</div>
        {error && <div className="err">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {qs.map((q, i) => (
        <fieldset key={i} style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
          <legend style={{ fontWeight: 600, marginBottom: 6 }}>{i + 1}. {q.q}</legend>
          {q.options.map((o, k) => {
            const right = result && k === q.answer;
            const wrong = result && picks[i] === k && k !== q.answer;
            return (
              <label key={k} className="row small" style={{ padding: "4px 0", color: right ? "var(--teal)" : wrong ? "var(--red)" : undefined, fontWeight: right ? 700 : undefined }}>
                <input type="radio" name={weekKey(t, w) + "-q" + i} disabled={!!result} checked={picks[i] === k} onChange={() => setPicks({ ...picks, [i]: k })} /> {o}
              </label>
            );
          })}
          {result && q.why && <div className="small muted">{q.why}</div>}
        </fieldset>
      ))}
      {!result ? (
        <button className="btn teal small" onClick={grade} disabled={Object.keys(picks).length < qs.length}>Check my answers</button>
      ) : (
        <div className="row">
          <span className={"chip " + (result.passed ? "green" : "")}>{result.passed ? "You passed" : "Not yet"}: {result.score} of {result.total}</span>
          <button className="btn ghost small" onClick={load}>New quiz</button>
        </div>
      )}
    </div>
  );
}

// Written check: the student explains in their own words. No multiple choice, no pasting.
// The AI grades each answer strictly. Pass when every answer scores 5 or more and the average is 7 or more.
const MIN_WORDS = 30;
const words = (x) => String(x || "").trim().split(/\s+/).filter(Boolean).length;
const isTrades = (t) => t.sector === "trades";
const isMed = (t) => /health|medical|radiolog|nurs/i.test(t.id + " " + t.name);

const WRITTEN_SIZE = 10;

function backupQuestions(t, w) {
  const tools = (w.tools || []).filter((x) => !/AI|app$/i.test(x));
  const tool = tools[0] || (w.tools || [])[0] || "the main tool";
  const tool2 = tools[1] || tool;
  const base = [
    `In your own words, explain the most important things you learned in Week ${w.week}: ${w.title}.`,
    `Explain this week's topic to a friend who has never heard of it: ${w.focus}`,
    `Describe a real work problem where you would use what you learned this week, and how you would solve it step by step.`,
    `What is one common mistake people make with this week's work, and how do you avoid it?`,
    `How would you check that your work this week was done right? List what you would check.`,
    `What questions would you ask a boss or customer before starting this week's kind of job, and why?`,
  ];
  const special = isTrades(t)
    ? [`Name the tools you would use for this week's work (${w.title}) and say what each one is for.`,
       `What safety steps do you follow for this week's work, and why does each one matter?`,
       `Walk through a real job from this week from start to finish. List each step in order.`,
       `When should you stop and call a licensed professional for this kind of work? Explain why.`]
    : isMed(t)
      ? [`List the steps of a real procedure from this week, in the right order.`,
         `What do you do to keep the patient safe during this week's work? Explain each step.`,
         `Explain two key medical words from this week in plain words.`,
         `When must you stop and get a licensed professional? Explain why.`]
      : [`List the exact steps you would take to do a real task in ${tool}. Say what you click and what you type.`,
         `How would you find or pull a specific set of data in ${tool2}? List each step.`,
         `Something is not working in ${tool}. How would you find and fix the problem? List your steps.`,
         `How would you share your work in ${tool} with your team or manager? List each step.`];
  return [...special, ...base].slice(0, WRITTEN_SIZE);
}

export function WrittenCheck({ t, w, saved, onSave }) {
  // Answers save on this device as the student types, so a refresh does not lose their work.
  const draftKey = "lh-written-draft:" + weekKey(t, w);
  const draft = (() => { try { return JSON.parse(localStorage.getItem(draftKey) || "null"); } catch { return null; } })();
  const [qs, setQsState] = useState(draft && Array.isArray(draft.qs) ? draft.qs : null);
  const [ans, setAnsState] = useState(draft && draft.ans ? draft.ans : {});
  const keep = (q, a) => { try { localStorage.setItem(draftKey, JSON.stringify({ qs: q, ans: a })); } catch {} };
  const setQs = (q) => { setQsState(q); keep(q, {}); };
  const setAns = (a) => { setAnsState(a); keep(qs, a); };
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");

  async function load() {
    setBusy("load"); setError(""); setResult(null); setAnsState({});
    const rules = [
      "Write 10 short answer questions that a student must answer in their own words, in 3 to 6 sentences each. No multiple choice. Each question must be different.",
      `Course: Lumo Hubs ${t.name}, Week ${w.week}: ${w.title}. Topic: ${w.focus} Tools: ${(w.tools || []).join(", ")}.`,
      isTrades(t)
        ? "At least 3 questions ask the student to name the specific tools for a real job and say what each tool is for. At least 2 ask about safety steps. At least 2 ask for the steps of a real job in order."
        : isMed(t)
          ? "At least 3 questions ask for the steps of a real procedure in order. At least 3 ask about patient safety. At least 2 ask them to explain medical words in plain words."
          : "At least 4 questions ask for the exact steps to do a real task in this week's software tools, for example how to build a report that pulls certain data, saying what to click and what to enter. At least 2 ask how to fix a problem in the tool.",
      "The rest ask them to explain key ideas from this week and how they would use them at work.",
      "Questions must test real understanding, not memorized words. Use plain words. Do not use em dashes.",
      'Reply ONLY with JSON: {"questions":["question 1","question 2", ... ten in all]}',
    ].join(" ");
    const r = await askClaude({ system: "You write fair, hard, practical training questions. Reply with JSON only.", prompt: rules, maxTokens: 1500 });
    let list = null;
    if (!r.error) {
      try {
        const raw = String(r.text || "");
        const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        // The model may send plain strings or objects like {"q1": "..."}. Read both.
        list = (j.questions || [])
          .map((x) => (typeof x === "string" ? x : Object.values(x || {}).find((v) => typeof v === "string") || ""))
          .map((x) => x.replace(/\*+/g, "").replace(/\s*[\u2014\u2013]\s*/g, ", ").trim())
          .filter((x, i, arr) => x.length > 10 && arr.indexOf(x) === i)
          .slice(0, WRITTEN_SIZE);
      } catch { list = null; }
    }
    // Fill any missing spots with built in questions so there are always 10.
    if (!list) list = [];
    if (list.length < WRITTEN_SIZE) list = list.concat(backupQuestions(t, w).filter((q) => !list.includes(q))).slice(0, WRITTEN_SIZE);
    setQs(list);
    setBusy("");
  }

  async function grade() {
    setBusy("grade"); setError("");
    // Grade in 2 groups of 5 at the same time, so each reply is short and reliable.
    const gradeGroup = async (idx) => {
      const items = idx.map((i, n) => `Question ${n + 1}: ${qs[i]}\nStudent answer ${n + 1}: ${ans[i]}`).join("\n\n");
      const prompt = [
        `Grade these written answers for Lumo Hubs ${t.name}, Week ${w.week}: ${w.title}. Topic: ${w.focus} Tools: ${(w.tools || []).join(", ")}.`,
        "Be strict and fair. Score each answer 0 to 10. 9 to 10: correct, specific, and complete, with real steps, tool names, or facts. 7 to 8: correct with small gaps. 5 to 6: partly right or too general. 0 to 4: wrong, vague, off topic, or copied filler.",
        "Wrong facts, wrong steps, or wrong tool names lose points. Do not reward length alone. If an answer repeats another answer or does not answer its own question, score it 0 to 3.",
        "For each answer give one or two short sentences of feedback that say what was right and what was missing. Plain words. No em dashes.",
        `Reply ONLY with JSON with exactly ${idx.length} grades in order: {"grades":[{"score":0,"feedback":"..."}]}`,
        "\n\n" + items,
      ].join(" ");
      const r = await askClaude({ system: "You are a strict, fair instructor who grades written answers. Reply with JSON only.", prompt, maxTokens: 1200 });
      if (r.error) return { error: r.error };
      try {
        const raw = String(r.text || "");
        const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        const g = (j.grades || []).slice(0, idx.length).map((x) => ({ score: Math.max(0, Math.min(10, Math.round(Number(x.score) || 0))), feedback: String(x.feedback || "").replace(/\s*[\u2014\u2013]\s*/g, ", ") }));
        return g.length === idx.length ? { grades: g } : { error: "" };
      } catch { return { error: "" }; }
    };
    const half = Math.ceil(qs.length / 2);
    const groups = [qs.map((_, i) => i).slice(0, half), qs.map((_, i) => i).slice(half)].filter((x) => x.length);
    const parts = await Promise.all(groups.map(gradeGroup));
    const bad = parts.find((p) => !p.grades);
    const grades = bad ? null : parts.flatMap((p) => p.grades);
    const r = { error: bad ? bad.error : "" };
    setBusy("");
    if (!grades || grades.length < qs.length) { setError(r.error || "Grading did not work. Press the button again."); return; }
    const avg = Math.round((grades.reduce((n, g) => n + g.score, 0) / grades.length) * 10) / 10;
    const passed = avg >= 7 && grades.every((g) => g.score >= 5);
    const tries = ((saved && saved.tries) || 0) + 1;
    const res = { questions: qs, answers: qs.map((_, i) => ans[i]), grades, avg, passed, tries, date: new Date().toISOString() };
    setResult(res);
    try { localStorage.removeItem(draftKey); } catch {}
    // Keep a passed check. Otherwise keep the latest try.
    onSave(saved && saved.passed && !passed ? { ...saved, tries, lastTry: res } : res);
  }

  const ready = qs && qs.every((_, i) => words(ans[i]) >= MIN_WORDS);

  if (!qs) {
    return (
      <div>
        {saved && <div style={{ marginBottom: 8 }}><span className={"chip " + (saved.passed ? "green" : "")}>{saved.passed ? "Passed" : "Not passed yet"}: {saved.avg} of 10 average</span></div>}
        <p className="small" style={{ margin: "0 0 8px" }}>Answer 10 questions in your own words. Each answer needs at least {MIN_WORDS} words. You cannot paste. Your instructor will read your answers.</p>
        <button className="btn small" onClick={load} disabled={!!busy}>{busy ? "Getting your questions..." : saved ? "Try a new written check" : "Start the written check"}</button>
        {error && <div className="err">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {qs.map((q, i) => (
        <div key={i} style={{ margin: "0 0 14px" }}>
          <label htmlFor={weekKey(t, w) + "-wr" + i} style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{i + 1}. {q}</label>
          <textarea
            id={weekKey(t, w) + "-wr" + i}
            className="input"
            rows={5}
            value={ans[i] || ""}
            disabled={!!result || busy === "grade"}
            onChange={(e) => setAns({ ...ans, [i]: e.target.value })}
            onPaste={(e) => { e.preventDefault(); setNote("Pasting is turned off. Type your answer in your own words."); }}
            onDrop={(e) => e.preventDefault()}
            autoComplete="off"
            spellCheck
          />
          <div className="small muted">{words(ans[i])} words{words(ans[i]) < MIN_WORDS ? ` (need ${MIN_WORDS})` : ""}</div>
          {result && result.grades[i] && (
            <div className="small" style={{ marginTop: 4 }}>
              <span className={"chip " + (result.grades[i].score >= 7 ? "green" : "")}>{result.grades[i].score} of 10</span> {result.grades[i].feedback}
            </div>
          )}
        </div>
      ))}
      {note && !result && <div className="small" style={{ color: "var(--red)", marginBottom: 8 }}>{note}</div>}
      {error && <div className="err">{error}</div>}
      {!result ? (
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn teal small" onClick={grade} disabled={!ready || !!busy}>{busy === "grade" ? "Grading..." : "Turn in my answers"}</button>
          <span className="small muted">{qs.filter((_, i) => words(ans[i]) >= MIN_WORDS).length} of {qs.length} answered. Your answers save as you type.</span>
        </div>
      ) : (
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className={"chip " + (result.passed ? "green" : "")}>{result.passed ? "You passed" : "Not yet"}: {result.avg} of 10 average</span>
          {!result.passed && <span className="small">You need 7 on average and at least 5 on every answer.</span>}
          <button className="btn ghost small" onClick={load}>New questions</button>
        </div>
      )}
    </div>
  );
}

// Portfolio page: everything the student uploaded, plus a form to add more.
export function MyPortfolio({ defaultTrack }) {
  const [work, update] = useWork();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const items = [...work.portfolio].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const weeksDone = Object.values(work.weeks).filter((x) => x.submission).length;
  const quizzesPassed = Object.values(work.weeks).filter((x) => x.quiz && x.quiz.passed).length;

  function save() {
    setError("");
    if (!title.trim()) { setError("Give your project a title."); return; }
    if (!text.trim() && !link.trim() && files.length === 0) { setError("Add a description, a file, or a link."); return; }
    const cleanLink = link.trim() && !/^https?:\/\//i.test(link.trim()) ? "https://" + link.trim() : link.trim();
    const item = { id: newId(), title: title.trim(), text: text.trim(), link: cleanLink, files, trackId: defaultTrack || null, date: new Date().toISOString() };
    const err = update((s) => ({ ...s, portfolio: [item, ...s.portfolio] }));
    if (err) { setError(err); return; }
    setTitle(""); setText(""); setLink(""); setFiles([]); setAdding(false);
  }

  function remove(id) {
    if (!window.confirm("Remove this from your portfolio?")) return;
    update((s) => ({ ...s, portfolio: s.portfolio.filter((p) => p.id !== id) }));
  }

  return (
    <div className="panel section">
      <div className="row between">
        <h3 style={{ margin: 0 }}>My portfolio</h3>
        {!adding && <button className="btn small" onClick={() => setAdding(true)}>Upload a project</button>}
      </div>
      <div className="row small" style={{ marginTop: 8 }}>
        <span className="chip teal">{weeksDone} assignments submitted</span>
        <span className="chip teal">{quizzesPassed} quizzes passed</span>
        <span className="chip">{items.length} portfolio items</span>
      </div>
      <p className="small muted">Your work saves on this device for now. Keep a copy of your files.</p>

      {adding && (
        <div className="panel tint" style={{ marginTop: 10 }}>
          <input className="input" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input" style={{ marginTop: 8 }} placeholder="What is it? What did you do? What was the result?" value={text} onChange={(e) => setText(e.target.value)} />
          <input className="input" style={{ marginTop: 8 }} placeholder="Link (Google Drive, YouTube, GitHub, website). Optional" value={link} onChange={(e) => setLink(e.target.value)} />
          <FilePicker files={files} setFiles={setFiles} setError={setError} />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn teal small" onClick={save}>Save to portfolio</button>
            <button className="btn ghost small" onClick={() => { setAdding(false); setError(""); }}>Cancel</button>
          </div>
          {error && <div className="err">{error}</div>}
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="empty" style={{ marginTop: 10 }}>Nothing here yet. Submit a weekly assignment with "Add this to my portfolio" checked, or upload a project.</div>
      ) : (
        <div className="grid g3" style={{ marginTop: 10 }}>
          {items.map((p) => {
            const tr = p.trackId ? trackById(p.trackId) : null;
            const img = (p.files || []).find((f) => f.type.startsWith("image/"));
            return (
              <div key={p.id} className="panel tint">
                {img && <img src={img.url} alt="" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
                <strong>{p.title}</strong>
                <div className="small muted">{tr ? tr.name : "Project"}{p.week ? ", Week " + p.week : ""}</div>
                {p.text && <p className="small" style={{ whiteSpace: "pre-wrap", margin: "6px 0" }}>{p.text.length > 220 ? p.text.slice(0, 220) + "..." : p.text}</p>}
                {p.link && <div className="small"><a href={p.link} target="_blank" rel="noreferrer">Open link</a></div>}
                {p.files?.length > 0 && <FileList files={p.files} />}
                <button className="btn ghost small" style={{ marginTop: 8 }} onClick={() => remove(p.id)}>Remove</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
