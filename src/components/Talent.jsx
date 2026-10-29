import React, { useMemo, useState } from "react";
import { EMPLOYERS, JOBS, LEARNERS, PROJECTS } from "../data/demo";
import { trackById } from "../data/tracks";
import { askClaude } from "../ai";

export const employerById = (id) => EMPLOYERS.find((e) => e.id === id);

// Match score: shared skills plus same track. Simple, fast, and explainable.
export function matchScore(learner, job) {
  const shared = job.skills.filter((s) => learner.skills.includes(s)).length;
  const skillPart = job.skills.length ? shared / job.skills.length : 0;
  const trackPart = learner.track === job.track ? 1 : 0;
  const progressPart = learner.progress / 100;
  return Math.round((skillPart * 0.5 + trackPart * 0.3 + progressPart * 0.2) * 100);
}

export function TalentNetwork({ me, applications, setApplications }) {
  const [tab, setTab] = useState("jobs");
  return (
    <div>
      <h2>Lumo Talent Network</h2>
      <p className="muted">Like LinkedIn, but every profile is backed by real training and real work. Employers see proof, not claims.</p>
      <div className="seg" style={{ margin: "14px 0 20px" }}>
        {[["jobs", "Jobs and internships"], ["projects", "Live projects"], ["people", "Find talent"], ["mine", "My applications"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "jobs" && <JobFeed me={me} applications={applications} setApplications={setApplications} />}
      {tab === "projects" && <Projects />}
      {tab === "people" && <People />}
      {tab === "mine" && <MyApplications applications={applications} />}
    </div>
  );
}

function JobFeed({ me, applications, setApplications }) {
  const [type, setType] = useState("All");
  const [qatari, setQatari] = useState(false);
  const jobs = JOBS
    .filter((j) => (type === "All" || j.type === type) && (!qatari || j.qatari))
    .map((j) => ({ ...j, score: matchScore(me, j) }))
    .sort((a, b) => b.score - a.score);
  return (
    <div>
      <div className="row" style={{ marginBottom: 14 }}>
        <div className="seg">
          {["All", "Full time", "Internship", "Freelance"].map((t) => <button key={t} className={type === t ? "on" : ""} onClick={() => setType(t)}>{t}</button>)}
        </div>
        <label className="row small"><input type="checkbox" checked={qatari} onChange={(e) => setQatari(e.target.checked)} /> Qatarization roles only</label>
      </div>
      <p className="small muted">Ranked for {me.name} by skills, track, and progress.</p>
      <div className="grid" style={{ gap: 12 }}>
        {jobs.map((j) => {
          const e = employerById(j.employer);
          const applied = applications.some((a) => a.jobId === j.id);
          return (
            <div key={j.id} className="panel">
              <div className="row between">
                <div>
                  <h3 style={{ margin: 0 }}>{j.title}</h3>
                  <div className="small muted">{e.name}, {j.city}</div>
                </div>
                <span className={`chip ${j.score >= 70 ? "green" : j.score >= 40 ? "teal" : ""}`}>{j.score}% match</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className="chip">{j.type}</span><span className="chip">{j.pay}</span>
                {j.qatari && <span className="chip plum">Qatarization role</span>}
              </div>
              <div className="small" style={{ marginTop: 6 }}>Skills: {j.skills.map((s) => <span key={s} className={`chip ${me.skills.includes(s) ? "teal" : ""}`}>{s}</span>)}</div>
              <div className="row" style={{ marginTop: 10 }}>
                {applied ? <span className="chip green">Applied with your Lumo profile</span> : (
                  <button className="btn small" onClick={() => setApplications([...applications, { jobId: j.id, stage: "Applied" }])}>Apply with my profile</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Projects() {
  const [joined, setJoined] = useState([]);
  return (
    <div>
      <p className="muted small">Real work from employers. Learners build their portfolio and often get paid.</p>
      <div className="grid g2">
        {PROJECTS.map((p) => {
          const e = employerById(p.employer); const t = trackById(p.track);
          return (
            <div key={p.id} className="panel">
              <div className="small muted">{e.name}</div>
              <h3>{p.title}</h3>
              <span className="chip">{t.name}</span><span className="chip">{p.weeks} weeks</span><span className="chip teal">{p.paid}</span><span className="chip">{p.seats} seats</span>
              <div style={{ marginTop: 10 }}>
                {joined.includes(p.id) ? <span className="chip green">Request sent</span> : <button className="btn small" onClick={() => setJoined([...joined, p.id])}>Request to join</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function People() {
  const [jobId, setJobId] = useState(JOBS[0].id);
  const [why, setWhy] = useState({});
  const job = JOBS.find((j) => j.id === jobId);
  const ranked = useMemo(() => LEARNERS.map((l) => ({ ...l, score: matchScore(l, job) })).sort((a, b) => b.score - a.score), [job]);

  async function explain(l) {
    setWhy({ ...why, [l.id]: "Thinking..." });
    const r = await askClaude({
      system: "You help employers understand candidate fit. Plain language, 3 short sentences, no dashes. Be fair and only use the facts given.",
      prompt: `Job: ${job.title}. Needs: ${job.skills.join(", ")}.\nCandidate: ${l.headline}. Skills: ${l.skills.join(", ")}. Track: ${trackById(l.track).name}, ${l.progress}% complete. Projects: ${l.projects.join("; ") || "none yet"}.\nExplain the fit and one gap to ask about in the interview.`,
      maxTokens: 250,
    });
    setWhy((w) => ({ ...w, [l.id]: r.error || r.text }));
  }

  return (
    <div>
      <label className="small muted" htmlFor="jobpick">Rank candidates for</label>
      <select id="jobpick" className="input" style={{ maxWidth: 380, marginBottom: 14 }} value={jobId} onChange={(e) => setJobId(e.target.value)}>
        {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title}, {employerById(j.employer).name}</option>)}
      </select>
      <div className="grid g2">
        {ranked.map((l) => (
          <div key={l.id} className="panel">
            <div className="row between">
              <div className="row">
                <Avatar name={l.name} />
                <div><strong>{l.name}</strong><div className="small muted">{l.headline}</div></div>
              </div>
              <span className={`chip ${l.score >= 70 ? "green" : l.score >= 40 ? "teal" : ""}`}>{l.score}%</span>
            </div>
            <div style={{ marginTop: 8 }}>{l.skills.map((s) => <span key={s} className="chip teal">Verified: {s}</span>)}</div>
            <div className="small muted" style={{ marginTop: 6 }}>{trackById(l.track).name}, {l.level}, {l.progress}% done</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn ghost small" onClick={() => explain(l)}>Why this match?</button>
              <button className="btn small">Message</button>
            </div>
            {why[l.id] && <div className="ai-box small">{why[l.id]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MyApplications({ applications }) {
  if (applications.length === 0) return <div className="empty">No applications yet. Open Jobs and internships to apply with your Lumo profile.</div>;
  const stages = ["Applied", "Interview", "Offer", "Hired"];
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Role</th><th>Employer</th><th>Stage</th></tr></thead>
        <tbody>
          {applications.map((a) => {
            const j = JOBS.find((x) => x.id === a.jobId);
            return (
              <tr key={a.jobId}>
                <td>{j.title}</td><td>{employerById(j.employer).name}</td>
                <td>{stages.map((s) => <span key={s} className={`chip ${s === a.stage ? "plum" : ""}`}>{s}</span>)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Avatar({ name, size = 40 }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: "var(--plum-soft)", color: "var(--plum)", display: "inline-grid", placeItems: "center", fontWeight: 700, fontFamily: "var(--display)", flexShrink: 0 }}>{initials}</span>
  );
}

export function Profile({ me, progress }) {
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState("");
  const [out, setOut] = useState("");
  const track = trackById(me.track);
  const weeksDone = (progress[me.track] || []).length;

  async function help(kind) {
    setTool(kind); setBusy(true); setOut("");
    const facts = `Name: ${me.name}. Headline: ${me.headline}. Track: ${track.name}. Skills: ${me.skills.join(", ")}. Projects: ${me.projects.join("; ")}.`;
    const prompts = {
      resume: `Write a short resume summary (4 sentences) and 4 resume bullets for this person. Plain, honest, no dashes. Only use these facts. ${facts}`,
      cover: `Write a short cover letter (under 170 words) for a ${track.name} role. Plain human voice, no dashes. Only use these facts. ${facts}`,
      interview: `Give 4 likely interview questions for a ${track.name} role and a strong sample answer for each, 2 sentences each, using only these facts. ${facts}`,
    };
    const r = await askClaude({ system: "You are a career coach at Lumo Hubs. Plain language. Never invent experience.", prompt: prompts[kind], maxTokens: 700 });
    setOut(r.error || r.text); setBusy(false);
  }

  return (
    <div>
      <div className="row" style={{ gap: 16 }}>
        <Avatar name={me.name} size={64} />
        <div>
          <h2 style={{ margin: 0 }}>{me.name}</h2>
          <div className="muted">{me.headline}</div>
          <div className="small muted">{me.city}</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>{me.open.length ? me.open.map((o) => <span key={o} className="chip green">Open to {o.toLowerCase()}</span>) : <span className="chip">Not looking right now</span>}</div>

      <div className="grid g2 section">
        <div className="panel">
          <h3>Verified skills</h3>
          <p className="small muted">Earned in Lumo tracks and checked by instructors. Not self reported.</p>
          {me.skills.map((s) => <span key={s} className="chip teal">{s}</span>)}
        </div>
        <div className="panel">
          <h3>Training</h3>
          <div><strong>{track.name}</strong>, {me.level}</div>
          <div className="small muted">{Math.max(me.progress, Math.round((weeksDone / 6) * 100))}% complete, {me.attendance}% attendance</div>
          <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${Math.max(me.progress, (weeksDone / 6) * 100)}%` }} /></div>
          <p className="small" style={{ marginTop: 10 }}>Certificate issued by a partner university when the track is complete.</p>
        </div>
      </div>

      <h3>Portfolio</h3>
      <div className="grid g3">
        {me.projects.length ? me.projects.map((p) => (
          <div key={p} className="panel tint"><strong>{p}</strong><div className="small muted" style={{ marginTop: 6 }}>{track.name} project</div></div>
        )) : <div className="empty">No projects yet. Finish Week 6 to add your first one.</div>}
      </div>

      <div className="panel section">
        <h3>Career help</h3>
        <div className="row">
          <button className="btn small" disabled={busy} onClick={() => help("resume")}>Write my resume summary</button>
          <button className="btn small" disabled={busy} onClick={() => help("cover")}>Draft a cover letter</button>
          <button className="btn small" disabled={busy} onClick={() => help("interview")}>Practice interview questions</button>
        </div>
        {busy && <p className="muted small" style={{ marginTop: 10 }}>Writing your {tool}...</p>}
        {out && <div className="ai-box">{out}<div className="ai-src">Career coach, powered by Claude</div></div>}
      </div>
    </div>
  );
}
