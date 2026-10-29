import React, { useEffect, useState } from "react";
import { STR } from "./i18n";
import { LEARNERS } from "./data/demo";
import { LIVE_TRACKS, SOON_TRACKS, SECTORS } from "./data/tracks";
import { TrackLibrary, TrackDetail, TrackQuiz } from "./components/Tracks";
import { TalentNetwork, Profile } from "./components/Talent";
import { EmployerDashboard, StudentTracking, Outcomes } from "./components/Dashboards";
import { HubBooking, BusinessBuilder, PlumberFix } from "./components/Services";

const ME = { student: "l1", community: "l3", professional: "l4" };

function Gate({ onUnlock }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const d = await r.json();
      if (d.ok) onUnlock(); else setError("That code didn't work. Check it and try again.");
    } catch { onUnlock(); }
    setBusy(false);
  }
  return (
    <div className="gate">
      <form className="panel" onSubmit={submit}>
        <div className="brand" style={{ padding: 0, marginBottom: 14 }}><span className="brand-mark" />Lumo Hubs</div>
        <h2>Enter your access code</h2>
        <p className="muted small">Your university, employer, or Lumo Hubs team gave you this code.</p>
        <input className="input" type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Access code" autoFocus aria-label="Access code" />
        {error && <div className="err">{error}</div>}
        <button className="btn" style={{ marginTop: 12, width: "100%" }} disabled={busy || !code}>{busy ? "Checking..." : "Enter"}</button>
      </form>
    </div>
  );
}

function Home({ go, setRole, openTrack }) {
  const paths = [
    { role: "student", title: "I'm a student", body: "Train free alongside your degree. Build a portfolio, land internships, and get hired.", cta: "Start as a student", to: "quiz" },
    { role: "community", title: "I'm joining from the community", body: "New skills for a new job, a career change, or a return to work. Your first track is free.", cta: "Find my track", to: "quiz" },
    { role: "employer", title: "I'm a professional or employer", body: "Train your staff on AI with your own tools, sponsor students, and hire proven talent.", cta: "Open the employer view", to: "employer" },
  ];
  return (
    <div>
      <section className="hero">
        <h1>We don't just teach AI.<span className="line2">We put it to work.</span></h1>
        <p style={{ fontSize: "1.15rem" }} className="muted">Lumo Hubs trains students, community members, and professionals in {LIVE_TRACKS.length} tracks across {SECTORS.length} sectors, then connects them to real jobs. One place from learning to a paycheck.</p>
        <div className="path" aria-label="How Lumo Hubs works">
          <div><strong>Learn</strong><span className="small muted">Free Foundation tracks</span></div>
          <div><strong>Practice</strong><span className="small muted">Real employer projects</span></div>
          <div><strong>Prove it</strong><span className="small muted">Portfolio and certificate</span></div>
          <div><strong>Get placed</strong><span className="small muted">Jobs and internships</span></div>
          <div><strong>Track it</strong><span className="small muted">Jobs and income at 6 and 12 months</span></div>
        </div>
      </section>

      <div className="grid g3 section">
        {paths.map((p) => (
          <div key={p.role} className="panel" style={{ display: "flex", flexDirection: "column" }}>
            <h3>{p.title}</h3>
            <p className="muted" style={{ flex: 1 }}>{p.body}</p>
            <div><button className="btn" onClick={() => { setRole(p.role); go(p.to); }}>{p.cta}</button></div>
          </div>
        ))}
      </div>

      <div className="grid g2 section">
        <div className="panel tint">
          <h3>Foundation: free</h3>
          <p style={{ margin: 0 }}>For students and community members. Six week tracks online and at the hub, each opening with a free 2 week starter and ending in a portfolio project.</p>
        </div>
        <div className="panel tint">
          <h3>Advanced: paid by employers</h3>
          <p style={{ margin: 0 }}>Companies pay to train their staff on their own systems, or sponsor students they want to hire. Partner universities share in advanced classes run on campus.</p>
        </div>
      </div>

      <div className="section">
        <div className="row between"><h2 style={{ margin: 0 }}>Popular tracks</h2><button className="btn ghost small" onClick={() => go("tracks")}>See all {LIVE_TRACKS.length + SOON_TRACKS.length} tracks</button></div>
        <div className="grid g4" style={{ marginTop: 14 }}>
          {["banking", "energy", "data-analytics", "plumbing"].map((id) => {
            const t = LIVE_TRACKS.find((x) => x.id === id);
            return (
              <button key={id} className="card-btn" onClick={() => openTrack(id)}>
                <span style={{ fontSize: 26 }} aria-hidden>{t.icon}</span>
                <h3 style={{ marginTop: 6, fontSize: "1.05rem" }}>{t.name}</h3>
                <div className="small muted">{t.avgPay}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { group: "learn", items: [["home", "🏠"], ["tracks", "📚"], ["quiz", "🧭"], ["portfolio", "🪪"], ["builder", "🚀"]] },
  { group: "work", items: [["talent", "💼"], ["employer", "🏢"], ["plumberfix", "🔧"]] },
  { group: "run", items: [["tracking", "📋"], ["hub", "🎙️"], ["outcomes", "📈"]] },
];

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState("home");
  const [trackId, setTrackId] = useState(null);
  const [role, setRole] = useState("student");
  const [lang, setLang] = useState("en");
  const [progress, setProgress] = useState(() => { try { return JSON.parse(localStorage.getItem("lh-progress") || "{}"); } catch { return {}; } });
  const [waitlist, setWaitlist] = useState([]);
  const [applications, setApplications] = useState([]);
  const t = STR[lang];

  useEffect(() => {
    // If no access code is set on the server, open the site straight away.
    fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then((r) => r.json()).then((d) => { if (d.open) setUnlocked(true); })
      .catch(() => setUnlocked(true))
      .finally(() => setChecked(true));
  }, []);
  useEffect(() => { try { localStorage.setItem("lh-progress", JSON.stringify(progress)); } catch {} }, [progress]);
  useEffect(() => { document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { window.scrollTo(0, 0); }, [view, trackId]);

  if (!checked) return null;
  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  const me = LEARNERS.find((l) => l.id === (ME[role] || "l1"));
  const go = (v) => { setView(v); setTrackId(null); };
  const openTrack = (id) => { setView("tracks"); setTrackId(id); };

  const navButtons = NAV.map((g) => (
    <div key={g.group}>
      <div className="nav-group">{t[g.group]}</div>
      {g.items.map(([k, icon]) => (
        <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => go(k)} aria-current={view === k ? "page" : undefined}>
          <span aria-hidden>{icon}</span>{t[k]}
        </button>
      ))}
    </div>
  ));

  let page;
  if (view === "home") page = <Home go={go} setRole={setRole} openTrack={openTrack} />;
  else if (view === "tracks") page = trackId
    ? <TrackDetail id={trackId} onBack={() => setTrackId(null)} waitlist={waitlist} onJoinWaitlist={(id) => setWaitlist([...waitlist, id])} progress={progress} setProgress={setProgress} />
    : <TrackLibrary onOpen={openTrack} lang={lang} />;
  else if (view === "quiz") page = <TrackQuiz onOpen={openTrack} />;
  else if (view === "portfolio") page = <Profile me={me} progress={progress} />;
  else if (view === "builder") page = <BusinessBuilder />;
  else if (view === "talent") page = <TalentNetwork me={me} applications={applications} setApplications={setApplications} />;
  else if (view === "employer") page = <EmployerDashboard />;
  else if (view === "plumberfix") page = <PlumberFix onOpenTrack={openTrack} />;
  else if (view === "tracking") page = <StudentTracking />;
  else if (view === "hub") page = <HubBooking role={role} />;
  else if (view === "outcomes") page = <Outcomes />;

  return (
    <div className="shell">
      <aside className="side" aria-label="Main menu">
        <div className="brand"><span className="brand-mark" />Lumo Hubs</div>
        {navButtons}
      </aside>
      <div className="main">
        <div className="mobile-nav" aria-label="Main menu">
          {NAV.flatMap((g) => g.items).map(([k, icon]) => (
            <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => go(k)}><span aria-hidden>{icon}</span>{t[k]}</button>
          ))}
        </div>
        <header className="topbar">
          <div className="row">
            <span className="small muted">{t.viewAs}</span>
            <select className="input" style={{ width: "auto", padding: "6px 10px" }} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Viewing as">
              <option value="student">{t.student}</option>
              <option value="community">{t.community}</option>
              <option value="professional">{t.professional}</option>
              <option value="employer">{t.employerRole}</option>
              <option value="staff">{t.staff}</option>
            </select>
            <span className="sample">{t.sample}</span>
          </div>
          <div className="row">
            <div className="seg" aria-label="Language">
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
              <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>العربية</button>
            </div>
          </div>
        </header>
        <main className="page">{page}</main>
        <footer className="page small muted" style={{ paddingTop: 0 }}>Lumo Hubs. AI features powered by Claude. Sample names and numbers are for demonstration only.</footer>
      </div>
    </div>
  );
}
