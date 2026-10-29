import React, { useState } from "react";
import { EMPLOYERS, JOBS, LEARNERS, OUTCOMES } from "../data/demo";
import { trackById, LIVE_TRACKS } from "../data/tracks";
import { Avatar, matchScore } from "./Talent";

const statusChip = (s) => (s === "Completed" ? "green" : s === "Needs help" ? "red" : "teal");

export function EmployerDashboard() {
  const [empId, setEmpId] = useState("e1");
  const [posted, setPosted] = useState([]);
  const [form, setForm] = useState({ title: "", type: "Full time", track: "banking" });
  const emp = EMPLOYERS.find((e) => e.id === empId);
  const staff = LEARNERS.filter((l) => l.sponsor === emp.name);
  const jobs = [...JOBS.filter((j) => j.employer === empId), ...posted.filter((p) => p.employer === empId)];
  const pipeline = [
    { stage: "Applied", n: 14 }, { stage: "Interview", n: 6 }, { stage: "Offer", n: 2 }, { stage: "Hired", n: 3 },
  ];

  function post(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setPosted([...posted, { id: `n${posted.length}`, employer: empId, title: form.title, type: form.type, track: form.track, skills: [], pay: "Set at interview", city: emp.city }]);
    setForm({ ...form, title: "" });
  }

  return (
    <div>
      <div className="row between">
        <h2 style={{ margin: 0 }}>Employer dashboard</h2>
        <select className="input" style={{ maxWidth: 240 }} value={empId} onChange={(e) => setEmpId(e.target.value)} aria-label="Pick employer">
          {EMPLOYERS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <p className="muted">{emp.sector}, {emp.city}. Plan: {emp.plan}.</p>

      <div className="grid g4 section">
        <Stat n={emp.staffEnrolled} label="Staff in training" />
        <Stat n={staff.length} label="Sponsored learners" />
        <Stat n={jobs.length} label="Open roles" />
        <Stat n={3} label="Hired through Lumo" />
      </div>

      <div className="grid g2">
        <div className="panel">
          <h3>Sponsored learners</h3>
          {staff.length === 0 ? <p className="muted small">No sponsored learners yet. Sponsor a seat to start your pipeline.</p> : staff.map((l) => (
            <div key={l.id} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <Avatar name={l.name} size={32} />
              <div style={{ flex: 1 }}>
                <strong className="small">{l.name}</strong>
                <div className="small muted">{trackById(l.track).name}, {l.level}</div>
                <div className="bar" style={{ marginTop: 4 }}><span style={{ width: `${l.progress}%` }} /></div>
              </div>
              <span className={`chip ${statusChip(l.status)}`}>{l.status}</span>
            </div>
          ))}
          <button className="btn ghost small" style={{ marginTop: 12 }}>Enroll more staff</button>
        </div>
        <div className="panel">
          <h3>Hiring pipeline</h3>
          {pipeline.map((p) => (
            <div key={p.stage} style={{ margin: "8px 0" }}>
              <div className="row between small"><span>{p.stage}</span><strong>{p.n}</strong></div>
              <div className="bar"><span style={{ width: `${(p.n / 14) * 100}%`, background: "var(--plum)" }} /></div>
            </div>
          ))}
          <p className="small muted" style={{ marginTop: 10 }}>Placement fee: 10% of first year pay, only when you hire.</p>
        </div>
      </div>

      <div className="grid g2 section">
        <form className="panel" onSubmit={post}>
          <h3>Post a role</h3>
          <input className="input" placeholder="Role title, for example Junior Data Analyst" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="row" style={{ marginTop: 10 }}>
            <select className="input" style={{ flex: 1 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["Full time", "Internship", "Freelance", "Live project"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className="input" style={{ flex: 1 }} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
              {LIVE_TRACKS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button className="btn" style={{ marginTop: 12 }} type="submit">Post role</button>
        </form>
        <div className="panel">
          <h3>Your open roles</h3>
          {jobs.map((j) => {
            const top = LEARNERS.map((l) => ({ l, s: matchScore(l, j) })).sort((a, b) => b.s - a.s)[0];
            return (
              <div key={j.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <strong className="small">{j.title}</strong> <span className="chip">{j.type}</span>
                <div className="small muted">Top match: {top.l.name} ({top.s}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StudentTracking() {
  const [view, setView] = useState("staff");
  const [filter, setFilter] = useState("All");
  const rows = LEARNERS.filter((l) => filter === "All" || l.status === filter);
  const help = LEARNERS.filter((l) => l.status === "Needs help").length;
  return (
    <div>
      <h2>Student tracking</h2>
      <div className="row between" style={{ margin: "10px 0 18px" }}>
        <div className="seg">
          {[["staff", "Hub staff"], ["university", "University"], ["employer", "Employer"]].map(([k, l]) => <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>{l} view</button>)}
        </div>
        <div className="seg">
          {["All", "On track", "Needs help", "Completed"].map((s) => <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>{s}</button>)}
        </div>
      </div>
      <div className="grid g4" style={{ marginBottom: 18 }}>
        <Stat n={LEARNERS.length} label="Active learners" />
        <Stat n={Math.round(LEARNERS.reduce((a, l) => a + l.attendance, 0) / LEARNERS.length) + "%"} label="Avg attendance" />
        <Stat n={help} label="Need help this week" tone="red" />
        <Stat n={LEARNERS.filter((l) => l.status === "Completed").length} label="Completed" tone="green" />
      </div>
      {view === "university" && <p className="small muted">Universities see their students and earn a share of advanced class revenue run on campus.</p>}
      {view === "employer" && <p className="small muted">Employers see only the staff and students they sponsor.</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Learner</th><th>Path</th><th>Track and level</th><th>Progress</th><th>Attendance</th><th>Status</th>{view !== "university" && <th>Sponsor</th>}</tr></thead>
          <tbody>
            {rows.filter((l) => view !== "employer" || l.sponsor).map((l) => (
              <tr key={l.id}>
                <td><div className="row"><Avatar name={l.name} size={28} />{l.name}</div></td>
                <td style={{ textTransform: "capitalize" }}>{l.path}</td>
                <td>{trackById(l.track).name}<div className="small muted">{l.level}</div></td>
                <td style={{ minWidth: 120 }}><div className="bar"><span style={{ width: `${l.progress}%` }} /></div><span className="small muted">{l.progress}%</span></td>
                <td>{l.attendance}%</td>
                <td><span className={`chip ${statusChip(l.status)}`}>{l.status}</span></td>
                {view !== "university" && <td className="small">{l.sponsor || "None"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>After training, each learner is checked at 6 and 12 months for job, income, and business results. Those feed the Outcomes page.</p>
    </div>
  );
}

export function Outcomes() {
  const o = OUTCOMES;
  const maxE = Math.max(...o.byMonth.map((m) => m.enrolled));
  const maxS = Math.max(...o.bySector.map((s) => s.placed));
  return (
    <div>
      <h2>Outcomes</h2>
      <p className="muted">A certificate is not a paycheck. We count jobs, income, and businesses, not just sign ups.</p>
      <div className="grid g4 section">
        <Stat n={o.enrolled} label="Learners enrolled" />
        <Stat n={o.placed} label="Placed in jobs" tone="green" />
        <Stat n={o.internships} label="Internships" />
        <Stat n={o.businesses} label="Businesses started" />
        <Stat n={`+${o.avgIncomeGain}%`} label="Avg income gain after placement" tone="green" />
        <Stat n={`${o.sixMonthRetention}%`} label="Still employed at 6 months" />
        <Stat n={`${Math.round((o.completed / o.enrolled) * 100)}%`} label="Completion rate" />
        <Stat n={`${Math.round((o.placed / o.completed) * 100)}%`} label="Of graduates placed" />
      </div>
      <div className="grid g2">
        <div className="panel">
          <h3>Enrollments and placements by month</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, marginTop: 14 }}>
            {o.byMonth.map((m) => (
              <div key={m.m} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 150, justifyContent: "center" }}>
                  <div title={`${m.enrolled} enrolled`} style={{ width: 14, height: `${(m.enrolled / maxE) * 100}%`, background: "var(--teal)", borderRadius: 4 }} />
                  <div title={`${m.placed} placed`} style={{ width: 14, height: `${(m.placed / maxE) * 100}%`, minHeight: 4, background: "var(--plum)", borderRadius: 4 }} />
                </div>
                <div className="small muted">{m.m}</div>
              </div>
            ))}
          </div>
          <div className="row small" style={{ marginTop: 8 }}><span className="chip teal">Enrolled</span><span className="chip plum">Placed</span></div>
        </div>
        <div className="panel">
          <h3>Placements by sector</h3>
          {o.bySector.map((s) => (
            <div key={s.s} style={{ margin: "10px 0" }}>
              <div className="row between small"><span>{s.s}</span><strong>{s.placed}</strong></div>
              <div className="bar"><span style={{ width: `${(s.placed / maxS) * 100}%`, background: "var(--plum)" }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Stat({ n, label, tone }) {
  const color = tone === "red" ? "var(--red)" : tone === "green" ? "var(--green)" : "var(--plum-deep)";
  return (
    <div className="panel">
      <div className="stat" style={{ color }}>{n}</div>
      <div className="small muted" style={{ marginTop: 6 }}>{label}</div>
    </div>
  );
}
