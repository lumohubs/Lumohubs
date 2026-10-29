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
export function WeekQuiz({ t, w, saved, onSave }) {
  const [qs, setQs] = useState(null);
  const [picks, setPicks] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function load() {
    setBusy(true); setError(""); setResult(null); setPicks({});
    const prompt = "Write a 3 question multiple choice quiz for a beginner on Lumo Hubs " + t.name + ", Week " + w.week + ": " + w.title + ". Focus: " + w.focus + " Tools: " + (w.tools || []).join(", ") + ". Use plain words. Each question has 4 options and one correct answer. Reply ONLY with JSON, no other text: {\"questions\":[{\"q\":\"question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"answer\":0,\"why\":\"one short sentence\"}]}";
    const r = await askClaude({ system: "You write short, fair training quizzes. Reply with JSON only. Do not use em dashes.", prompt, maxTokens: 900 });
    let list = null;
    if (!r.error) {
      try {
        const raw = String(r.text || "");
        const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        list = (j.questions || []).filter((x) => x.q && Array.isArray(x.options) && x.options.length >= 2 && Number.isInteger(x.answer)).slice(0, 3);
      } catch { list = null; }
    }
    if (!list || list.length === 0) setError(r.error || "The quiz did not load. Try again.");
    else setQs(list);
    setBusy(false);
  }

  function grade() {
    const score = qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);
    const res = { score, total: qs.length, passed: score >= Math.ceil(qs.length * 0.66), date: new Date().toISOString() };
    setResult(res);
    onSave(saved && saved.score > score ? { ...saved, lastTry: res } : res);
  }

  if (!qs) {
    return (
      <div>
        {saved && <div style={{ marginBottom: 8 }}><span className={"chip " + (saved.passed ? "green" : "")}>{saved.passed ? "Passed" : "Not passed yet"}: {saved.score} of {saved.total}</span></div>}
        <button className="btn small" onClick={load} disabled={busy}>{busy ? "Making your quiz..." : saved ? "Take the quiz again" : "Start the Week " + w.week + " quiz"}</button>
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
