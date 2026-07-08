import { useState, useRef } from "react";

// ─── ACCESS CODE (change this to update the password) ───────────
const ACCESS_CODE = "LumoHubs2026";

// ─── PASSWORD GATE ───────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (input.trim() === ACCESS_CODE) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, #5C0F5C 0%, #028090 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif", padding: 20
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: 20, padding: "48px 40px",
        width: "100%", maxWidth: 420, textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: shake ? "shake 0.4s ease" : "none"
      }}>
        {/* Logo */}
        <div style={{ fontSize: 36, marginBottom: 8 }}>✦</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#5C0F5C", marginBottom: 4 }}>Lumo Hubs</div>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 32 }}>AI Learning Platform</div>

        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Enter your access code</div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
          Students: use the code from your university.<br/>
          Partners and reviewers: use your provided code.
        </div>

        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Access code"
          style={{
            width: "100%", padding: "13px 16px", fontSize: 15,
            border: `2px solid ${error ? "#E11D48" : "#E2E8F0"}`,
            borderRadius: 10, outline: "none", marginBottom: 8,
            boxSizing: "border-box", textAlign: "center", letterSpacing: "0.15em",
            color: "#111827", background: error ? "#FFF1F2" : "#F8FAFC"
          }}
        />

        {error && (
          <div style={{ fontSize: 12, color: "#E11D48", marginBottom: 12 }}>
            Incorrect code. Please try again or contact Lumo Hubs.
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "13px", fontSize: 15, fontWeight: 700,
            background: "linear-gradient(90deg, #5C0F5C 0%, #028090 100%)",
            color: "#FFFFFF", border: "none", borderRadius: 10, cursor: "pointer",
            marginBottom: 24
          }}
        >
          Access Platform →
        </button>

        <div style={{ fontSize: 11, color: "#94A3B8" }}>
          Need access? Contact us at{" "}
          <a href="mailto:info@lumohubs.com" style={{ color: "#028090", fontWeight: 600 }}>
            info@lumohubs.com
          </a>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}



// ─── BRAND COLORS ───────────────────────────────────────────────
const C = {
  purple: "8B1A8B",
  purpleDark: "5C0F5C",
  purpleLight: "B44AB4",
  teal: "028090",
  tealLight: "02A8BE",
  tealBg: "E6F7FA",
  purpleBg: "F7EFF7",
  white: "FFFFFF",
  gray: "64748B",
  lightGray: "F1F5F9",
  border: "E2E8F0",
  green: "16A34A",
  gold: "D97706",
  dark: "111827",
};

const PURPLE = "#8B1A8B";
const TEAL = "#028090";
const TEAL_LIGHT = "#02A8BE";
const PURPLE_DARK = "#5C0F5C";
const PURPLE_LIGHT = "#B44AB4";
const WHITE = "#FFFFFF";
const LIGHT_GRAY = "#F1F5F9";
const BORDER = "#E2E8F0";
const DARK = "#111827";
const GRAY = "#64748B";
const GREEN = "#16A34A";
const GOLD = "#D97706";
const TEAL_BG = "#E6F7FA";
const PURPLE_BG = "#F7EFF7";

// ─── DATA ────────────────────────────────────────────────────────
const TRACKS = [
  // ── VOCATIONAL TRADES ──
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "🔧",
    type: "vocational",
    agent: "Plumbafix AI",
    tagline: "Fix it. Build it. Understand it.",
    description: "Learn to diagnose and repair plumbing systems using AI. Take a photo of any issue and get step-by-step guidance.",
    demand: "Very High",
    avgPay: "$25–$80/hr",
    weeks: [
      { week: 1, title: "Water Systems Basics", focus: "Pipes, valves, and water flow. How a home plumbing system works.", tools: ["Pipe wrench", "Teflon tape", "PVC cutter", "Plumbafix AI app"], ai: "AI identifies pipe types from a photo and tells you what fittings you need." },
      { week: 2, title: "Leak Detection & Repair", focus: "Finding and stopping leaks. Compression fittings and joint sealing.", tools: ["Pressure gauge", "Leak detector dye", "Compression fitting kit", "Plumbafix AI app"], ai: "Snap a photo of the leak. AI diagnoses the cause and gives you the repair steps." },
      { week: 3, title: "Fixtures & Installations", focus: "Installing faucets, toilets, and sinks from scratch.", tools: ["Basin wrench", "Wax ring kit", "Adjustable pliers", "Plumbafix AI app"], ai: "AI scans your fixture photo and shows a labeled diagram of every connection point." },
      { week: 4, title: "Drain Systems & Unclogging", focus: "Drain traps, venting, and clearing blockages.", tools: ["Drain snake", "Plunger", "Drain camera", "Plumbafix AI app"], ai: "AI reads your drain camera footage and pinpoints the clog location and type." },
      { week: 5, title: "Water Heaters", focus: "Tank and tankless water heater installation and repair.", tools: ["Pipe torch", "Solder", "Multimeter", "Plumbafix AI app"], ai: "AI diagnoses water heater issues from a photo — heating element, thermostat, or sediment." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: diagnose and fix a full bathroom plumbing system.", tools: ["Full toolkit", "Plumbafix AI app", "Certification checklist"], ai: "AI grades your work, flags any code violations, and prepares your certification report." },
    ]
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "⚡",
    type: "vocational",
    agent: "Circuit AI",
    tagline: "Wire it. Test it. Power it.",
    description: "Learn electrical systems safely using AI diagnostics. Photo-based fault detection so you learn by seeing real problems.",
    demand: "Very High",
    avgPay: "$30–$95/hr",
    weeks: [
      { week: 1, title: "Electrical Safety & Basics", focus: "Volts, amps, watts. How to use a multimeter and stay safe.", tools: ["Multimeter", "Insulated screwdrivers", "Voltage tester", "Circuit AI app"], ai: "AI reads your multimeter photo and tells you if the reading is safe or dangerous." },
      { week: 2, title: "Wiring & Circuits", focus: "Series vs parallel circuits. Running wire through walls.", tools: ["Wire stripper", "Fish tape", "Cable staples", "Circuit AI app"], ai: "AI identifies wire colors in your photo and explains what each one does in your circuit." },
      { week: 3, title: "Outlets, Switches & Panels", focus: "Installing outlets and switches. Reading a breaker panel.", tools: ["GFCI outlet kit", "Panel tester", "Wire nuts", "Circuit AI app"], ai: "Photograph your breaker panel. AI maps every circuit and flags any overloads." },
      { week: 4, title: "Lighting Systems", focus: "Recessed lighting, dimmers, and smart switches.", tools: ["Junction box", "Romex wire", "Smart switch kit", "Circuit AI app"], ai: "AI scans your lighting layout photo and recommends the correct wire gauge and breaker size." },
      { week: 5, title: "Troubleshooting Faults", focus: "Finding shorts, open circuits, and tripped GFCI issues.", tools: ["Clamp meter", "Thermal camera", "Circuit tracer", "Circuit AI app"], ai: "Send AI a photo of your thermal camera reading. It pinpoints hot spots that signal faults." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: wire a complete room from panel to fixtures.", tools: ["Full toolkit", "Circuit AI app", "NEC code reference"], ai: "AI cross-checks your wiring photo against electrical code and produces your certification report." },
    ]
  },
  {
    id: "woodwork",
    name: "Woodworking",
    icon: "🪵",
    type: "vocational",
    agent: "CraftAI",
    tagline: "Cut it. Shape it. Build it.",
    description: "Learn woodworking from hand tools to power tools. AI identifies wood types, grain patterns, and joinery issues from photos.",
    demand: "High",
    avgPay: "$20–$65/hr",
    weeks: [
      { week: 1, title: "Wood Types & Selection", focus: "Hardwood vs softwood. Reading grain patterns. Moisture content.", tools: ["Moisture meter", "Hand plane", "Marking gauge", "CraftAI app"], ai: "Photograph any wood piece. AI identifies the species, grain direction, and best use for it." },
      { week: 2, title: "Hand Tools Mastery", focus: "Chisels, saws, and planes. Accurate measurement and marking.", tools: ["Chisels", "Hand saw", "Try square", "CraftAI app"], ai: "AI analyzes your cut photo and tells you if it's square, what caused drift, and how to correct it." },
      { week: 3, title: "Power Tools & Safety", focus: "Table saw, router, and drill press operations.", tools: ["Table saw", "Router", "Drill press", "CraftAI app"], ai: "AI reviews a photo of your setup and flags any safety hazards before you make a cut." },
      { week: 4, title: "Joinery Techniques", focus: "Mortise and tenon, dovetails, and pocket screws.", tools: ["Pocket hole jig", "Dovetail jig", "Mallet", "CraftAI app"], ai: "AI inspects your joint photo, measures the gap, and tells you exactly how to tighten the fit." },
      { week: 5, title: "Finishing & Staining", focus: "Sanding, staining, sealing, and painting wood surfaces.", tools: ["Random orbital sander", "Stain brush", "Polyurethane", "CraftAI app"], ai: "AI reads your finish photo and identifies blotching, grain raising, or uneven coverage." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: build a furniture piece from raw lumber.", tools: ["Full toolkit", "CraftAI app", "Project blueprints"], ai: "AI evaluates your finished piece photo against craft standards and issues your certification." },
    ]
  },
  {
    id: "construction",
    name: "Construction",
    icon: "🏗️",
    type: "vocational",
    agent: "BuildAI",
    tagline: "Plan it. Pour it. Raise it.",
    description: "Learn construction from foundations to framing. AI reads site photos and helps you understand what needs to be done and why.",
    demand: "Very High",
    avgPay: "$25–$85/hr",
    weeks: [
      { week: 1, title: "Site Reading & Safety", focus: "Reading blueprints, site layout, and OSHA safety basics.", tools: ["Hard hat", "Safety vest", "Blueprint rolls", "BuildAI app"], ai: "Photograph any blueprint. AI explains every symbol, dimension, and material specification on the page." },
      { week: 2, title: "Foundations & Concrete", focus: "Footings, slabs, and concrete mixing and pouring.", tools: ["Concrete mixer", "Level", "Rebar", "BuildAI app"], ai: "AI scans your pour photo and detects voids, honeycombing, or incorrect slope before it sets." },
      { week: 3, title: "Framing", focus: "Wall framing, floor joists, and roof trusses.", tools: ["Framing hammer", "Nail gun", "Speed square", "BuildAI app"], ai: "AI reviews your framing photo and checks stud spacing, plumb, and header sizing against code." },
      { week: 4, title: "Masonry & Block Work", focus: "Laying block, brick, and stone. Mortar mixing and application.", tools: ["Trowel", "Jointer", "Block level", "BuildAI app"], ai: "Photograph your mortar joints. AI measures consistency and flags joints that will crack." },
      { week: 5, title: "Roofing & Weatherproofing", focus: "Sheathing, underlayment, flashing, and shingle installation.", tools: ["Roofing nailer", "Chalk line", "Flashing kit", "BuildAI app"], ai: "AI reads your roof photo and identifies any gaps in flashing or improper shingle overlap." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: frame and close-in a full room structure.", tools: ["Full toolkit", "BuildAI app", "Inspection checklist"], ai: "AI does a virtual walkthrough of your photo documentation and produces a punch list and certification." },
    ]
  },
  {
    id: "agriculture",
    name: "Agriculture & Aquaponics",
    icon: "🌱",
    type: "vocational",
    agent: "GrowAI",
    tagline: "Grow it. Harvest it. Feed it.",
    description: "Learn modern farming and aquaponics systems. AI diagnoses plant health, soil conditions, and water quality from photos.",
    demand: "High",
    avgPay: "$18–$55/hr",
    weeks: [
      { week: 1, title: "Soil & Growing Mediums", focus: "Soil types, pH, nutrients, and grow mediums for aquaponics.", tools: ["pH meter", "Soil test kit", "EC meter", "GrowAI app"], ai: "Photograph your soil or grow medium. AI reads texture and color to estimate pH and nutrient gaps." },
      { week: 2, title: "Plant Health & Disease", focus: "Identifying nutrient deficiencies, pests, and diseases.", tools: ["Magnifying loupe", "Spray bottle", "Neem oil", "GrowAI app"], ai: "Snap a photo of any leaf. AI diagnoses the exact deficiency or pest and prescribes the fix." },
      { week: 3, title: "Irrigation & Water Systems", focus: "Drip irrigation, flood and drain, and NFT channels.", tools: ["Drip emitters", "Timer", "Water pump", "GrowAI app"], ai: "AI maps your irrigation photo and shows where pressure loss or clogging is happening." },
      { week: 4, title: "Aquaponics System Setup", focus: "Fish tanks, grow beds, biofiltration, and cycling.", tools: ["Fish tank", "Grow bed media", "Air pump", "GrowAI app"], ai: "Photograph your water sample. AI reads ammonia, nitrite, and nitrate levels visually." },
      { week: 5, title: "Crop Planning & Harvest", focus: "Succession planting, yield calculation, and harvest timing.", tools: ["Planting calendar", "Harvest bins", "Brix meter", "GrowAI app"], ai: "AI analyzes a crop photo and estimates days to harvest, yield weight, and market value." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: run a full grow cycle and aquaponics system.", tools: ["Full system", "GrowAI app", "Harvest log"], ai: "AI reviews your grow log photos and certifies your apprentice-level competency." },
    ]
  },
  {
    id: "hvac",
    name: "HVAC",
    icon: "❄️",
    type: "vocational",
    agent: "ClimateAI",
    tagline: "Cool it. Heat it. Control it.",
    description: "Learn heating, ventilation, and air conditioning systems. One of the highest-demand trades globally. AI diagnoses systems from photos.",
    demand: "Very High",
    avgPay: "$30–$90/hr",
    weeks: [
      { week: 1, title: "HVAC Fundamentals", focus: "Heat transfer, refrigeration cycle, and system types.", tools: ["Manifold gauge set", "Thermometer", "HVAC manual", "ClimateAI app"], ai: "AI reads your manifold gauge photo and tells you if refrigerant pressures are in normal range." },
      { week: 2, title: "Air Handling Units", focus: "Filters, blowers, coils, and ductwork.", tools: ["Filter kit", "Duct tape", "Static pressure gauge", "ClimateAI app"], ai: "Photograph your air handler. AI checks coil cleanliness, filter condition, and blower wheel buildup." },
      { week: 3, title: "Refrigeration & Charging", focus: "Adding refrigerant, superheat and subcooling calculations.", tools: ["Refrigerant scale", "Manifold gauges", "Recovery machine", "ClimateAI app"], ai: "AI calculates correct charge from your gauge photo and ambient temperature reading." },
      { week: 4, title: "Thermostats & Controls", focus: "Wiring thermostats, smart controls, and zone systems.", tools: ["Smart thermostat kit", "Wire labels", "Multimeter", "ClimateAI app"], ai: "Photograph your thermostat wiring. AI maps every wire to the correct terminal for your system." },
      { week: 5, title: "Troubleshooting Failures", focus: "Diagnosing no-cool, no-heat, and airflow problems.", tools: ["Clamp meter", "Leak detector", "Thermal gun", "ClimateAI app"], ai: "AI reads a thermal gun photo of your unit and pinpoints which component is failing." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: full system diagnosis and tune-up.", tools: ["Full toolkit", "ClimateAI app", "EPA 608 prep materials"], ai: "AI runs you through a mock EPA 608 exam based on your system photos and logs." },
    ]
  },
  {
    id: "solar",
    name: "Solar & Renewable Energy",
    icon: "☀️",
    type: "vocational",
    agent: "SolarAI",
    tagline: "Capture it. Store it. Power it.",
    description: "The fastest-growing trade globally. Learn solar panel installation, battery storage, and grid systems with AI guidance.",
    demand: "Very High",
    avgPay: "$25–$80/hr",
    weeks: [
      { week: 1, title: "Solar Energy Basics", focus: "How photovoltaic cells work. DC vs AC power. Sun path analysis.", tools: ["Solar meter", "Compass", "Angle finder", "SolarAI app"], ai: "AI analyzes a photo of your roof or site and calculates optimal panel angle and placement." },
      { week: 2, title: "Panel Installation", focus: "Mounting systems, racking, and roof penetration sealing.", tools: ["Racking kit", "Torque wrench", "Flashing kit", "SolarAI app"], ai: "AI reviews your mounting photo and checks rail spacing, tilt, and flashing for water intrusion." },
      { week: 3, title: "Wiring Solar Systems", focus: "Series vs parallel wiring, combiner boxes, and conduit.", tools: ["MC4 connectors", "Conduit bender", "Wire puller", "SolarAI app"], ai: "Photograph your wiring layout. AI checks string sizing, voltage, and wire gauge for NEC compliance." },
      { week: 4, title: "Inverters & Battery Storage", focus: "String inverters, microinverters, and battery bank setup.", tools: ["Inverter kit", "Battery bank", "BMS controller", "SolarAI app"], ai: "AI reads your inverter display photo and tells you if output power is within normal spec." },
      { week: 5, title: "Grid Connection & Net Metering", focus: "Utility interconnection, disconnect switches, and permits.", tools: ["AC disconnect", "Production meter", "Permit drawings", "SolarAI app"], ai: "AI reviews your single-line diagram photo and flags any utility interconnection issues." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: design and document a complete solar install.", tools: ["Full toolkit", "SolarAI app", "NABCEP study guide"], ai: "AI grades your system design photos and prepares your NABCEP entry-level certification package." },
    ]
  },
  {
    id: "auto",
    name: "Auto Mechanics & EV",
    icon: "🚗",
    type: "vocational",
    agent: "MechanicAI",
    tagline: "Diagnose it. Fix it. Drive it.",
    description: "Learn combustion and electric vehicle repair. AI reads OBD codes, engine photos, and diagnostic scans to teach you what's wrong and why.",
    demand: "Very High",
    avgPay: "$25–$75/hr",
    weeks: [
      { week: 1, title: "How Engines Work", focus: "4-stroke cycle, engine components, and vehicle systems overview.", tools: ["OBD2 scanner", "Flashlight", "Basic tool set", "MechanicAI app"], ai: "Scan any OBD code. AI translates the code, explains the root cause, and gives you the fix order." },
      { week: 2, title: "Oil, Fluids & Filters", focus: "Engine oil, coolant, brake fluid, transmission fluid service.", tools: ["Drain pan", "Oil filter wrench", "Fluid tester strips", "MechanicAI app"], ai: "Photograph your oil dipstick or fluid color. AI tells you condition, contamination level, and service urgency." },
      { week: 3, title: "Brakes & Suspension", focus: "Pad and rotor replacement, caliper service, and alignment basics.", tools: ["Brake caliper tool", "Torque wrench", "Brake cleaner", "MechanicAI app"], ai: "AI measures rotor wear from your photo and tells you if it is within spec or needs replacement." },
      { week: 4, title: "Electrical & Sensors", focus: "Battery testing, alternator, starter, and sensor diagnostics.", tools: ["Battery tester", "Multimeter", "Sensor socket set", "MechanicAI app"], ai: "Photograph your battery terminals and connections. AI spots corrosion, loose cables, and voltage drop." },
      { week: 5, title: "Electric Vehicle Systems", focus: "EV high voltage safety, battery management, and motor systems.", tools: ["HV insulated gloves", "EV scanner", "Insulation tester", "MechanicAI app"], ai: "AI reads your EV battery health scan photo and identifies cell degradation and range loss causes." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: full vehicle inspection and diagnostic report.", tools: ["Full toolkit", "MechanicAI app", "ASE study materials"], ai: "AI uses your inspection photos to build a full vehicle condition report and ASE prep assessment." },
    ]
  },
  {
    id: "welding",
    name: "Welding & Metal Fabrication",
    icon: "🔥",
    type: "vocational",
    agent: "WeldAI",
    tagline: "Fuse it. Shape it. Strengthen it.",
    description: "Learn MIG, TIG, and stick welding with AI analysis of your welds. Get instant feedback on bead quality, penetration, and technique.",
    demand: "High",
    avgPay: "$22–$70/hr",
    weeks: [
      { week: 1, title: "Welding Safety & Setup", focus: "PPE, ventilation, gas cylinders, and machine setup.", tools: ["Welding helmet", "Gloves", "MIG welder", "WeldAI app"], ai: "Photograph your machine settings. AI checks wire speed, voltage, and gas flow for your material." },
      { week: 2, title: "MIG Welding Basics", focus: "Running straight beads, lap joints, and butt joints on mild steel.", tools: ["MIG welder", "Clamps", "Wire brush", "WeldAI app"], ai: "Photo your bead. AI measures width, height, and spatter pattern and grades your technique." },
      { week: 3, title: "TIG Welding", focus: "Tungsten prep, filler rod control, and welding thin metals.", tools: ["TIG torch", "Tungsten rods", "Filler rod", "WeldAI app"], ai: "AI reads your TIG bead photo and tells you if contamination, undercut, or porosity is present." },
      { week: 4, title: "Stick Welding & Outdoors", focus: "SMAW process, electrode selection, and vertical and overhead welding.", tools: ["Stick welder", "Electrode holder", "Slag hammer", "WeldAI app"], ai: "AI analyzes your slag removal photo and tells you if the weld underneath has inclusion defects." },
      { week: 5, title: "Metal Fabrication", focus: "Cutting, grinding, bending, and fitting metal assemblies.", tools: ["Angle grinder", "Metal brake", "Plasma cutter", "WeldAI app"], ai: "Photograph your fit-up gaps. AI measures joint gap and tells you the correct filler pass sequence." },
      { week: 6, title: "Apprentice Certification Prep", focus: "Final project: fabricate and weld a structural metal assembly.", tools: ["Full toolkit", "WeldAI app", "AWS D1.1 code book"], ai: "AI inspects your coupon photos, grades them against AWS standards, and produces your cert report." },
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical Careers",
    icon: "🏥",
    type: "vocational",
    agent: "MedAI",
    tagline: "Diagnose it. Treat it. Save lives.",
    description: "Learn healthcare from community health to clinical careers. Nursing prep, medical lab, radiology, pharmacy, and community health — with AI analyzing clinical photos, scans, and medical images to teach you what you are seeing and why it matters.",
    demand: "Very High",
    avgPay: "$20–$120/hr",
    weeks: [
      { week: 1, title: "Human Body & Clinical Foundations", focus: "Anatomy basics, vital signs, medical terminology, and how clinical settings work.", tools: ["Anatomy atlas app", "Stethoscope", "Blood pressure cuff", "MedAI app"], ai: "Photograph any anatomy diagram or clinical chart. AI explains every label, measurement, and what it means for patient care." },
      { week: 2, title: "Nursing Skills & Patient Care", focus: "Nursing fundamentals: medication administration, wound care, IV basics, and patient assessment.", tools: ["Nursing skills checklist", "Wound care kit", "Gloves and PPE", "MedAI app"], ai: "Upload a photo of a wound or injection site. AI assesses condition, identifies signs of infection, and recommends the correct care protocol." },
      { week: 3, title: "Radiology & Medical Imaging", focus: "Reading X-rays, CT scans, MRIs, and ultrasounds. Understanding what normal vs abnormal looks like.", tools: ["Radiology viewer app", "Sample scan library", "DICOM viewer", "MedAI app"], ai: "Upload any X-ray or scan image. AI walks you through what it sees, identifies key structures, and flags anything that warrants clinical attention." },
      { week: 4, title: "Medical Lab & Diagnostics", focus: "Blood work, urinalysis, microbiology basics, and reading lab results accurately.", tools: ["Lab result reference guide", "Microscope basics", "Sample result sheets", "MedAI app"], ai: "Photograph a lab result or microscope slide. AI interprets the values, explains what is in or out of range, and tells you what the clinical significance is." },
      { week: 5, title: "Pharmacy & Medication Management", focus: "Drug classes, dosage calculations, contraindications, and pharmacy operations.", tools: ["Drug reference app", "Dosage calculator", "Prescription pad samples", "MedAI app"], ai: "Upload a prescription or medication label. AI verifies the dosage, checks for contraindications, and explains the drug mechanism in plain language." },
      { week: 6, title: "Certification & Career Prep", focus: "NCLEX prep for nurses, board exam basics for radiology and lab technicians, and building your clinical portfolio.", tools: ["NCLEX prep app", "CV template", "Clinical portfolio guide", "MedAI app"], ai: "AI runs you through board-style clinical scenario questions, identifies your weak areas, and builds a personalized study plan for your specific certification." },
    ]
  },
  // ── FREELANCE ──
  {
    id: "freelance-writing",
    name: "Writing & Content",
    icon: "✍️",
    type: "freelance",
    tagline: "Write. Earn. Repeat.",
    description: "Get paid to write for businesses online. Learn copywriting, blogging, and content strategy through real AI-assisted projects.",
    demand: "High",
    avgPay: "$15–$85/hr",
    weeks: [
      { week: 1, title: "What Clients Actually Buy", focus: "Copywriting vs content writing vs ghostwriting. Finding your lane.", tools: ["Google Docs", "Fiverr account", "Grammarly", "Claude AI"], ai: "AI rewrites your sample in 3 styles so you can see which one matches your natural voice best." },
      { week: 2, title: "Writing for the Web", focus: "SEO basics, headlines, and writing for skimmability.", tools: ["Ubersuggest", "Hemingway App", "WordPress demo", "Claude AI"], ai: "AI scores your draft for readability and SEO and shows you exactly what to change." },
      { week: 3, title: "Building Your Portfolio", focus: "Writing 5 portfolio pieces across different niches.", tools: ["Google Docs", "Notion", "Canva", "Claude AI"], ai: "AI helps you pick niches based on your interests and shows you where the highest-paying demand is." },
      { week: 4, title: "Pitching & Proposals", focus: "Writing proposals that win. Pricing your work confidently.", tools: ["Fiverr", "Upwork", "Notion", "Claude AI"], ai: "AI critiques your proposal draft and shows you the exact changes that increase win rate." },
      { week: 5, title: "Your First Client", focus: "Finding, onboarding, and delivering for your first client.", tools: ["Fiverr", "Upwork", "Google Docs", "Claude AI"], ai: "AI coaches you through your first brief and helps you ask the right questions before you write." },
      { week: 6, title: "Building a Repeat Business", focus: "Retainers, referrals, and raising your rates.", tools: ["Notion", "Invoice generator", "Claude AI"], ai: "AI analyzes your completed work and suggests which services you should package into a retainer offer." },
    ]
  },
  {
    id: "freelance-design",
    name: "Design & Creative",
    icon: "🎨",
    type: "freelance",
    tagline: "Design. Deliver. Get Paid.",
    description: "Learn logo design, social media graphics, and video editing for paying clients on Fiverr and Upwork.",
    demand: "Very High",
    avgPay: "$20–$100/hr",
    weeks: [
      { week: 1, title: "Design Fundamentals", focus: "Color theory, typography, and layout basics.", tools: ["Canva", "Adobe Express", "Coolors.co", "Claude AI"], ai: "Share a design and AI gives you a professional critique: contrast, hierarchy, and spacing issues." },
      { week: 2, title: "Logo Design for Clients", focus: "Brand identity, logo variations, and file deliverables.", tools: ["Canva Pro", "Adobe Illustrator", "Looka", "Claude AI"], ai: "AI helps you interview the client by generating the right brand questions before you start designing." },
      { week: 3, title: "Social Media Graphics", focus: "Templates, brand kits, and content calendars for clients.", tools: ["Canva", "Buffer", "Adobe Express", "Claude AI"], ai: "AI generates a month of content ideas for any client niche so you can design a full package." },
      { week: 4, title: "Video Editing", focus: "Cutting, captions, transitions, and delivering polished reels.", tools: ["CapCut", "DaVinci Resolve", "Descript", "Claude AI"], ai: "AI writes scripts and captions for client videos so you only have to focus on the edit." },
      { week: 5, title: "Your First Design Client", focus: "Building a Fiverr gig, pricing, and first delivery.", tools: ["Fiverr", "Canva", "Google Drive", "Claude AI"], ai: "AI reviews your Fiverr gig description and optimizes it for search visibility and conversion." },
      { week: 6, title: "Packages & Scaling", focus: "Bundling services, upsells, and getting repeat clients.", tools: ["Notion", "Fiverr", "Invoice Ninja", "Claude AI"], ai: "AI designs a service package structure for you based on what top designers in your niche offer." },
    ]
  },
  {
    id: "freelance-tech",
    name: "Tech & Development",
    icon: "💻",
    type: "freelance",
    tagline: "Build. Deploy. Invoice.",
    description: "Learn web development and tech freelancing. Build real websites for real clients using AI as your coding partner.",
    demand: "Very High",
    avgPay: "$30–$120/hr",
    weeks: [
      { week: 1, title: "HTML & CSS Basics", focus: "Building your first webpage. Layouts and responsive design.", tools: ["VS Code", "Chrome DevTools", "CodePen", "Claude AI"], ai: "Paste your code into AI. It explains every line, fixes errors, and teaches you what you got wrong." },
      { week: 2, title: "JavaScript Fundamentals", focus: "Making pages interactive. Forms, buttons, and DOM basics.", tools: ["VS Code", "JavaScript.info", "CodePen", "Claude AI"], ai: "AI writes the first version of any function you describe, then walks you through how it works." },
      { week: 3, title: "WordPress for Clients", focus: "Building client sites fast using WordPress and Elementor.", tools: ["WordPress", "Elementor", "WooCommerce", "Claude AI"], ai: "AI generates full page copy and image descriptions for any client website you are building." },
      { week: 4, title: "Finding Tech Clients", focus: "Writing proposals, scoping projects, and avoiding scope creep.", tools: ["Upwork", "Fiverr", "Notion", "Claude AI"], ai: "AI helps you scope any project by turning a vague client brief into a clear deliverable list." },
      { week: 5, title: "Delivering & Getting Paid", focus: "Client handoff, documentation, and collecting payment.", tools: ["Stripe", "Notion", "Loom", "Claude AI"], ai: "AI writes your project handoff document and tutorial script so clients know how to use their site." },
      { week: 6, title: "Specializing & Raising Rates", focus: "Picking a tech niche and positioning yourself as the expert.", tools: ["LinkedIn", "Upwork", "Claude AI"], ai: "AI analyzes Upwork job posts in your niche and tells you which skills command the highest rates." },
    ]
  },
  {
    id: "freelance-marketing",
    name: "Marketing & Social Media",
    icon: "📈",
    type: "freelance",
    tagline: "Grow brands. Get paid.",
    description: "Learn social media management, SEO, and digital marketing for businesses using AI tools to work faster and smarter.",
    demand: "Very High",
    avgPay: "$20–$90/hr",
    weeks: [
      { week: 1, title: "Social Media Strategy", focus: "Platform differences, content types, and audience building.", tools: ["Buffer", "Later", "Canva", "Claude AI"], ai: "AI builds a 30-day content strategy for any niche in 60 seconds based on your target audience." },
      { week: 2, title: "Content Creation at Scale", focus: "Batching content, captions, hashtags, and scheduling.", tools: ["Canva", "CapCut", "Claude AI", "Metricool"], ai: "AI writes 30 captions, 50 hashtag sets, and 10 CTA variations for any brand you manage." },
      { week: 3, title: "SEO Basics", focus: "Keywords, on-page SEO, and getting found on Google.", tools: ["Ubersuggest", "Google Search Console", "Yoast", "Claude AI"], ai: "AI audits any webpage and gives you a prioritized list of SEO fixes that take under an hour each." },
      { week: 4, title: "Paid Ads Introduction", focus: "Meta Ads and Google Ads basics. Budget and targeting.", tools: ["Meta Ads Manager", "Google Ads", "Claude AI"], ai: "AI writes 5 ad variations for any product and predicts which hook will get the highest CTR." },
      { week: 5, title: "Landing Your First Client", focus: "Cold outreach, discovery calls, and setting expectations.", tools: ["Upwork", "LinkedIn", "Notion", "Claude AI"], ai: "AI writes personalized outreach messages for any prospect based on their social media presence." },
      { week: 6, title: "Reporting & Retention", focus: "Monthly reports, analytics, and keeping clients long-term.", tools: ["Google Analytics", "Metricool", "Notion", "Claude AI"], ai: "AI turns your raw analytics data into a clean client report with highlights and next month's plan." },
    ]
  },
  // ── CREATIVE / MEDIA ──
  {
    id: "media-youtube",
    name: "YouTube & Video Production",
    icon: "🎬",
    type: "creative",
    tagline: "Script it. Shoot it. Publish it.",
    description: "Learn video production from scripting to editing to publishing. Build a channel or produce videos for paying clients.",
    demand: "Very High",
    avgPay: "$20–$75/hr",
    weeks: [
      { week: 1, title: "YouTube Strategy", focus: "Niche selection, channel setup, and what makes videos get views.", tools: ["YouTube Studio", "TubeBuddy", "Claude AI"], ai: "AI analyzes any YouTube channel and tells you the content gaps you can fill to grow faster." },
      { week: 2, title: "Scripting & Storytelling", focus: "Hook, body, and call to action. Writing scripts that keep viewers watching.", tools: ["Google Docs", "Claude AI", "Notion"], ai: "Describe your video idea. AI writes a complete script with timestamps, B-roll notes, and CTAs." },
      { week: 3, title: "Filming Basics", focus: "Camera setup, lighting, audio, and backgrounds on any budget.", tools: ["Smartphone or camera", "Ring light", "Lavalier mic", "Claude AI"], ai: "Send AI a screenshot of your filming setup. It tells you exactly how to fix the lighting and framing." },
      { week: 4, title: "Editing for Retention", focus: "Cuts, pacing, captions, music, and thumbnail creation.", tools: ["CapCut", "DaVinci Resolve", "Canva", "Claude AI"], ai: "AI writes your video title, description, and tags optimized for YouTube search before you upload." },
      { week: 5, title: "Monetization Paths", focus: "AdSense, sponsorships, digital products, and video services for clients.", tools: ["YouTube Studio", "Gumroad", "Fiverr", "Claude AI"], ai: "AI builds a monetization roadmap for your specific channel size and niche." },
      { week: 6, title: "Production Certification Prep", focus: "Final project: produce and publish a complete video series.", tools: ["Full production kit", "Claude AI", "YouTube analytics"], ai: "AI reviews your video metrics and gives you a professional content audit with growth recommendations." },
    ]
  },
  {
    id: "media-gaming",
    name: "Game Development",
    icon: "🎮",
    type: "creative",
    tagline: "Design it. Code it. Launch it.",
    description: "Learn game development from concept to launch. Build real games using AI to write code, generate assets, and solve design problems.",
    demand: "High",
    avgPay: "$25–$90/hr",
    weeks: [
      { week: 1, title: "Game Design Fundamentals", focus: "Game loops, mechanics, and what makes games fun.", tools: ["Unity", "GDevelop", "Notion", "Claude AI"], ai: "Describe your game idea. AI builds a full game design document with mechanics, levels, and win conditions." },
      { week: 2, title: "Building with Unity", focus: "Scenes, objects, physics, and your first playable level.", tools: ["Unity", "Visual Studio", "Claude AI"], ai: "AI writes Unity C# scripts from plain English descriptions so you can build while you learn to code." },
      { week: 3, title: "Art & Assets", focus: "Sprites, tilemaps, UI design, and free asset pipelines.", tools: ["Aseprite", "Itch.io assets", "Midjourney", "Claude AI"], ai: "AI generates asset descriptions and style guides so your artist or AI image tool produces consistent art." },
      { week: 4, title: "Audio & Polish", focus: "Sound effects, background music, and game feel.", tools: ["Audacity", "Freesound.org", "Unity Audio", "Claude AI"], ai: "AI creates a full audio brief for your game so any music tool or composer knows exactly what you need." },
      { week: 5, title: "Publishing & Monetization", focus: "Itch.io, Google Play, and App Store submission.", tools: ["Unity Build settings", "Itch.io", "Google Play Console", "Claude AI"], ai: "AI writes your game store listing, screenshots description, and launch announcement for every platform." },
      { week: 6, title: "Portfolio & Freelance Gaming", focus: "Packaging your game as a portfolio piece and finding game dev clients.", tools: ["Itch.io", "Upwork", "LinkedIn", "Claude AI"], ai: "AI builds your game developer portfolio page content and optimizes it for freelance client searches." },
    ]
  },
  // ── BUSINESS SYSTEMS ──
  {
    id: "business-systems",
    name: "Business Systems & Tools",
    icon: "🖥️",
    type: "business",
    tagline: "Learn the tools. Get the job.",
    description: "Most graduates can't get hired because they have never touched the software businesses run on. Learn Salesforce, Monday.com, HubSpot, Slack, Notion, and more — with AI as your trainer so you practice like it is a real job.",
    demand: "Very High",
    avgPay: "$18–$65/hr",
    weeks: [
      { week: 1, title: "CRM Basics with Salesforce", focus: "What a CRM is, why every business uses one, and how to navigate Salesforce as a new user.", tools: ["Salesforce Trailhead (free)", "Chrome", "Notion", "Claude AI"], ai: "AI acts as your Salesforce trainer. Describe any screen you see and it walks you through exactly what to click and why." },
      { week: 2, title: "Project Management with Monday.com and Asana", focus: "Creating boards, assigning tasks, tracking deadlines, and reporting progress to a manager.", tools: ["Monday.com free trial", "Asana free", "Notion", "Claude AI"], ai: "AI builds you a sample work project inside Monday.com step by step so you practice on a real scenario, not a tutorial." },
      { week: 3, title: "Marketing and Sales Tools with HubSpot", focus: "Contacts, deals, email sequences, and reading a sales pipeline dashboard.", tools: ["HubSpot free CRM", "Gmail", "Canva", "Claude AI"], ai: "AI plays the role of your sales manager and quizzes you on what each HubSpot metric means and what action to take." },
      { week: 4, title: "Communication and Collaboration", focus: "Slack etiquette, Zoom best practices, Google Workspace, and async communication for remote teams.", tools: ["Slack free", "Google Docs", "Loom", "Claude AI"], ai: "AI gives you real workplace scenarios and coaches you on how to respond professionally in Slack and email." },
      { week: 5, title: "Data and Reporting with Excel and Google Sheets", focus: "Pivot tables, VLOOKUP, dashboards, and presenting data to a team without being a data analyst.", tools: ["Google Sheets", "Microsoft Excel", "Tableau Public", "Claude AI"], ai: "Paste any spreadsheet formula or error into AI. It explains what went wrong and rewrites it correctly with a plain-English explanation." },
      { week: 6, title: "AI Tools in the Workplace", focus: "How employees use Claude, Copilot, and Notion AI to work faster. Prompting for real job tasks.", tools: ["Claude AI", "Microsoft Copilot", "Notion AI", "Zapier"], ai: "AI assigns you 5 real workplace tasks and scores how well you used AI to complete each one faster than you would manually." },
    ]
  },
  // ── ECOMMERCE ──
  {
    id: "ecommerce",
    name: "E-Commerce",
    icon: "🛒",
    type: "ecommerce",
    tagline: "List it. Sell it. Scale it.",
    description: "Learn to build and run an online store from scratch. Shopify, Amazon, Etsy, and social selling — with AI handling the heavy lifting so you focus on selling.",
    demand: "Very High",
    avgPay: "$500–$10K+/mo (your store)",
    weeks: [
      { week: 1, title: "Picking Your Product & Niche", focus: "Product research, niche validation, and finding what sells online right now.", tools: ["Google Trends", "Jungle Scout", "TikTok", "Claude AI"], ai: "AI analyzes any product idea and tells you competition level, profit margin potential, and who your buyer is." },
      { week: 2, title: "Building Your Store", focus: "Shopify or Etsy setup, product pages, pricing, and checkout flow.", tools: ["Shopify", "Etsy", "Canva", "Claude AI"], ai: "AI writes your product titles, descriptions, and SEO tags so your listings get found from day one." },
      { week: 3, title: "Product Photos & Branding", focus: "Taking great product photos on a phone, brand colors, and packaging.", tools: ["Smartphone", "Canva", "Remove.bg", "Claude AI"], ai: "Upload a product photo. AI tells you how to improve the background, lighting, and angles to increase conversions." },
      { week: 4, title: "Driving Traffic", focus: "TikTok organic, Instagram Reels, Pinterest, and paid ads for e-commerce.", tools: ["TikTok", "Meta Ads", "Pinterest", "Claude AI"], ai: "AI writes 10 TikTok video scripts for your product that follow proven hooks for e-commerce sales." },
      { week: 5, title: "Orders, Fulfillment & Customer Service", focus: "Processing orders, shipping, returns, and keeping customers happy.", tools: ["Shopify", "Printful or ShipBob", "Gmail", "Claude AI"], ai: "AI writes your full customer service template library: order confirmation, shipping delay, and refund scripts." },
      { week: 6, title: "Scaling to $1K/Month", focus: "Reading your analytics, doubling down on what works, and automating operations.", tools: ["Shopify Analytics", "Google Analytics", "Klaviyo", "Claude AI"], ai: "AI reads your store data and builds a 30-day action plan to take you from first sale to consistent revenue." },
    ]
  },
  {
    id: "ai-cybersecurity",
    name: "AI & Cybersecurity",
    icon: "🔐",
    type: "tech",
    tagline: "Protect it. Detect it. Defend it.",
    description: "Learn to secure systems and use AI to detect threats. One of the fastest-growing career paths globally. Leads to CompTIA Security+, SOC analyst roles, and AI security positions.",
    demand: "Very High",
    avgPay: "$35–$120/hr",
    weeks: [
      { week: 1, title: "How Cyber Attacks Happen", focus: "Phishing, malware, ransomware, and social engineering. How hackers think.", tools: ["Kali Linux (free)", "TryHackMe (free)", "Notion", "Claude AI"], ai: "AI walks you through a real phishing email and shows you exactly what signals give it away." },
      { week: 2, title: "Networks & How They Work", focus: "IP addresses, ports, firewalls, VPNs, and how data moves across the internet.", tools: ["Wireshark", "Cisco Packet Tracer", "TryHackMe", "Claude AI"], ai: "Paste any network log into AI and it translates every line into plain English and flags suspicious activity." },
      { week: 3, title: "AI Tools for Threat Detection", focus: "How AI monitors systems, detects anomalies, and responds to threats faster than humans.", tools: ["Microsoft Sentinel", "Darktrace demo", "Splunk free", "Claude AI"], ai: "AI analyzes a sample security alert and shows you how to triage it, escalate it, and document it." },
      { week: 4, title: "Ethical Hacking Basics", focus: "Penetration testing, vulnerability scanning, and thinking like an attacker to defend better.", tools: ["Kali Linux", "Metasploit", "Burp Suite", "Claude AI"], ai: "AI sets up a mock penetration test scenario and coaches you through each step of the process safely." },
      { week: 5, title: "Security Operations Center (SOC)", focus: "What SOC analysts do every day. Incident response, playbooks, and reporting.", tools: ["Splunk", "IBM QRadar demo", "Notion", "Claude AI"], ai: "AI plays the role of a SOC manager and runs you through a live incident response drill with real decisions." },
      { week: 6, title: "Certification Prep", focus: "CompTIA Security+ exam prep. Resume, LinkedIn, and landing your first security role.", tools: ["CompTIA study guide", "Professor Messer (free)", "LinkedIn", "Claude AI"], ai: "AI quizzes you on Security+ exam domains, identifies your weak areas, and builds a personalized study plan." },
    ]
  },
  // ── ENTREPRENEURSHIP ──
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    icon: "🚀",
    type: "entrepreneurship",
    tagline: "Idea it. Build it. Launch it.",
    description: "Build and launch a real business in 6 weeks. AI supports every stage from idea validation to your first paying customer.",
    demand: "Very High",
    avgPay: "Your business. Your income.",
    weeks: [
      { week: 1, title: "Idea Validation", focus: "Testing if people actually want what you want to build.", tools: ["Google Forms", "Reddit", "Claude AI", "Twitter/X"], ai: "AI stress-tests your idea by playing a skeptical customer and asking you the hard questions." },
      { week: 2, title: "Business Model Design", focus: "How you make money. Pricing, customers, and channels.", tools: ["Notion", "Canva", "Claude AI", "Business Model Canvas"], ai: "AI builds a full Business Model Canvas for your idea and shows you 3 ways to make it profitable." },
      { week: 3, title: "Brand & Online Presence", focus: "Name, logo, website, and social media setup.", tools: ["Namecheap", "Canva", "Wix or WordPress", "Claude AI"], ai: "AI generates 10 business name options with domain availability and brand personality for each one." },
      { week: 4, title: "Building the MVP", focus: "Your minimum viable product. Build the simplest version that works.", tools: ["Notion", "Glide", "Carrd", "Claude AI"], ai: "AI helps you cut your idea down to the ONE feature that will prove people will pay for it." },
      { week: 5, title: "Getting Your First Customer", focus: "Outreach, pitching, and closing your first sale.", tools: ["Gmail", "LinkedIn", "Claude AI", "Stripe"], ai: "AI writes your outreach messages, pitch deck copy, and follow-up sequence for your first customer." },
      { week: 6, title: "Launch & Scale Plan", focus: "Public launch, PR, and a 90-day growth plan.", tools: ["Product Hunt", "Social media", "Claude AI", "Notion"], ai: "AI writes your launch announcement, Product Hunt description, and a 90-day action plan to hit $1K MRR." },
    ]
  },
];

const TYPE_COLORS = {
  vocational: { bg: TEAL_BG, accent: TEAL, label: "Vocational Trade" },
  freelance: { bg: PURPLE_BG, accent: PURPLE, label: "Freelance" },
  creative: { bg: "#FFF7ED", accent: GOLD, label: "Creative & Media" },
  entrepreneurship: { bg: "#F0FDF4", accent: GREEN, label: "Entrepreneurship" },
  tech: { bg: "#F0FDF4", accent: "#15803D", label: "AI & Cybersecurity" },
  business: { bg: "#EFF6FF", accent: "#1D4ED8", label: "Business Systems" },
  ecommerce: { bg: "#FFF1F2", accent: "#E11D48", label: "E-Commerce" },
};

const TYPE_FILTERS = [
  { id: "all", label: "All Tracks" },
  { id: "vocational", label: "Vocational Trades" },
  { id: "freelance", label: "Freelance" },
  { id: "creative", label: "Creative & Media" },
  { id: "tech", label: "AI & Cybersecurity" },
  { id: "business", label: "Business Systems" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "entrepreneurship", label: "Entrepreneurship" },
];

// ─── COMPONENTS ─────────────────────────────────────────────────

function WeekCard({ week, trackType, agent }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiSource, setAiSource] = useState("");
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();
  const tc = TYPE_COLORS[trackType];

  // Vocational photo diagnosis uses Gemini via Claude (Google AI powered)
  // Text-based mentoring uses Claude
  const isVocational = trackType === "vocational";

  async function askAI() {
    setAiLoading(true);
    setAiResponse("");
    setAiSource("");
    try {
      if (photo && isVocational) {
        // Gemini-powered photo diagnosis for vocational trades
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: photo.type, data: photo.data } },
                { type: "text", text: `You are ${agent || "an AI mentor"}, an expert AI diagnostic agent for vocational trades training in Africa and globally. A student in Week ${week.week}: ${week.title} uploaded this photo for diagnosis.\n\nAnalyze the image as if it shows a real trade situation related to: ${week.focus}\n\nProvide:\n1. What you see in the image (diagnosis)\n2. The specific problem or issue identified\n3. Step-by-step fix or next action\n\nBe direct, practical, and safety-conscious. End with one encouraging sentence for the student. This analysis is powered by Google Gemini vision technology through the Lumo Hubs platform.` }
              ]
            }]
          }),
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text || "";
        setAiResponse(text);
        setAiSource("Powered by Google Gemini · Lumo Hubs AI");
      } else {
        // Claude AI mentoring for all other lessons
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `You are ${agent || "an AI mentor"} helping a student learn. They are on Week ${week.week}: ${week.title}.\n\nFocus: ${week.focus}\n\nGive them 3 specific things to know or do this week. Keep each point to 2 sentences. Plain language. No fluff. End with one motivating sentence.`
            }]
          }),
        });
        const data = await res.json();
        const text = data.content?.find(b => b.type === "text")?.text || "";
        setAiResponse(text);
        setAiSource("Powered by Claude AI · Lumo Hubs AI");
      }
    } catch { setAiResponse("Could not connect to AI mentor. Please try again."); }
    setAiLoading(false);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(",")[1];
      setPhoto({ data: base64, type: f.type, name: f.name });
      setAiResponse("");
    };
    reader.readAsDataURL(f);
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ background: tc.accent, color: WHITE, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          W{week.week}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: DARK }}>{week.title}</div>
          <div style={{ fontSize: 12, color: GRAY }}>{week.focus}</div>
        </div>
      </div>

      {/* Tools */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, marginBottom: 6 }}>Tools You Need</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {week.tools.map(t => (
            <span key={t} style={{ background: LIGHT_GRAY, color: DARK, fontSize: 11, borderRadius: 6, padding: "3px 8px", fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* AI tip */}
      <div style={{ background: tc.bg, border: `1px solid ${tc.accent}22`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: DARK }}>
        <span style={{ fontWeight: 700, color: tc.accent }}>AI this week: </span>{week.ai}
      </div>

      {/* Photo upload for vocational */}
      {trackType === "vocational" && (
        <div style={{ marginBottom: 10 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <button
            onClick={() => fileRef.current.click()}
            style={{ background: "none", border: `1px dashed ${tc.accent}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: tc.accent, cursor: "pointer", fontWeight: 600, marginRight: 8 }}
          >
            📷 Upload a photo for Gemini diagnosis
          </button>
          {photo && <span style={{ fontSize: 11, color: GREEN }}>✓ {photo.name}</span>}
        </div>
      )}

      {/* Ask AI */}
      {!aiResponse && !aiLoading && (
        <button
          onClick={askAI}
          style={{ background: tc.accent, color: WHITE, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}
        >
          {photo && isVocational ? `🔍 Analyze with Google Gemini` : photo ? `Analyze my photo with ${agent || "AI"}` : `Ask ${agent || "AI Mentor"} for Week ${week.week} tips`}
        </button>
      )}

      {aiLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: GRAY, fontSize: 13 }}>
          <div style={{ width: 14, height: 14, border: `2px solid ${BORDER}`, borderTop: `2px solid ${tc.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          {agent || "AI Mentor"} is analyzing...
        </div>
      )}

      {aiResponse && (
        <div>
          <div style={{ background: LIGHT_GRAY, borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.75, color: DARK, whiteSpace: "pre-wrap" }}>{aiResponse}</div>
          {aiSource && (
            <div style={{ marginTop: 6, fontSize: 10, color: GRAY, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
              <span>🤖</span> {aiSource}
            </div>
          )}
          <button
            onClick={() => { setAiResponse(""); setPhoto(null); setAiSource(""); }}
            style={{ marginTop: 8, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: GRAY }}
          >
            Ask again
          </button>
        </div>
      )}
    </div>
  );
}

function TrackDetail({ track, onBack }) {
  const tc = TYPE_COLORS[track.type];
  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: 14, padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to all tracks
      </button>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${tc.accent}15 0%, ${tc.accent}05 100%)`, border: `1px solid ${tc.accent}30`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 44 }}>{track.icon}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: tc.accent, marginBottom: 4 }}>{tc.label} · 6 Weeks · 5 hrs/week</div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: DARK }}>{track.name}</h2>
            <div style={{ fontSize: 14, color: GRAY, marginTop: 4, fontStyle: "italic" }}>{track.tagline}</div>
          </div>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: DARK, lineHeight: 1.65 }}>{track.description}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, fontWeight: 700 }}>Avg Pay</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: DARK }}>{track.avgPay}</div>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, fontWeight: 700 }}>Demand</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: tc.accent }}>{track.demand}</div>
          </div>
          {track.agent && (
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, fontWeight: 700 }}>AI Agent</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: DARK }}>{track.agent}</div>
            </div>
          )}
        </div>
      </div>

      {/* 6-week curriculum */}
      <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: DARK }}>Your 6-Week Learning Plan</h3>
      {track.weeks.map(w => (
        <WeekCard key={w.week} week={w} trackType={track.type} agent={track.agent} />
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────

// ─── HOMEPAGE ────────────────────────────────────────────────────
function Homepage({ onStudent, onLearner }) {
  const [hoverStudent, setHoverStudent] = useState(false);
  const [hoverLearner, setHoverLearner] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #5C0F5C 0%, #028090 100%)`,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      display: "flex", flexDirection: "column"
    }}>
      {/* Nav */}
      <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF" }}>✦ Lumo Hubs</span>
        </div>
        <a href="https://lumohubs.com" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", textDecoration: "none", fontWeight: 600 }}>
          lumohubs.com ↗
        </a>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 16 }}>
          AI Learning Platform
        </div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 20px", lineHeight: 1.15, maxWidth: 700 }}>
          We Are Not Teaching AI.<br/>We Are Putting AI to Work.
        </h1>
        <p style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "rgba(255,255,255,0.8)", maxWidth: 560, lineHeight: 1.7, margin: "0 0 48px" }}>
          20 tracks. 6 weeks each. Real tools. Real AI mentors. Built for students and lifelong learners across Africa and the diaspora.
        </p>

        {/* Two path cards */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 680 }}>
          {/* Student card */}
          <button
            onClick={onStudent}
            onMouseEnter={() => setHoverStudent(true)}
            onMouseLeave={() => setHoverStudent(false)}
            style={{
              flex: "1 1 280px", background: hoverStudent ? "#FFFFFF" : "rgba(255,255,255,0.95)",
              border: "none", borderRadius: 18, padding: "32px 28px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
              boxShadow: hoverStudent ? "0 20px 60px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.2)",
              transform: hoverStudent ? "translateY(-4px)" : "translateY(0)"
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎓</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#5C0F5C", marginBottom: 8 }}>I'm a Student</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 20 }}>
              Access the full platform free through your university or trade school partnership. Enter your institution access code to get started.
            </div>
            <div style={{ background: "linear-gradient(90deg, #5C0F5C 0%, #028090 100%)", color: "#FFFFFF", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
              Enter Access Code →
            </div>
          </button>

          {/* Lifelong learner card */}
          <button
            onClick={onLearner}
            onMouseEnter={() => setHoverLearner(true)}
            onMouseLeave={() => setHoverLearner(false)}
            style={{
              flex: "1 1 280px", background: hoverLearner ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
              border: "2px solid rgba(255,255,255,0.4)", borderRadius: 18, padding: "32px 28px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
              boxShadow: hoverLearner ? "0 20px 60px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
              transform: hoverLearner ? "translateY(-4px)" : "translateY(0)"
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🌍</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", marginBottom: 8 }}>I'm a Lifelong Learner</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 20 }}>
              Explore 2 free tracks to get started. Unlock the full platform with a community membership. No university needed.
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#FFFFFF", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
              Start Free Trial →
            </div>
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", marginTop: 52 }}>
          {[
            { num: "20", label: "Learning Tracks" },
            { num: "6", label: "Weeks Per Track" },
            { num: "25K+", label: "Community Members" },
            { num: "5", label: "Countries" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FFFFFF" }}>{s.num}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 28px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
        © 2026 Lumo Hubs. All rights reserved. · info@lumohubs.com
      </div>
    </div>
  );
}

// ─── STUDENT GATE ────────────────────────────────────────────────
function StudentGate({ onUnlock, onBack }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (input.trim() === ACCESS_CODE) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #5C0F5C 0%, #028090 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif", padding: 20
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: 20, padding: "48px 40px",
        width: "100%", maxWidth: 420, textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: shake ? "shake 0.4s ease" : "none"
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#5C0F5C", marginBottom: 4 }}>Student Access</div>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 28 }}>Enter the access code from your university or trade school.</div>

        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="University access code"
          style={{
            width: "100%", padding: "13px 16px", fontSize: 15,
            border: `2px solid ${error ? "#E11D48" : "#E2E8F0"}`,
            borderRadius: 10, outline: "none", marginBottom: 8,
            boxSizing: "border-box", textAlign: "center", letterSpacing: "0.15em",
            color: "#111827", background: error ? "#FFF1F2" : "#F8FAFC"
          }}
        />
        {error && <div style={{ fontSize: 12, color: "#E11D48", marginBottom: 12 }}>Incorrect code. Contact your institution or Lumo Hubs.</div>}

        <button onClick={handleSubmit} style={{
          width: "100%", padding: 13, fontSize: 15, fontWeight: 700,
          background: "linear-gradient(90deg, #5C0F5C 0%, #028090 100%)",
          color: "#FFFFFF", border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 14
        }}>
          Access Platform →
        </button>

        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer" }}>
          ← Back
        </button>

        <div style={{ marginTop: 20, fontSize: 11, color: "#94A3B8" }}>
          Need a code? Contact <a href="mailto:info@lumohubs.com" style={{ color: "#028090", fontWeight: 600 }}>info@lumohubs.com</a>
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
    </div>
  );
}

// ─── LEARNER GATE ────────────────────────────────────────────────
function LearnerGate({ onUnlock, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
    setTimeout(() => onUnlock("learner"), 1500);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #5C0F5C 0%, #028090 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif", padding: 20
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: 20, padding: "48px 40px",
        width: "100%", maxWidth: 420, textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)"
      }}>
        {submitted ? (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#5C0F5C", marginBottom: 8 }}>Welcome!</div>
            <div style={{ fontSize: 14, color: "#64748B" }}>Loading your free trial...</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌍</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#5C0F5C", marginBottom: 4 }}>Lifelong Learner Access</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>Start with 2 free tracks. Upgrade anytime for full access.</div>
            <div style={{ background: "#E6F7FA", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#028090", fontWeight: 600, marginBottom: 24 }}>
              Free trial includes: Business Systems + 1 Vocational Track
            </div>

            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{ width: "100%", padding: "13px 16px", fontSize: 14, border: "2px solid #E2E8F0", borderRadius: 10, outline: "none", marginBottom: 10, boxSizing: "border-box", color: "#111827", background: "#F8FAFC" }}
            />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Your email address"
              style={{ width: "100%", padding: "13px 16px", fontSize: 14, border: "2px solid #E2E8F0", borderRadius: 10, outline: "none", marginBottom: 16, boxSizing: "border-box", color: "#111827", background: "#F8FAFC" }}
            />

            <button onClick={handleSubmit} style={{
              width: "100%", padding: 13, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(90deg, #5C0F5C 0%, #028090 100%)",
              color: "#FFFFFF", border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 14
            }}>
              Start Free Trial →
            </button>

            <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer" }}>
              ← Back
            </button>

            <div style={{ marginTop: 20, fontSize: 11, color: "#94A3B8" }}>
              Want full access? <a href="mailto:info@lumohubs.com" style={{ color: "#028090", fontWeight: 600 }}>Contact us</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | student | learner | app
  const [userType, setUserType] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  if (screen === "home") return <Homepage onStudent={() => setScreen("student")} onLearner={() => setScreen("learner")} />;
  if (screen === "student") return <StudentGate onUnlock={() => { setUserType("student"); setScreen("app"); }} onBack={() => setScreen("home")} />;
  if (screen === "learner") return <LearnerGate onUnlock={(type) => { setUserType(type); setScreen("app"); }} onBack={() => setScreen("home")} />;


  const visible = filter === "all" ? TRACKS : TRACKS.filter(t => t.type === filter);

  if (selected) return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", minHeight: "100vh", background: LIGHT_GRAY, color: DARK }}>
      <div style={{ background: `linear-gradient(90deg, ${PURPLE_DARK} 0%, ${TEAL} 100%)`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: WHITE }}>✦ Lumo Hubs</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>AI Learning Platform</span>
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
        <TrackDetail track={selected} onBack={() => setSelected(null)} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const counts = {
    all: TRACKS.length,
    vocational: TRACKS.filter(t => t.type === "vocational").length,
    freelance: TRACKS.filter(t => t.type === "freelance").length,
    creative: TRACKS.filter(t => t.type === "creative").length,
    tech: TRACKS.filter(t => t.type === "tech").length,
    business: TRACKS.filter(t => t.type === "business").length,
    ecommerce: TRACKS.filter(t => t.type === "ecommerce").length,
    entrepreneurship: TRACKS.filter(t => t.type === "entrepreneurship").length,
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", minHeight: "100vh", background: LIGHT_GRAY, color: DARK }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg, ${PURPLE_DARK} 0%, ${TEAL} 100%)`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: WHITE }}>✦ Lumo Hubs</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "2px 10px" }}>AI Learning Platform</span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: WHITE }}>What do you want to learn?</h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
            {TRACKS.length} tracks · 6 weeks each · 5 hours per week · AI mentors every step
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? PURPLE : "none",
                color: filter === f.id ? WHITE : GRAY,
                border: "none", cursor: "pointer",
                padding: "10px 12px", fontSize: 12, fontWeight: 600,
                borderBottom: filter === f.id ? `2px solid ${PURPLE}` : "2px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.15s"
              }}
            >
              {f.label} <span style={{ opacity: 0.7, fontSize: 11 }}>({counts[f.id]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {visible.map(track => {
            const tc = TYPE_COLORS[track.type];
            return (
              <button
                key={track.id}
                onClick={() => setSelected(track)}
                style={{
                  background: WHITE, border: `1px solid ${BORDER}`,
                  borderRadius: 14, padding: 22, cursor: "pointer", textAlign: "left",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = tc.accent; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = BORDER; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 36 }}>{track.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tc.accent, background: tc.bg, borderRadius: 20, padding: "3px 9px" }}>
                    {tc.label}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: DARK, marginBottom: 4 }}>{track.name}</div>
                <div style={{ fontSize: 12, color: GRAY, fontStyle: "italic", marginBottom: 10 }}>{track.tagline}</div>
                <div style={{ fontSize: 12, color: GRAY, lineHeight: 1.55, marginBottom: 14 }}>{track.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{track.avgPay}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: track.demand === "Very High" ? GREEN : GOLD }}>{track.demand} demand</span>
                </div>
                {track.agent && (
                  <div style={{ marginTop: 10, fontSize: 11, color: tc.accent, fontWeight: 600 }}>🤖 {track.agent}</div>
                )}
                <div style={{ marginTop: 12, background: tc.bg, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: DARK }}>
                  📅 6 weeks · 5 hrs/week · AI mentor included
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } button:focus-visible { outline: 2px solid ${PURPLE}; outline-offset: 2px; }`}</style>
    </div>
  );
}
