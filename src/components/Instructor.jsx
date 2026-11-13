import React, { useEffect, useState } from "react";
import { trackById } from "../data/tracks";
import { Markdown } from "./Markdown";

// Instructor view: what each learner did online before their in person training.
// Shows their written work, the mentor's review, quiz scores, and what they missed.
// Needs ADMIN_CODE set in Vercel. Staff type that code to open this page.

const CODE_KEY = "lh-staff-code";
const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");

function weekRows(l, t) {
  const done = (l.progress || {})[t.id] || [];
  return t.weeks.map((w) => {
    const rec = (l.weeks || {})[t.id + ":" + w.week] || {};
    return { w, done: done.includes(w.week), sub: rec.submission, quiz: rec.quiz, review: rec.review, written: rec.written };
  });
}

// Things an instructor should look at first.
function flags(rows) {
  const out = [];
  rows.forEach(({ w, done, sub, quiz, written }) => {
    if (!sub && (done || quiz)) out.push(`Week ${w.week}: no written work`);
    if (sub && String(sub.text || "").trim().split(/\s+/).length < 25) out.push(`Week ${w.week}: written work is very short`);
    if (quiz && !quiz.passed) out.push(`Week ${w.week}: quiz not passed (${quiz.score} of ${quiz.total})`);
    if (written && !written.passed) out.push(`Week ${w.week}: written check not passed (${written.avg} of 10)`);
    if (written && written.grades && written.grades.some((g) => g.score < 5)) out.push(`Week ${w.week}: a written answer scored under 5`);
    if (quiz && quiz.tries > 2) out.push(`Week ${w.week}: took the quiz ${quiz.tries} times`);
  });
  return out;
}

function TrackReport({ l, t }) {
  const rows = weekRows(l, t);
  const f = flags(rows);
  const doneCount = rows.filter((r) => r.done).length;
  return (
    <div style={{ marginTop: 14 }}>
      <h4 style={{ margin: "0 0 6px" }}>{t.name}: {doneCount} of 6 weeks done</h4>
      {f.length > 0 && (
        <div className="panel tint small" style={{ marginBottom: 10 }}>
          <strong>Check these first:</strong>
          <ul style={{ margin: "4px 0 0", paddingInlineStart: 18 }}>{f.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {rows.map(({ w, done, sub, quiz, review, written }) => (
        <div key={w.week} className="panel" style={{ marginBottom: 8, breakInside: "avoid" }}>
          <div className="row between" style={{ flexWrap: "wrap", gap: 6 }}>
            <strong>Week {w.week}: {w.title}</strong>
            <span className={"chip " + (done ? "green" : "")}>{done ? "Done" : sub || quiz ? "In progress" : "Not started"}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="small" style={{ fontWeight: 600 }}>Written work</div>
            {sub ? (
              <>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{sub.text || <span className="muted">(No text, only files or a link)</span>}</div>
                {sub.link && <div className="small" style={{ marginTop: 4 }}>Link: <a href={sub.link} target="_blank" rel="noreferrer">{sub.link}</a></div>}
                {sub.files && sub.files.length > 0 && <div className="small" style={{ marginTop: 4 }}>Files: {sub.files.map((x) => x.url ? <a key={x.name} href={x.url} download={x.name} style={{ marginInlineEnd: 8 }}>{x.name}</a> : <span key={x.name} style={{ marginInlineEnd: 8 }}>{x.name}</span>)}</div>}
                <div className="small muted" style={{ marginTop: 4 }}>Turned in {fmt(sub.date)}</div>
              </>
            ) : <div className="small muted">Nothing turned in yet.</div>}
          </div>
          {review && (
            <details style={{ marginTop: 8 }}>
              <summary className="small" style={{ fontWeight: 600, cursor: "pointer" }}>AI mentor's review</summary>
              <div className="small" style={{ marginTop: 4 }}><Markdown text={review.text} /></div>
            </details>
          )}
          <div style={{ marginTop: 8 }}>
            <div className="small" style={{ fontWeight: 600 }}>Written check (in their own words)</div>
            {written ? (
              <div>
                <div className="small">{written.passed ? "Passed" : "Not passed"}: {written.avg} of 10 average{written.tries ? `, ${written.tries} ${written.tries === 1 ? "try" : "tries"}` : ""}</div>
                {(written.questions || []).map((q, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <div className="small" style={{ fontWeight: 600 }}>{i + 1}. {q}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{(written.answers || [])[i]}</div>
                    {written.grades && written.grades[i] && <div className="small muted">AI grade: {written.grades[i].score} of 10. {written.grades[i].feedback}</div>}
                  </div>
                ))}
              </div>
            ) : <div className="small muted">Not taken yet.</div>}
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="small" style={{ fontWeight: 600 }}>Quiz</div>
            {quiz ? (
              <div className="small">
                {quiz.passed ? "Passed" : "Not passed"}: {quiz.score} of {quiz.total}{quiz.tries ? `, ${quiz.tries} ${quiz.tries === 1 ? "try" : "tries"}` : ""}
                {quiz.missed && quiz.missed.length > 0 && (
                  <div style={{ marginTop: 4 }}>Missed: <ul style={{ margin: "2px 0 0", paddingInlineStart: 18 }}>{quiz.missed.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}
              </div>
            ) : <div className="small muted">Not taken yet.</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function LearnerReport({ l }) {
  const [open, setOpen] = useState(false);
  const t = trackById(l.trackId);
  const biz = trackById("business-systems");
  return (
    <div className="panel" style={{ marginBottom: 12 }}>
      <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>{l.name}</h3>
          <div className="small muted">{l.email}</div>
          <div className="small" style={{ marginTop: 4 }}>
            Track: <strong>{t ? t.name : "None picked"}</strong>
            {l.goal ? ` · Goal: ${l.goal}` : ""}
            {l.inPerson === "requested" ? ` · In person requested ${fmt(l.inPersonAt)}` : ""}
            {` · Business Tools: ${l.bizTools === "tested-out" ? "tested out" : "taking it"}`}
            {` · Questions asked: ${l.questions}`}
          </div>
        </div>
        <button className="btn small no-print" onClick={() => setOpen(!open)}>{open ? "Hide report" : "Open report"}</button>
      </div>
      {open && (
        <>
          {t ? <TrackReport l={l} t={t} /> : <p className="muted">No main track yet.</p>}
          {biz && t && t.id !== biz.id && l.bizTools !== "tested-out" && <TrackReport l={l} t={biz} />}
        </>
      )}
    </div>
  );
}

export function InstructorView() {
  const [code, setCode] = useState(() => { try { return sessionStorage.getItem(CODE_KEY) || ""; } catch { return ""; } });
  const [typed, setTyped] = useState("");
  const [all, setAll] = useState(false);
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    setBusy(true); setError("");
    fetch("/api/learner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "instructor", code, all }) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) { setError(d.error || "Could not load."); setList(null); if (/code/i.test(d.error || "")) { setCode(""); try { sessionStorage.removeItem(CODE_KEY); } catch {} } }
        else setList(d.learners || []);
      })
      .catch(() => setError("No connection. Try again."))
      .finally(() => setBusy(false));
  }, [code, all]);

  if (!code) {
    return (
      <form className="panel" style={{ maxWidth: 420 }} onSubmit={(e) => { e.preventDefault(); try { sessionStorage.setItem(CODE_KEY, typed); } catch {} setCode(typed); }}>
        <h2 style={{ marginTop: 0 }}>Instructor view</h2>
        <p className="muted">For Lumo Hubs staff and instructors. See what each learner did online before in person training.</p>
        <input className="input" type="password" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Staff code" aria-label="Staff code" />
        {error && <div className="err">{error}</div>}
        <button className="btn" style={{ marginTop: 12, width: "100%" }} disabled={!typed}>Open</button>
      </form>
    );
  }

  const shown = list || [];

  return (
    <div>
      <div className="row between no-print" style={{ flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ margin: 0 }}>Instructor view</h2>
          <div className="small muted">{all ? "All learners" : "Learners who asked for in person training"}: {shown.length}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost small" onClick={() => setAll(!all)}>{all ? "Show in person requests only" : "Show all learners"}</button>
          <button className="btn ghost small" onClick={() => window.print()}>Print</button>
          <button className="btn ghost small" onClick={() => { setCode(""); setList(null); try { sessionStorage.removeItem(CODE_KEY); } catch {} }}>Lock</button>
        </div>
      </div>
      {busy && <p className="muted">Loading...</p>}
      {error && <div className="err">{error}</div>}
      {list && shown.length === 0 && <p className="muted" style={{ marginTop: 16 }}>{all ? "No learners yet." : "No one has asked for in person training yet."}</p>}
      <div style={{ marginTop: 14 }}>{shown.map((l) => <LearnerReport key={l.email} l={l} />)}</div>
    </div>
  );
}
