import { LEGACY_TRACKS } from "./legacyTracks";

export const SECTORS = [
  { id: "trades", name: "Trades", nameAr: "المهن الفنية" },
  { id: "creative", name: "Creative and Media", nameAr: "الإبداع والإعلام" },
  { id: "business", name: "Business and Operations", nameAr: "الأعمال والعمليات" },
  { id: "technology", name: "Technology", nameAr: "التكنولوجيا" },
  { id: "sector", name: "Sector tracks", nameAr: "مسارات القطاعات" },
];

// New professional tracks built for Qatar's educated workforce.
const PRO_TRACKS = [
  {
    id: "banking", name: "AI for Banking and Finance", icon: "Banknote", agent: "LedgerAI",
    tagline: "Faster reports. Smarter risk calls.",
    description: "For bankers, analysts, and compliance staff. Use AI to write credit memos, spot fraud, and serve customers faster, on the tools banks already run.",
    demand: "Very High", avgPay: "$35 to $120/hr",
    weeks: [
      { week: 1, title: "AI Basics for Finance Work", focus: "What AI can and can't do in a bank. Safe prompts for real tasks.", tools: ["Microsoft Copilot", "Excel", "Claude"], ai: "AI reviews your first prompts and shows how to get sharper, safer answers." },
      { week: 2, title: "Reports and Credit Memos", focus: "Turn a loan file into a clear one page credit memo.", tools: ["Copilot", "Word", "Sample loan files"], ai: "AI drafts the memo from a sample file. You check every number." },
      { week: 3, title: "Fraud and Risk Signals", focus: "Spot unusual transactions and risky patterns in data.", tools: ["Power BI", "Excel", "Sample transactions"], ai: "AI flags odd transactions and explains why each one stands out." },
      { week: 4, title: "Customer Service and Onboarding", focus: "Faster account opening and better answers for customers.", tools: ["Salesforce Financial Services", "Copilot Studio"], ai: "Build a helper that answers common account questions in Arabic and English." },
      { week: 5, title: "Rules, Privacy, and Safe AI", focus: "Bank rules, customer privacy, and when a human must decide.", tools: ["Policy checklist", "Claude"], ai: "AI quizzes you on real cases where AI should and should not be used." },
      { week: 6, title: "Final Project", focus: "Automate one real task from your job or an employer project.", tools: ["Your bank's tools", "Portfolio page"], ai: "AI scores your project on time saved and accuracy." },
    ],
  },
  {
    id: "government", name: "AI for Government", icon: "Landmark", agent: "CivicAI",
    tagline: "Better services. Faster answers.",
    description: "For ministry and public sector staff. Use AI to write briefs, plan with data, and help citizens faster.",
    demand: "High", avgPay: "$30 to $100/hr",
    weeks: [
      { week: 1, title: "AI Basics for Public Service", focus: "Where AI helps public servants and where it doesn't.", tools: ["Microsoft 365 Copilot", "Claude"], ai: "AI walks you through five common public sector tasks." },
      { week: 2, title: "Policy Briefs and Memos", focus: "Write clear briefs in half the time.", tools: ["Copilot", "Word"], ai: "AI turns long reports into a one page brief you can edit." },
      { week: 3, title: "Planning with Data", focus: "Use service data to plan staff, budgets, and timelines.", tools: ["Power BI", "Excel"], ai: "AI finds trends in sample service data and suggests what to fix first." },
      { week: 4, title: "Citizen Help Chatbots", focus: "Build a bot that answers common citizen questions.", tools: ["Copilot Studio", "ServiceNow"], ai: "Build a permit helper bot in Arabic and English." },
      { week: 5, title: "Ethics, Privacy, and Arabic AI", focus: "Fair use, data privacy, and AI in Arabic.", tools: ["Policy checklist", "Claude"], ai: "AI tests your bot for unfair or unsafe answers." },
      { week: 6, title: "Final Project", focus: "Improve one real service at your agency.", tools: ["Your agency's tools", "Portfolio page"], ai: "AI scores your plan on impact and ease of rollout." },
    ],
  },
  {
    id: "energy", name: "AI for Energy", icon: "Zap", agent: "GridAI",
    tagline: "Fix it before it breaks.",
    description: "For oil, gas, and utility staff. Use AI to predict equipment problems, speed up safety checks, and read plant data.",
    demand: "Very High", avgPay: "$40 to $130/hr",
    weeks: [
      { week: 1, title: "How AI Is Used in Energy", focus: "Real uses in plants, pipelines, and power grids.", tools: ["Claude", "Case studies"], ai: "AI explains five real energy AI projects in plain words." },
      { week: 2, title: "Predicting Equipment Problems", focus: "Use sensor data to spot a pump or valve likely to fail.", tools: ["AVEVA PI", "Excel", "Sample sensor data"], ai: "AI flags the pump most likely to fail and explains the warning signs." },
      { week: 3, title: "Safety Reports and Checks", focus: "Faster, clearer safety reports and checklists.", tools: ["IBM Maximo", "Copilot"], ai: "AI turns field notes into a clean safety report." },
      { week: 4, title: "Energy Use and Emissions", focus: "Track energy use and emissions with simple dashboards.", tools: ["Power BI", "SAP"], ai: "AI finds where the most energy is wasted in sample data." },
      { week: 5, title: "Reading Plant Data", focus: "Make sense of large sensor and plant data sets.", tools: ["AVEVA PI", "Power BI"], ai: "AI answers your questions about the data in plain language." },
      { week: 6, title: "Final Project", focus: "A fix for one real site problem.", tools: ["Your site's tools", "Portfolio page"], ai: "AI scores your fix on safety, cost, and time saved." },
    ],
  },
  {
    id: "ai-hr", name: "AI for HR", icon: "Users", agent: "PeopleAI",
    tagline: "Hire fairly. Train faster.",
    description: "For HR and talent teams. Use AI to write job posts, screen fairly, build training plans, and track Qatarization goals.",
    demand: "High", avgPay: "$25 to $90/hr",
    weeks: [
      { week: 1, title: "AI Basics for HR", focus: "Where AI helps HR and where people must decide.", tools: ["Claude", "LinkedIn Recruiter"], ai: "AI shows five HR tasks it can speed up today." },
      { week: 2, title: "Job Posts and Fair Screening", focus: "Clear job posts and fair resume screening.", tools: ["SAP SuccessFactors", "Workday"], ai: "Screen 10 sample resumes with AI, then check the results by hand." },
      { week: 3, title: "Training Plans", focus: "Build training plans that match real job skills.", tools: ["Workday Learning", "Claude"], ai: "AI builds a 90 day plan for a new hire." },
      { week: 4, title: "Qatarization Tracking", focus: "Track national hiring goals with simple data.", tools: ["Excel", "Power BI"], ai: "AI builds a dashboard of hiring progress against goals." },
      { week: 5, title: "Avoiding Bias", focus: "How AI hiring tools can be unfair and how to catch it.", tools: ["Bias checklist", "Claude"], ai: "AI shows where a sample screening went wrong." },
      { week: 6, title: "Final Project", focus: "A better hiring or training process for a real team.", tools: ["Your HR tools", "Portfolio page"], ai: "AI scores your process on fairness and speed." },
    ],
  },
  {
    id: "data-analytics", name: "Data and Analytics", icon: "BarChart3", agent: "InsightAI",
    tagline: "Turn numbers into decisions.",
    description: "For anyone who works with numbers. Clean data, ask AI questions about it, and build dashboards your manager will use.",
    demand: "Very High", avgPay: "$25 to $95/hr",
    weeks: [
      { week: 1, title: "Data Basics", focus: "Clean spreadsheets and good data habits.", tools: ["Excel", "Google Sheets"], ai: "AI finds the errors in a messy sample sheet." },
      { week: 2, title: "Asking AI About Your Data", focus: "Get clear answers from data in plain language.", tools: ["Claude", "Copilot in Excel"], ai: "Ask five questions about sample sales data and check the answers." },
      { week: 3, title: "Charts and Dashboards", focus: "Build charts people actually read.", tools: ["Power BI", "Tableau"], ai: "AI suggests the best chart for each question." },
      { week: 4, title: "Trends and Forecasts", focus: "Spot trends and make simple forecasts.", tools: ["Excel", "Python basics"], ai: "AI builds a simple forecast and explains how sure it is." },
      { week: 5, title: "Telling a Story with Data", focus: "Present findings so leaders act on them.", tools: ["PowerPoint", "Power BI"], ai: "AI coaches your three minute data talk." },
      { week: 6, title: "Final Project", focus: "A dashboard for a real team.", tools: ["Your team's data", "Portfolio page"], ai: "AI scores your dashboard on clarity and usefulness." },
    ],
  },
  {
    id: "ai-pm", name: "AI Project Management", icon: "KanbanSquare", agent: "PlanAI",
    tagline: "On time. On budget. Less stress.",
    description: "For managers and team leads. Plan, track, and report on projects with AI doing the busywork.",
    demand: "High", avgPay: "$30 to $100/hr",
    weeks: [
      { week: 1, title: "Planning Projects with AI", focus: "Scope, goals, and a first plan in one hour.", tools: ["Claude", "Microsoft Project"], ai: "AI turns a short brief into a project plan." },
      { week: 2, title: "Timelines, Tasks, and Budgets", focus: "Build a timeline and budget you can defend.", tools: ["Jira", "Asana", "Excel"], ai: "AI builds a timeline for a 3 month office move." },
      { week: 3, title: "Meeting Notes and Updates", focus: "Notes, action items, and weekly updates on autopilot.", tools: ["Copilot", "Monday.com"], ai: "AI turns a meeting transcript into tasks and an update email." },
      { week: 4, title: "Spotting Risks Early", focus: "Find risks before they become problems.", tools: ["Risk register", "Claude"], ai: "AI reviews your plan and lists the top five risks." },
      { week: 5, title: "Leading a Team That Uses AI", focus: "Set rules and habits for AI use on your team.", tools: ["Team playbook", "Claude"], ai: "AI helps you write a one page AI playbook for your team." },
      { week: 6, title: "Final Project", focus: "Run a real project with AI tools.", tools: ["Your team's tools", "Portfolio page"], ai: "AI scores your project on time saved and clarity." },
    ],
  },
];

// Sector, status, company software, and one hands on example for every track.
const META = {
  electrical: { sector: "trades", software: ["ServiceTitan", "Jobber", "AutoCAD Electrical"], example: "Read a wiring photo, find the fault, and write the job ticket in Jobber." },
  plumbing: { sector: "trades", software: ["PlumberFix AI", "ServiceTitan", "Jobber"], example: "Snap a leak, get the diagnosis in PlumberFix AI, and quote the job." },
  solar: { sector: "trades", software: ["Aurora Solar", "HelioScope", "SolarEdge Monitoring"], example: "Design a rooftop system in Aurora Solar and estimate yearly output." },
  hvac: { sector: "trades", software: ["ServiceTitan", "Jobber"], example: "Diagnose a cooling unit from a photo and book the repair." },
  agriculture: { sector: "trades", software: ["FarmOS", "Excel", "Sensor dashboards"], example: "Read sensor data from an aquaponics tank and fix the water balance." },
  "media-youtube": { sector: "creative", software: ["YouTube Studio", "CapCut", "Adobe Premiere"], example: "Shoot, edit, and publish a 60 second explainer from the hub studio." },
  "freelance-design": { sector: "creative", software: ["Canva", "Figma", "Adobe Illustrator"], example: "Design a logo and social kit for a real hub business." },
  "freelance-marketing": { sector: "creative", software: ["Meta Business Suite", "Google Analytics", "HubSpot"], example: "Plan and run a one week campaign, then report the results." },
  "business-systems": { sector: "business", software: ["Salesforce", "Monday.com", "HubSpot"], example: "Set up a sales pipeline in HubSpot for a sample company." },
  "data-analytics": { sector: "business", software: ["Excel", "Power BI", "Tableau", "Python"], example: "Clean a messy sales sheet, ask AI for trends, and build a dashboard." },
  "ai-hr": { sector: "business", software: ["SAP SuccessFactors", "Workday", "LinkedIn Recruiter"], example: "Write a fair job post, screen 10 sample resumes, and check for bias." },
  "ai-pm": { sector: "business", software: ["Microsoft Project", "Jira", "Asana", "Monday.com"], example: "Plan a 3 month office move. AI builds the timeline and flags risks." },
  ecommerce: { sector: "business", software: ["Shopify", "Stripe", "Google Merchant Center"], example: "Launch a small Shopify store and take a test order." },
  "ai-cybersecurity": { sector: "technology", software: ["Microsoft Defender", "Splunk", "Wireshark"], example: "Investigate a sample phishing alert and write the incident report." },
  "freelance-tech": { sector: "technology", software: ["GitHub", "VS Code", "Vercel"], example: "Build and publish a simple website for a hub business." },
  banking: { sector: "sector", software: ["Microsoft Copilot", "Excel", "Power BI", "Salesforce Financial Services", "nCino"], example: "Turn a loan file into a one page credit memo with Copilot, then chart loan risk in Power BI." },
  government: { sector: "sector", software: ["Microsoft 365 Copilot", "Copilot Studio", "Power BI", "ServiceNow"], example: "Build an Arabic and English chatbot that answers citizen questions about a permit." },
  energy: { sector: "sector", software: ["SAP", "IBM Maximo", "AVEVA PI", "Power BI"], example: "Use sample sensor data to flag a pump likely to fail, then write the work order." },
  healthcare: { sector: "sector", software: ["Epic (training)", "DICOM viewer", "Excel"], example: "Read a sample X ray with MedAI and write a plain language summary.", subTracks: ["Nursing", "Radiology", "Medical Lab", "Pharmacy"] },
  entrepreneurship: { sector: "sector", software: ["Notion", "Stripe", "Canva"], example: "Turn an idea into a one page plan and a first paying customer." },
  woodwork: { sector: "trades", status: "soon", software: ["SketchUp"], example: "Design a shelf in SketchUp and build it in the woodshop." },
  construction: { sector: "trades", status: "soon", software: ["Procore", "AutoCAD"], example: "Read a site plan and track the job in Procore." },
  welding: { sector: "trades", status: "soon", software: ["WeldAI app"], example: "Photo grade your weld coupons against code standards." },
  auto: { sector: "trades", status: "soon", software: ["OBD II scanner apps"], example: "Read a car's fault codes and plan the repair." },
  "media-gaming": { sector: "creative", status: "soon", software: ["Unity"], example: "Build and publish a one level game." },
  "freelance-writing": { sector: "creative", status: "soon", software: ["Google Docs", "Grammarly", "WordPress"], example: "Write and publish a blog post for a real client." },
};

const ALL = [...LEGACY_TRACKS, ...PRO_TRACKS];

export const TRACKS = ALL.filter((t) => META[t.id]).map((t) => ({
  ...t,
  status: "live",
  ...META[t.id],
}));

export const LIVE_TRACKS = TRACKS.filter((t) => t.status === "live");
export const SOON_TRACKS = TRACKS.filter((t) => t.status === "soon");
export const trackById = (id) => TRACKS.find((t) => t.id === id);
