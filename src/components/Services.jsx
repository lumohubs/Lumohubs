import React, { useState } from "react";
import { HUB_SPACES, HUB_HOURS, PLUMBERS, LEARNERS } from "../data/demo";
import { askClaude, readImage } from "../ai";
import { Avatar } from "./Talent";
import { Stat } from "./Dashboards";

export function HubBooking({ role }) {
  const [space, setSpace] = useState(HUB_SPACES[0].id);
  const [day, setDay] = useState(0);
  const [picked, setPicked] = useState([]);
  const [bookings, setBookings] = useState([]);
  const s = HUB_SPACES.find((x) => x.id === space);
  const isStudent = role === "student";
  const rate = isStudent ? s.student : s.rate;
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const taken = (h) => (h.length + day + space.length) % 4 === 0;
  const toggle = (h) => setPicked(picked.includes(h) ? picked.filter((x) => x !== h) : [...picked, h]);

  function book() {
    setBookings([...bookings, { space: s.name, date: days[day].toDateString(), hours: picked, total: picked.length * rate }]);
    setPicked([]);
  }

  return (
    <div>
      <h2>Hub booking</h2>
      <p className="muted">Book studios and labs by the hour. Open 9am to 9pm. Students pay a discounted rate.</p>
      <div className="grid g3 section" style={{ marginTop: 16 }}>
        {HUB_SPACES.map((x) => (
          <button key={x.id} className="card-btn" disabled={x.soon} onClick={() => { setSpace(x.id); setPicked([]); }} style={{ borderColor: space === x.id ? "var(--plum)" : undefined, borderWidth: space === x.id ? 2 : 1, opacity: x.soon ? 0.55 : 1 }}>
            <div className="row between"><span style={{ fontSize: 26 }} aria-hidden>{x.icon}</span>{x.soon && <span className="chip gold">Coming soon</span>}</div>
            <strong>{x.name}</strong>
            <div className="small muted">QAR {x.rate}/hr, students QAR {x.student}/hr</div>
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="row" style={{ marginBottom: 12 }}>
          {days.map((d, i) => (
            <button key={i} className={`btn small ${day === i ? "" : "ghost"}`} onClick={() => { setDay(i); setPicked([]); }}>
              {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
            </button>
          ))}
        </div>
        <div className="grid g4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
          {HUB_HOURS.map((h) => {
            const busy = taken(h);
            const on = picked.includes(h);
            return (
              <button key={h} disabled={busy} onClick={() => toggle(h)} className="btn small" style={{ background: busy ? "var(--surface)" : on ? "var(--teal)" : "var(--bg)", color: busy ? "var(--muted)" : on ? "#fff" : "var(--ink)", border: "1px solid var(--line)", textDecoration: busy ? "line-through" : "none" }}>
                {h}
              </button>
            );
          })}
        </div>
        <div className="row between" style={{ marginTop: 16 }}>
          <div><strong>{picked.length} hour{picked.length === 1 ? "" : "s"}</strong> <span className="muted">x QAR {rate} = QAR {picked.length * rate}</span></div>
          <button className="btn" disabled={!picked.length} onClick={book}>Book and pay</button>
        </div>
      </div>
      {bookings.length > 0 && (
        <div className="section">
          <h3>Your bookings</h3>
          {bookings.map((b, i) => <div key={i} className="panel tint" style={{ marginBottom: 8 }}><strong>{b.space}</strong>, {b.date}, {b.hours.join(", ")}. Paid QAR {b.total}.</div>)}
        </div>
      )}
    </div>
  );
}

export function BusinessBuilder() {
  const [idea, setIdea] = useState("");
  const [team, setTeam] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function build() {
    if (!idea.trim()) return;
    setBusy(true); setOut(""); setErr("");
    const r = await askClaude({
      system: "You are the Lumo Hubs AI Business Builder. You coach student teams from idea to launch. Plain language, short sections, no dashes, practical steps. Assume the team has a small budget and access to a Lumo hub (studios, labs, mentors).",
      prompt: `Our idea: ${idea}\nOur team: ${team || "not given"}\n\nGive us:\n1. The problem and who pays, in 2 sentences\n2. Our first product, kept small\n3. A 6 step launch plan for the next 30 days\n4. How we make money, with a simple price\n5. Three risks and how to test each cheaply\n6. Which Lumo hub spaces or tracks would help us`,
      maxTokens: 1100,
    });
    if (r.error) setErr(r.error); else setOut(r.text);
    setBusy(false);
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <h2>AI Business Builder</h2>
      <p className="muted">Teams form, pick an idea, and the AI mentor walks them from idea to launch. Every student can become a CEO.</p>
      <div className="panel" style={{ marginTop: 14 }}>
        <label className="small muted" htmlFor="idea">Your business idea</label>
        <textarea id="idea" className="input" placeholder="For example: a weekend plumbing repair service for apartment buildings in Doha" value={idea} onChange={(e) => setIdea(e.target.value)} />
        <label className="small muted" htmlFor="team" style={{ display: "block", marginTop: 10 }}>Your team (optional)</label>
        <input id="team" className="input" placeholder="For example: 3 students, one in plumbing, one in marketing, one in data" value={team} onChange={(e) => setTeam(e.target.value)} />
        <button className="btn" style={{ marginTop: 12 }} disabled={busy || !idea.trim()} onClick={build}>{busy ? "Building your plan..." : "Build my launch plan"}</button>
        {err && <div className="err">{err}</div>}
      </div>
      {out && <div className="ai-box" style={{ marginTop: 16 }}>{out}<div className="ai-src">AI Business Builder, powered by Claude</div></div>}
    </div>
  );
}

export function PlumberFix({ onOpenTrack }) {
  const [tab, setTab] = useState("hire");
  return (
    <div>
      <div className="row between">
        <div>
          <h2 style={{ margin: 0 }}>PlumberFix AI</h2>
          <p className="muted" style={{ marginTop: 6 }}>The first company built inside Lumo Hubs. Train plumbers, then send them real jobs.</p>
        </div>
        <div className="seg">
          {[["hire", "Hire a plumber"], ["train", "Train"], ["pros", "For plumbers"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>
      </div>
      <div className="section">
        {tab === "hire" && <HirePlumber />}
        {tab === "train" && <TrainPlumbers onOpenTrack={onOpenTrack} />}
        {tab === "pros" && <ForPlumbers />}
      </div>
    </div>
  );
}

function HirePlumber() {
  const [photo, setPhoto] = useState(null);
  const [desc, setDesc] = useState("");
  const [area, setArea] = useState("Doha");
  const [busy, setBusy] = useState(false);
  const [diag, setDiag] = useState("");
  const [err, setErr] = useState("");
  const [booked, setBooked] = useState(null);

  async function check() {
    setBusy(true); setDiag(""); setErr("");
    const r = await askClaude({
      system: "You are PlumberFix AI. You help homeowners understand a plumbing problem before a plumber arrives. Plain language, under 160 words, no dashes. Give: what it likely is, how urgent it is (low, medium, or urgent), one safe thing to do now, and a rough price range in QAR. Say a licensed plumber will confirm.",
      prompt: `Problem: ${desc || "see photo"}. Area: ${area}.`,
      image: photo,
      maxTokens: 400,
    });
    if (r.error) setErr(r.error); else setDiag(r.text);
    setBusy(false);
  }

  if (booked) {
    return (
      <div className="panel tint" style={{ maxWidth: 560 }}>
        <h3>Booked</h3>
        <p>{booked.name} is booked for your job in {area}. They'll confirm the time by text.</p>
        <button className="btn ghost small" onClick={() => { setBooked(null); setDiag(""); setPhoto(null); setDesc(""); }}>Book another job</button>
      </div>
    );
  }

  return (
    <div className="grid g2">
      <div className="panel">
        <h3>Tell us what's wrong</h3>
        <textarea className="input" placeholder="For example: water dripping under the kitchen sink" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <div className="row" style={{ marginTop: 10 }}>
          <select className="input" style={{ flex: 1 }} value={area} onChange={(e) => setArea(e.target.value)}>
            {["Doha", "Al Rayyan", "Lusail", "Al Wakrah"].map((a) => <option key={a}>{a}</option>)}
          </select>
          <label className="btn ghost small" style={{ cursor: "pointer" }}>
            {photo ? "Photo added" : "Add a photo"}
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files[0]; if (f) setPhoto(await readImage(f)); }} />
          </label>
        </div>
        {photo && <img src={photo.url} alt="Your plumbing problem" style={{ maxHeight: 150, borderRadius: 8, marginTop: 10 }} />}
        <button className="btn teal" style={{ marginTop: 12 }} disabled={busy || (!desc.trim() && !photo)} onClick={check}>{busy ? "Checking..." : "Check it with AI"}</button>
        {err && <div className="err">{err}</div>}
        {diag && <div className="ai-box">{diag}<div className="ai-src">PlumberFix AI, powered by Claude</div></div>}
      </div>
      <div className="panel">
        <h3>Plumbers near you</h3>
        <p className="small muted">All trained and checked through Lumo Hubs.</p>
        {PLUMBERS.map((p) => (
          <div key={p.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <Avatar name={p.name} size={36} />
            <div style={{ flex: 1 }}>
              <strong>{p.name}</strong> <span className="chip teal">{p.level}</span>
              <div className="small muted">{p.rating} stars, {p.jobs} jobs, {p.area}</div>
            </div>
            <button className="btn small" onClick={() => setBooked(p)}>Book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainPlumbers({ onOpenTrack }) {
  const trainees = LEARNERS.filter((l) => l.track === "plumbing");
  return (
    <div className="grid g2">
      <div className="panel">
        <h3>The plumbing track</h3>
        <p>6 weeks with Jabari Richards' lessons and PlumberFix AI photo checks. Students and community members train free at Foundation level, then practice in the hub's plumbing lab.</p>
        <div className="row"><button className="btn" onClick={() => onOpenTrack("plumbing")}>Open the plumbing track</button></div>
      </div>
      <div className="panel">
        <h3>From trainee to paid plumber</h3>
        {["Train in the plumbing track", "Practice in the hub lab", "Earn the partner university certificate", "Join PlumberFix AI and get booked"].map((s, i) => (
          <div key={s} className="row" style={{ padding: "6px 0" }}><span className="chip plum">{i + 1}</span>{s}</div>
        ))}
        <p className="small muted" style={{ marginTop: 8 }}>In training now: {trainees.map((t) => t.name).join(", ") || "none"}</p>
      </div>
    </div>
  );
}

function ForPlumbers() {
  return (
    <div>
      <div className="grid g4">
        <Stat n="QAR 220" label="Monthly plan, about $60" />
        <Stat n="AI" label="Photo diagnosis on every job" />
        <Stat n="Jobs" label="Booked straight to your phone" />
        <Stat n="Ratings" label="Build your name with every job" />
      </div>
      <div className="panel section">
        <h3>Join PlumberFix AI</h3>
        <p>Get matched to jobs near you, use AI to diagnose before you arrive, and grow your ratings. Lumo trained plumbers join at a lower first year price.</p>
        <button className="btn">Apply to join</button>
      </div>
    </div>
  );
}
