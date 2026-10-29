// All names below are sample data for demos. They are not real people or partners.

export const EMPLOYERS = [
  { id: "e1", name: "Pearl Bay Bank", sector: "Banking", city: "Doha", plan: "Talent subscription", staffEnrolled: 24, color: "#028090" },
  { id: "e2", name: "Dunes Energy", sector: "Energy", city: "Ras Laffan", plan: "Corporate cohort", staffEnrolled: 18, color: "#8B1A8B" },
  { id: "e3", name: "Corniche Health", sector: "Healthcare", city: "Doha", plan: "Talent subscription", staffEnrolled: 9, color: "#B45309" },
  { id: "e4", name: "Souq Digital", sector: "E-Commerce", city: "Lusail", plan: "Free pilot", staffEnrolled: 4, color: "#15803D" },
  { id: "e5", name: "Al Sadd Facilities", sector: "Trades", city: "Doha", plan: "Corporate cohort", staffEnrolled: 12, color: "#1D4ED8" },
];

export const LEARNERS = [
  { id: "l1", name: "Maryam A.", path: "student", track: "banking", level: "Foundation", progress: 83, attendance: 96, status: "On track", sponsor: "Pearl Bay Bank", headline: "Finance student using AI for credit analysis", city: "Doha", open: ["Internship", "Full time"], skills: ["Credit memos with AI", "Power BI", "Excel"], projects: ["Credit memo automation for a sample SME loan", "Loan risk dashboard"] },
  { id: "l2", name: "Yousef K.", path: "student", track: "data-analytics", level: "Advanced", progress: 100, attendance: 92, status: "Completed", sponsor: null, headline: "Data analyst building dashboards for operations teams", city: "Doha", open: ["Full time"], skills: ["Power BI", "Python", "Forecasting"], projects: ["Sales trend dashboard", "Staffing forecast for a clinic"] },
  { id: "l3", name: "Grace O.", path: "community", track: "plumbing", level: "Foundation", progress: 67, attendance: 88, status: "On track", sponsor: "Al Sadd Facilities", headline: "Plumbing apprentice, PlumberFix AI certified in leak repair", city: "Doha", open: ["Full time", "Freelance"], skills: ["Leak repair", "Fixture installs", "PlumberFix AI"], projects: ["Full bathroom fixture install", "Leak diagnosis log"] },
  { id: "l4", name: "Hamad S.", path: "professional", track: "energy", level: "Advanced", progress: 50, attendance: 100, status: "On track", sponsor: "Dunes Energy", headline: "Maintenance engineer using AI to predict pump failures", city: "Ras Laffan", open: [], skills: ["AVEVA PI", "Predictive maintenance", "Maximo"], projects: ["Pump failure early warning model"] },
  { id: "l5", name: "Amina B.", path: "community", track: "media-youtube", level: "Foundation", progress: 33, attendance: 71, status: "Needs help", sponsor: null, headline: "Video creator returning to work after a career break", city: "Al Wakrah", open: ["Freelance", "Part time"], skills: ["CapCut", "YouTube Studio"], projects: ["60 second hub explainer video"] },
  { id: "l6", name: "Rashid M.", path: "student", track: "government", level: "Foundation", progress: 17, attendance: 64, status: "Needs help", sponsor: null, headline: "Public policy student building citizen help bots", city: "Doha", open: ["Internship"], skills: ["Copilot Studio"], projects: [] },
  { id: "l7", name: "Priya N.", path: "community", track: "ai-hr", level: "Foundation", progress: 100, attendance: 94, status: "Completed", sponsor: null, headline: "HR coordinator focused on fair hiring and Qatarization tracking", city: "Doha", open: ["Full time"], skills: ["Workday", "Fair screening", "Power BI"], projects: ["Qatarization progress dashboard", "Bias check on a resume screen"] },
  { id: "l8", name: "Khalid R.", path: "student", track: "electrical", level: "Foundation", progress: 50, attendance: 90, status: "On track", sponsor: null, headline: "Electrical trainee, solar ready", city: "Doha", open: ["Internship", "Full time"], skills: ["Wiring diagnosis", "Jobber"], projects: ["Panel fault diagnosis"] },
];

export const JOBS = [
  { id: "j1", employer: "e1", title: "Junior Credit Analyst", type: "Full time", track: "banking", city: "Doha", pay: "QAR 12,000 to 15,000 / month", skills: ["Credit memos with AI", "Excel", "Power BI"], qatari: true },
  { id: "j2", employer: "e1", title: "Data Intern, Retail Banking", type: "Internship", track: "data-analytics", city: "Doha", pay: "QAR 4,000 / month", skills: ["Power BI", "Excel"], qatari: true },
  { id: "j3", employer: "e2", title: "Reliability Analyst", type: "Full time", track: "energy", city: "Ras Laffan", pay: "QAR 18,000 to 22,000 / month", skills: ["AVEVA PI", "Predictive maintenance"], qatari: false },
  { id: "j4", employer: "e3", title: "Clinic Operations Analyst", type: "Full time", track: "data-analytics", city: "Doha", pay: "QAR 11,000 / month", skills: ["Power BI", "Forecasting"], qatari: false },
  { id: "j5", employer: "e4", title: "Social Media Video Creator", type: "Freelance", track: "media-youtube", city: "Remote", pay: "QAR 600 per video", skills: ["CapCut", "YouTube Studio"], qatari: false },
  { id: "j6", employer: "e5", title: "Plumbing Technician", type: "Full time", track: "plumbing", city: "Doha", pay: "QAR 6,500 / month", skills: ["Leak repair", "Fixture installs"], qatari: false },
  { id: "j7", employer: "e5", title: "Electrical Apprentice", type: "Internship", track: "electrical", city: "Doha", pay: "QAR 3,000 / month", skills: ["Wiring diagnosis"], qatari: false },
];

export const PROJECTS = [
  { id: "p1", employer: "e1", title: "Automate the weekly branch report", track: "banking", weeks: 3, paid: "QAR 2,000", seats: 3 },
  { id: "p2", employer: "e2", title: "Build a pump health dashboard", track: "energy", weeks: 4, paid: "QAR 3,500", seats: 2 },
  { id: "p3", employer: "e4", title: "Product photos and short videos for 20 items", track: "media-youtube", weeks: 2, paid: "QAR 1,500", seats: 2 },
  { id: "p4", employer: "e3", title: "Patient wait time analysis", track: "data-analytics", weeks: 3, paid: "Unpaid internship credit", seats: 2 },
];

export const HUB_SPACES = [
  { id: "h1", name: "Podcast booth", icon: "🎙️", rate: 100, student: 40 },
  { id: "h2", name: "YouTube room", icon: "🎬", rate: 100, student: 40 },
  { id: "h3", name: "Photo set", icon: "📸", rate: 80, student: 30 },
  { id: "h4", name: "Plumbing lab", icon: "🔧", rate: 60, student: 20 },
  { id: "h5", name: "Electrical lab", icon: "💡", rate: 60, student: 20 },
  { id: "h6", name: "Woodshop", icon: "🪚", rate: 60, student: 20, soon: true },
];

export const HUB_HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export const PLUMBERS = [
  { id: "pl1", name: "Grace O.", level: "Apprentice", rating: 4.8, jobs: 14, area: "Doha", trained: true },
  { id: "pl2", name: "Samuel T.", level: "Certified", rating: 4.9, jobs: 62, area: "Al Rayyan", trained: true },
  { id: "pl3", name: "Ibrahim F.", level: "Certified", rating: 4.7, jobs: 41, area: "Lusail", trained: true },
];

export const OUTCOMES = {
  enrolled: 312, completed: 128, placed: 41, internships: 27, businesses: 9,
  avgIncomeGain: 38, sixMonthRetention: 87,
  byMonth: [
    { m: "May", enrolled: 22, placed: 1 }, { m: "Jun", enrolled: 35, placed: 3 }, { m: "Jul", enrolled: 41, placed: 4 },
    { m: "Aug", enrolled: 48, placed: 6 }, { m: "Sep", enrolled: 77, placed: 12 }, { m: "Oct", enrolled: 89, placed: 15 },
  ],
  bySector: [
    { s: "Banking", placed: 11 }, { s: "Energy", placed: 6 }, { s: "Trades", placed: 10 },
    { s: "Data", placed: 8 }, { s: "Media", placed: 4 }, { s: "Other", placed: 2 },
  ],
};

export const QUIZ = [
  { q: "What best describes you today?", a: ["Student", "Working professional", "Between jobs or returning to work", "Running or starting a business"] },
  { q: "What do you enjoy most?", a: ["Working with my hands", "Numbers and data", "Creating content", "Helping people and teams"] },
  { q: "Which field interests you?", a: ["Banking and finance", "Energy and utilities", "Government and public service", "Healthcare", "Media and design", "Trades and building", "Technology", "My own business"] },
  { q: "What is your goal in the next year?", a: ["Get my first job or internship", "Get promoted or switch roles", "Earn extra income on the side", "Launch my business"] },
];
