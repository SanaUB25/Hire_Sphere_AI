"use client";

import { EXTRA_COMPANIES, EXTRA_JOBS, EXTRA_APPLICANTS, EXTRA_USERS } from "./sampleData";

export interface Company {
  id: string;
  name: string;
  logoColor: string;
  logoEmoji: string;
  description: string;
  website: string;
  industry: string;
  teamSize: string;
  verified: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  salary: string;
  skills: string[];
  deadline: string;
  experience: string;
  location: string;
  remote: boolean;
  companyId: string;
  postedAt: string;
  views: number;
  engagement: number;
  isFake: boolean;
}

export interface Applicant {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  avatarColor: string;
  status: "Applied" | "Shortlisted" | "Rejected" | "Hired" | "Interview Scheduled";
  appliedAt: string;
  matchScore: number; // Overall AI Match Score
  resumeQuality: number;
  skillMatch: number;
  experienceScore: number;
  atsScore: number;
  atsFeedback: string[];
  skills: string[];
  experienceYears: number;
  education: string;
  resumeSummary: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
}

export interface Notification {
  id: string;
  type: "apply" | "status" | "new_job" | "system";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Report {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  reason: string;
  reportedAt: string;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  banned: boolean;
  registeredAt: string;
}

// Initial Premium Mock Data
const INITIAL_COMPANIES: Company[] = [
  {
    id: "techcorp",
    name: "TechCorp Inc.",
    logoColor: "from-purple-500 to-indigo-500",
    logoEmoji: "💻",
    description: "Building the next generation of cloud storage and enterprise collaboration platforms using predictive artificial intelligence.",
    website: "https://techcorp.ai",
    industry: "Cloud & Enterprise SaaS",
    teamSize: "250-500 employees",
    verified: true
  },
  {
    id: "innovatelabs",
    name: "InnovateLabs",
    logoColor: "from-cyan-500 to-blue-500",
    logoEmoji: "🧪",
    description: "An AI-first hardware and IoT sandbox designing autonomous drone technology for urban logistics.",
    website: "https://innovate.labs",
    industry: "Robotics & Hardware",
    teamSize: "50-100 employees",
    verified: false
  },
  {
    id: "finsphere",
    name: "FinSphere Global",
    logoColor: "from-emerald-500 to-teal-500",
    logoEmoji: "📈",
    description: "Decentralized treasury operations and liquidity routing engines supporting high-throughput financial assets.",
    website: "https://finsphere.global",
    industry: "FinTech & Web3",
    teamSize: "100-250 employees",
    verified: true
  },
  {
    id: "quantumai",
    name: "QuantumAI Research",
    logoColor: "from-pink-500 to-rose-500",
    logoEmoji: "⚛️",
    description: "Pushing the frontiers of optimization algorithms utilizing low-temperature superconducting quantum architectures.",
    website: "https://quantumai.res",
    industry: "Quantum Computing & ML",
    teamSize: "10-50 employees",
    verified: false
  }
];

const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    description: "Looking for an expert React and TypeScript developer to lead the implementation of our modular dashboard design systems. You will optimize loading states, build gorgeous fluid micro-animations, and coordinate styling rules across components.",
    salary: "$140,000 - $175,000",
    skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Framer Motion"],
    deadline: "2026-06-30",
    experience: "5+ years",
    location: "San Francisco, CA",
    remote: true,
    companyId: "techcorp",
    postedAt: "2026-05-10T09:00:00.000Z",
    views: 412,
    engagement: 78,
    isFake: false
  },
  {
    id: "job-2",
    title: "Full Stack Engineer",
    description: "Help connect IoT telemetry arrays to high-throughput web frontends. You will build sub-millisecond Node/Go services, design flexible database schemas, and stitch together dynamic real-time map controls.",
    salary: "$120,000 - $150,000",
    skills: ["Node.js", "React", "PostgreSQL", "Go", "WebSockets"],
    deadline: "2026-06-15",
    experience: "3+ years",
    location: "Austin, TX",
    remote: false,
    companyId: "innovatelabs",
    postedAt: "2026-05-12T14:30:00.000Z",
    views: 189,
    engagement: 45,
    isFake: false
  },
  {
    id: "job-3",
    title: "Quantum Algorithms Architect",
    description: "Design and implement hybrid quantum-classical error correction routines. You will translate linear algebra structures into hardware-specific pulse scheduling controls.",
    salary: "$200,000 - $260,000",
    skills: ["Python", "Quantum Mechanics", "Qiskit", "C++", "Linear Algebra"],
    deadline: "2026-07-01",
    experience: "7+ years",
    location: "Boston, MA",
    remote: true,
    companyId: "quantumai",
    postedAt: "2026-05-14T08:15:00.000Z",
    views: 89,
    engagement: 92,
    isFake: false
  },
  {
    id: "job-4",
    title: "Solidity smart contract developer",
    description: "Deploy robust, gas-efficient pools, automated market makers, and vaults. Write rigorous property-based invariant evaluations and handle multi-signature deployments.",
    salary: "$160,000 - $190,000",
    skills: ["Solidity", "Hardhat", "Ethers.js", "Foundry", "DeFi"],
    deadline: "2026-05-20",
    experience: "4+ years",
    location: "Remote",
    remote: true,
    companyId: "finsphere",
    postedAt: "2026-05-15T11:00:00.000Z",
    views: 650,
    engagement: 82,
    isFake: false
  },
  {
    id: "job-5",
    title: "Crypto Staking Promoter (High Returns!)",
    description: "EASY WORK! Send spam links and advertise high-yield treasury investment tokens to online chatrooms. $5,000 per week guaranteed, just input your wallet seed phrase inside our website tool to register!",
    salary: "$250,000+ Guaranteed",
    skills: ["Marketing", "Social Media", "Investment", "Bitcoin"],
    deadline: "2026-05-25",
    experience: "No Experience Needed",
    location: "Worldwide",
    remote: true,
    companyId: "finsphere", // Mapped to Finsphere to simulate a hacked/compromised posting or fake company job
    postedAt: "2026-05-16T18:22:00.000Z",
    views: 940,
    engagement: 12,
    isFake: true // Seed data to test fake job removal!
  }
];

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    candidateName: "Sarah Jenkins",
    candidateEmail: "sarah.jenkins@dev.io",
    candidatePhone: "+1 (555) 019-2834",
    avatarColor: "bg-purple-500",
    status: "Applied",
    appliedAt: "2026-05-16T08:12:00.000Z",
    matchScore: 98,
    resumeQuality: 96,
    skillMatch: 100,
    experienceScore: 97,
    atsScore: 99,
    atsFeedback: [
      "Excellent technical keywords alignment (React, Next.js, Framer Motion)",
      "Strong historical tenure of 8 years in senior design and frontend leadership roles",
      "Perfect resume formatting with clear headers, metrics-focused achievements, and zero typos"
    ],
    skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Framer Motion", "GraphQL", "Webpack"],
    experienceYears: 8,
    education: "B.S. in Computer Science, Stanford University",
    resumeSummary: "Dedicated UI Engineer specializing in design systems, low-latency client experiences, and complex fluid layout integrations. Pioneered design frameworks that decreased page interactive latency by 35% at previous scale startup."
  },
  {
    id: "app-2",
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    candidateName: "David Chen",
    candidateEmail: "david.chen@codesmith.net",
    candidatePhone: "+1 (555) 021-9988",
    avatarColor: "bg-blue-500",
    status: "Shortlisted",
    appliedAt: "2026-05-15T11:45:00.000Z",
    matchScore: 94,
    resumeQuality: 92,
    skillMatch: 95,
    experienceScore: 90,
    atsScore: 96,
    atsFeedback: [
      "Extremely robust JavaScript/TypeScript skills demonstrated",
      "Minor keyword gap: missing explicit mention of Framer Motion (though CSS animations are listed)",
      "Strong visual resume construction with quantitative impact statements"
    ],
    skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Node.js", "AWS", "Docker", "SASS"],
    experienceYears: 5,
    education: "B.S. in Engineering, UT Austin",
    resumeSummary: "Full Stack developer who gravitated toward modern component engines. Expert in server-side React architectures, edge computing networks, and structuring durable UI components."
  },
  {
    id: "app-3",
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    candidateName: "Elena Rodriguez",
    candidateEmail: "elena.rod@uxdev.com",
    candidatePhone: "+1 (555) 304-4590",
    avatarColor: "bg-pink-500",
    status: "Interview Scheduled",
    appliedAt: "2026-05-14T15:20:00.000Z",
    matchScore: 89,
    resumeQuality: 88,
    skillMatch: 82,
    experienceScore: 92,
    atsScore: 86,
    atsFeedback: [
      "Outstanding design background (Figma, UX Research) brings high visual fidelity expertise",
      "Technically competent, but lacks heavy scale framework experience (mostly worked on landing layers)",
      "Highly creative structure with excellent portfolio integration links"
    ],
    skills: ["React", "TypeScript", "TailwindCSS", "Figma", "User Research", "Prototyping", "HTML5"],
    experienceYears: 6,
    education: "B.A. in Graphic Design, Pratt Institute",
    resumeSummary: "Hybrid UI/UX designer and software architect. Bridging the gap between conceptual user workflows and reactive modular component frameworks, ensuring polished, pixel-perfect user journeys.",
    interviewDate: "2026-05-20",
    interviewTime: "14:00",
    interviewLink: "https://hiresphere.ai/meet/interview-elena"
  },
  {
    id: "app-4",
    jobId: "job-2",
    jobTitle: "Full Stack Engineer",
    candidateName: "Alex Mercer",
    candidateEmail: "alex.mercer@network.io",
    candidatePhone: "+1 (555) 777-1234",
    avatarColor: "bg-cyan-500",
    status: "Applied",
    appliedAt: "2026-05-16T17:05:00.000Z",
    matchScore: 92,
    resumeQuality: 90,
    skillMatch: 95,
    experienceScore: 90,
    atsScore: 93,
    atsFeedback: [
      "High match in server technologies (Node.js, PostgreSQL)",
      "Familiar with real-time architectures (WebSockets, Redis pipelines)",
      "Clean linear layout, excellent metrics on telemetry rendering"
    ],
    skills: ["Node.js", "React", "PostgreSQL", "Go", "WebSockets", "Redis", "Docker"],
    experienceYears: 4,
    education: "B.S. in Computer Science, Georgia Tech",
    resumeSummary: "Backend-heavy Full Stack engineer with strong capabilities in scaling REST and WebSocket APIs. Deployed telemetry aggregation nodes processing 10k messages/second."
  },
  {
    id: "app-5",
    jobId: "job-3",
    jobTitle: "Quantum Algorithms Architect",
    candidateName: "Dr. Alicia Vance",
    candidateEmail: "avance@quantumlabs.org",
    candidatePhone: "+1 (555) 909-8800",
    avatarColor: "bg-emerald-500",
    status: "Shortlisted",
    appliedAt: "2026-05-15T09:30:00.000Z",
    matchScore: 97,
    resumeQuality: 98,
    skillMatch: 96,
    experienceScore: 98,
    atsScore: 97,
    atsFeedback: [
      "Exceptional academic credential (PhD in Quantum Computing from MIT)",
      "Direct expertise in Qiskit compiler tools and superconducting hardware simulators",
      "Very structured academic-technical resume mapping major research grants and physical deployments"
    ],
    skills: ["Python", "Quantum Mechanics", "Qiskit", "C++", "Linear Algebra", "TensorFlow", "LaTeX"],
    experienceYears: 9,
    education: "Ph.D. in Quantum Information Systems, MIT",
    resumeSummary: "Researcher and developer designing hybrid quantum-classical optimization loops. Dedicated to leveraging quantum hardware interfaces to solve combinatorial logistic bottlenecks."
  },
  {
    id: "app-6",
    jobId: "job-5",
    jobTitle: "Crypto Staking Promoter (High Returns!)",
    candidateName: "Malicious Spammer",
    candidateEmail: "spammer@botnet.xyz",
    avatarColor: "bg-red-500",
    status: "Applied",
    appliedAt: "2026-05-17T02:00:00.000Z",
    matchScore: 35,
    resumeQuality: 10,
    skillMatch: 20,
    experienceScore: 40,
    atsScore: 25,
    atsFeedback: [
      "Severe mismatch in candidate background and normal software protocols",
      "Extremely poor resume structure, uses spam keywords",
      "Flagged as potential automated crawler profile"
    ],
    skills: ["Spam", "Bots", "Crypto", "Telegram"],
    experienceYears: 1,
    education: "None",
    resumeSummary: "Looking to deploy automated bots to drive traffic to high yield wallet schemes."
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "apply",
    message: "Sarah Jenkins has applied for Senior Frontend Engineer (Match Score: 98%)",
    timestamp: "2026-05-16T08:12:00.000Z",
    read: false
  },
  {
    id: "notif-2",
    type: "new_job",
    message: "Job 'Solidity smart contract developer' was successfully published by FinSphere Global.",
    timestamp: "2026-05-15T11:00:00.000Z",
    read: true
  },
  {
    id: "notif-3",
    type: "status",
    message: "David Chen has been shortlisted for Senior Frontend Engineer.",
    timestamp: "2026-05-15T12:00:00.000Z",
    read: true
  },
  {
    id: "notif-4",
    type: "system",
    message: "Admin: Company profile 'FinSphere Global' has been successfully verified.",
    timestamp: "2026-05-14T09:00:00.000Z",
    read: true
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: "rep-1",
    jobId: "job-5",
    jobTitle: "Crypto Staking Promoter (High Returns!)",
    companyName: "FinSphere Global",
    reason: "This job is a crypto scam attempting to steal seed phrases and wallet private keys. Fake company post.",
    reportedAt: "2026-05-17T03:30:00.000Z",
    resolved: false
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: "log-1", user: "system", action: "DATABASE_INITIALIZED", timestamp: "2026-05-17T05:00:00.000Z", details: "Mock schema and initial records set up." },
  { id: "log-2", user: "employer@techcorp.com", action: "LOGIN_SUCCESS", timestamp: "2026-05-17T08:30:00.000Z" },
  { id: "log-3", user: "employer@techcorp.com", action: "SHORTLIST_APPLICANT", timestamp: "2026-05-17T08:45:00.000Z", details: "Applicant: David Chen, Role: Senior Frontend Engineer" },
  { id: "log-4", user: "candidate@jenkins.com", action: "APPLICATION_SUBMITTED", timestamp: "2026-05-17T09:12:00.000Z", details: "Job: Senior Frontend Engineer" },
  { id: "log-5", user: "anonymous", action: "REPORT_JOB", timestamp: "2026-05-17T10:30:00.000Z", details: "Job ID: job-5, Reason: Crypto scam harvesting wallets" }
];

const INITIAL_USERS: User[] = [
  { id: "u-1", name: "Sarah Jenkins", email: "sarah.jenkins@dev.io", role: "candidate", banned: false, registeredAt: "2026-05-01" },
  { id: "u-2", name: "David Chen", email: "david.chen@codesmith.net", role: "candidate", banned: false, registeredAt: "2026-05-02" },
  { id: "u-3", name: "Elena Rodriguez", email: "elena.rod@uxdev.com", role: "candidate", banned: false, registeredAt: "2026-05-03" },
  { id: "u-4", name: "Alex Mercer", email: "alex.mercer@network.io", role: "candidate", banned: false, registeredAt: "2026-05-04" },
  { id: "u-5", name: "Dr. Alicia Vance", email: "avance@quantumlabs.org", role: "candidate", banned: false, registeredAt: "2026-05-05" },
  { id: "u-6", name: "TechCorp Employer", email: "employer@hiresphere.ai", role: "employer", banned: false, registeredAt: "2026-05-01" },
  { id: "u-7", name: "Finsphere Recruiter", email: "recruiter@finsphere.com", role: "employer", banned: false, registeredAt: "2026-05-06" },
  { id: "u-8", name: "Sandbox Admin", email: "admin@hiresphere.ai", role: "admin", banned: false, registeredAt: "2026-05-01" },
  { id: "u-9", name: "Malicious Spammer", email: "spammer@botnet.xyz", role: "candidate", banned: true, registeredAt: "2026-05-16" }
];

export interface HireSphereDB {
  companies: Company[];
  jobs: Job[];
  applicants: Applicant[];
  notifications: Notification[];
  reports: Report[];
  logs: ActivityLog[];
  users: User[];
}

const STORAGE_KEY = "hiresphere_mock_db";

function isLocalStorageAvailable(): boolean {
  return typeof window !== "undefined" && window.localStorage !== undefined;
}

// Merged data: original + expanded sample data
const ALL_COMPANIES = [...INITIAL_COMPANIES, ...EXTRA_COMPANIES];
const ALL_JOBS = [...INITIAL_JOBS, ...EXTRA_JOBS];
const ALL_APPLICANTS = [...INITIAL_APPLICANTS, ...EXTRA_APPLICANTS];
const ALL_USERS = [...INITIAL_USERS, ...EXTRA_USERS];

export function getDatabase(): HireSphereDB {
  if (!isLocalStorageAvailable()) {
    return {
      companies: ALL_COMPANIES,
      jobs: ALL_JOBS,
      applicants: ALL_APPLICANTS,
      notifications: INITIAL_NOTIFICATIONS,
      reports: INITIAL_REPORTS,
      logs: INITIAL_LOGS,
      users: ALL_USERS
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const db: HireSphereDB = {
      companies: ALL_COMPANIES,
      jobs: ALL_JOBS,
      applicants: ALL_APPLICANTS,
      notifications: INITIAL_NOTIFICATIONS,
      reports: INITIAL_REPORTS,
      logs: INITIAL_LOGS,
      users: ALL_USERS
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse mock database, resetting storage", e);
    const db: HireSphereDB = {
      companies: ALL_COMPANIES,
      jobs: ALL_JOBS,
      applicants: ALL_APPLICANTS,
      notifications: INITIAL_NOTIFICATIONS,
      reports: INITIAL_REPORTS,
      logs: INITIAL_LOGS,
      users: ALL_USERS
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
}

export function saveDatabase(db: HireSphereDB) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Dispatch custom event to notify other components in same window
    window.dispatchEvent(new Event("hiresphere_db_change"));
  }
}

export interface FraudResult {
  score: number;
  reasons: string[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export function calculateFraudProbability(job: Job): FraudResult {
  const db = getDatabase();
  const company = db.companies.find(c => c.id === job.companyId);
  const reasons: string[] = [];
  let score = 0;

  // Rule 1: Check unverified company
  if (company && !company.verified) {
    score += 25;
    reasons.push("Job posted by an unverified company profile");
  }

  // Rule 2: Extreme salary with no experience required
  const salaryClean = job.salary.replace(/[^0-9]/g, "");
  const salaryNum = parseInt(salaryClean) || 0;
  const isNoExp = /no experience|0-1 years|0+ years/i.test(job.experience);
  
  if (salaryNum > 200000 && isNoExp) {
    score += 35;
    reasons.push("Extreme salary-to-experience ratio (high pay for no experience)");
  } else if (job.salary.toLowerCase().includes("guaranteed") || job.salary.toLowerCase().includes("fixed daily")) {
    score += 20;
    reasons.push("Salary advertised with 'guaranteed' high-yield phrasing");
  }

  // Rule 3: High-risk keyword scanning in title
  const titleLower = job.title.toLowerCase();
  const scamTitleKeywords = [
    "staking", "crypto staking", "passive income", "earn money", 
    "easy work", "guaranteed returns", "investment", "bitcoin promo", "telegram spam"
  ];
  const matchedTitle = scamTitleKeywords.filter(k => titleLower.includes(k));
  if (matchedTitle.length > 0) {
    score += 30;
    reasons.push(`High-risk terms in title: ${matchedTitle.join(", ")}`);
  }

  // Rule 4: High-risk keywords in description
  const descLower = job.description.toLowerCase();
  const scamDescKeywords = [
    "seed phrase", "wallet seed", "private key", "high yield", 
    "investment tokens", "bitcoin wallet", "guaranteed profit", 
    "input wallet", "whatsapp number", "telegram private link"
  ];
  const matchedDesc = scamDescKeywords.filter(k => descLower.includes(k));
  if (matchedDesc.length > 0) {
    score += 40;
    reasons.push(`High-risk phishing keywords in description: ${matchedDesc.join(", ")}`);
  }

  // Rule 5: isFake flag
  if (job.isFake) {
    score += 50;
    reasons.push("Platform Admin flagged this listing as a verified scam");
  }

  score = Math.min(score, 100);

  let riskLevel: "Low" | "Medium" | "High" | "Critical" = "Low";
  if (score >= 80) riskLevel = "Critical";
  else if (score >= 50) riskLevel = "High";
  else if (score >= 25) riskLevel = "Medium";

  return { score, reasons, riskLevel };
}

// ----------------------------------------------------
// DATABASE OPERATION APIS
// ----------------------------------------------------

export function postJob(jobData: Omit<Job, "id" | "postedAt" | "views" | "engagement" | "isFake">): Job {
  const db = getDatabase();
  const newJob: Job = {
    ...jobData,
    id: `job-${Date.now()}`,
    postedAt: new Date().toISOString(),
    views: Math.floor(Math.random() * 20) + 1,
    engagement: Math.floor(Math.random() * 10) + 5,
    isFake: false
  };

  db.jobs.unshift(newJob);
  
  // Log activity
  logActivityDirect(db, "employer@hiresphere.ai", "JOB_POSTED", `Job ID: ${newJob.id}, Title: ${newJob.title}`);
  
  // Generate system notifications
  addNotificationDirect(db, "new_job", `New job posted: "${newJob.title}" at TechCorp.`);

  // Generate 3 simulated applicant profiles matched by AI for this new job!
  simulateApplicantsForJob(db, newJob);

  saveDatabase(db);
  return newJob;
}

export function removeJob(jobId: string) {
  const db = getDatabase();
  db.jobs = db.jobs.filter(j => j.id !== jobId);
  db.applicants = db.applicants.filter(a => a.jobId !== jobId);
  db.reports = db.reports.filter(r => r.jobId !== jobId);
  
  logActivityDirect(db, "admin@hiresphere.ai", "JOB_DELETED", `Job ID: ${jobId}`);
  saveDatabase(db);
}

export function updateCompanyProfile(companyId: string, profile: Partial<Company>) {
  const db = getDatabase();
  db.companies = db.companies.map(c => {
    if (c.id === companyId) {
      return { ...c, ...profile };
    }
    return c;
  });
  logActivityDirect(db, "employer@hiresphere.ai", "COMPANY_PROFILE_UPDATED", `Company: ${companyId}`);
  saveDatabase(db);
}

export function verifyCompany(companyId: string, status: boolean) {
  const db = getDatabase();
  db.companies = db.companies.map(c => {
    if (c.id === companyId) {
      return { ...c, verified: status };
    }
    return c;
  });
  logActivityDirect(db, "admin@hiresphere.ai", status ? "COMPANY_VERIFIED" : "COMPANY_UNVERIFIED", `Company ID: ${companyId}`);
  addNotificationDirect(db, "system", `Company profile for "${db.companies.find(c => c.id === companyId)?.name}" has been ${status ? 'verified' : 'unverified'} by Admin.`);
  saveDatabase(db);
}

export function banUser(email: string, status: boolean) {
  const db = getDatabase();
  
  // Update in Users list
  db.users = db.users.map(u => {
    if (u.email === email) {
      return { ...u, banned: status };
    }
    return u;
  });

  // Log activity
  logActivityDirect(db, "admin@hiresphere.ai", status ? "USER_BANNED" : "USER_UNBANNED", `User: ${email}`);
  addNotificationDirect(db, "system", `User ${email} has been ${status ? "BANNED" : "UNBANNED"} from the platform.`);
  saveDatabase(db);
}

export function reportJob(jobId: string, reason: string) {
  const db = getDatabase();
  const job = db.jobs.find(j => j.id === jobId);
  const company = db.companies.find(c => c.id === job?.companyId);

  if (job) {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      jobId,
      jobTitle: job.title,
      companyName: company?.name || "Unknown Company",
      reason,
      reportedAt: new Date().toISOString(),
      resolved: false
    };

    db.reports.unshift(newReport);
    logActivityDirect(db, "anonymous", "REPORT_JOB", `Job ID: ${jobId}, Reason: ${reason}`);
    addNotificationDirect(db, "system", `ALERT: Job "${job.title}" has been flagged/reported by a candidate.`);
    saveDatabase(db);
  }
}

export function dismissReport(reportId: string) {
  const db = getDatabase();
  db.reports = db.reports.map(r => {
    if (r.id === reportId) {
      return { ...r, resolved: true };
    }
    return r;
  });
  logActivityDirect(db, "admin@hiresphere.ai", "REPORT_DISMISSED", `Report ID: ${reportId}`);
  saveDatabase(db);
}

export function updateApplicationStatus(
  applicationId: string, 
  status: Applicant["status"], 
  extra?: { interviewDate?: string; interviewTime?: string; interviewLink?: string }
) {
  const db = getDatabase();
  let candidateName = "";
  let jobTitle = "";

  db.applicants = db.applicants.map(a => {
    if (a.id === applicationId) {
      candidateName = a.candidateName;
      jobTitle = a.jobTitle;
      const updated = { ...a, status, ...extra };
      return updated;
    }
    return a;
  });

  logActivityDirect(db, "employer@hiresphere.ai", `APPLICATION_${status.toUpperCase().replace(" ", "_")}`, `Applicant: ${candidateName}, Job: ${jobTitle}`);
  
  let notifMessage = `${candidateName}'s application status for "${jobTitle}" has been updated to: ${status}.`;
  if (status === "Interview Scheduled" && extra?.interviewDate) {
    notifMessage = `Interview scheduled with ${candidateName} for "${jobTitle}" on ${extra.interviewDate} at ${extra.interviewTime}.`;
  }
  addNotificationDirect(db, "status", notifMessage);
  
  saveDatabase(db);
}

export function addNotification(type: Notification["type"], message: string) {
  const db = getDatabase();
  addNotificationDirect(db, type, message);
  saveDatabase(db);
}

export function markNotificationsRead() {
  const db = getDatabase();
  db.notifications = db.notifications.map(n => ({ ...n, read: true }));
  saveDatabase(db);
}

// ----------------------------------------------------
// PRIVATE HELPER FUNCTIONS
// ----------------------------------------------------

function logActivityDirect(db: HireSphereDB, user: string, action: string, details?: string) {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  db.logs.unshift(log);
}

function addNotificationDirect(db: HireSphereDB, type: Notification["type"], message: string) {
  const notif: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
}

function simulateApplicantsForJob(db: HireSphereDB, job: Job) {
  // Pre-configured simulation variables
  const mockNames = [
    { name: "Julian Vance", email: "j.vance@techlabs.com", avatar: "bg-cyan-500" },
    { name: "Clara Croft", email: "cc@adventuredev.net", avatar: "bg-pink-500" },
    { name: "Michael Vance", email: "mike.v@coder.io", avatar: "bg-blue-500" },
    { name: "Zara Sheikh", email: "zara.s@aiarch.co", avatar: "bg-purple-500" },
    { name: "Liam O'Connor", email: "liam.oc@webscale.net", avatar: "bg-emerald-500" }
  ];

  // Pick 3 random developers
  const shuffled = [...mockNames].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  shuffled.forEach((c, idx) => {
    // Generate AI metrics relative to the job skills matched
    const matchesCount = Math.floor(Math.random() * 3) + 2; // match 2 to 4 skills
    const matchedSkills = [...job.skills].slice(0, matchesCount);
    const missingSkills = [...job.skills].slice(matchesCount);
    const extraSkills = ["Docker", "Kubernetes", "Redis", "SASS", "Vitest"].slice(0, Math.floor(Math.random() * 3));
    const allSkills = [...matchedSkills, ...extraSkills];
    
    // Scores
    const resumeQuality = Math.floor(Math.random() * 20) + 80;
    const skillMatch = Math.round((matchedSkills.length / job.skills.length) * 100);
    const experienceScore = Math.floor(Math.random() * 15) + 85;
    const atsScore = Math.round((resumeQuality + skillMatch + experienceScore) / 3);
    const matchScore = Math.round((atsScore * 0.4) + (skillMatch * 0.4) + (experienceScore * 0.2));

    const applicant: Applicant = {
      id: `app-sim-${Date.now()}-${idx}`,
      jobId: job.id,
      jobTitle: job.title,
      candidateName: c.name,
      candidateEmail: c.email,
      candidatePhone: `+1 (555) 0${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`,
      avatarColor: c.avatar,
      status: "Applied",
      appliedAt: new Date().toISOString(),
      matchScore,
      resumeQuality,
      skillMatch,
      experienceScore,
      atsScore,
      atsFeedback: [
        `Matched ${matchedSkills.length} key skill tags: ${matchedSkills.join(", ")}.`,
        missingSkills.length > 0 ? `Missing skill tags: ${missingSkills.join(", ")}.` : "All requested skill keywords matched perfectly.",
        "Candidate possesses clear career progression, detailing robust team ownership achievements.",
        "Clean, parsed chronological layout ensures high semantic accessibility."
      ],
      skills: allSkills,
      experienceYears: Math.floor(Math.random() * 5) + 3,
      education: "B.S. in Software Systems, Georgia Tech",
      resumeSummary: `Ambitious software professional with a deep appreciation for solid, tested backend endpoints and fluid client render pipelines. Enjoys solving complex asynchronous challenges and building clean components.`
    };

    db.applicants.unshift(applicant);
    
    // Add applicant user to users pool if they don't exist
    if (!db.users.some(u => u.email === c.email)) {
      db.users.push({
        id: `u-sim-${Date.now()}-${idx}`,
        name: c.name,
        email: c.email,
        role: "candidate",
        banned: false,
        registeredAt: new Date().toISOString().split("T")[0]
      });
    }

    // Add candidate apply notification scheduled in activity logs
    logActivityDirect(db, applicant.candidateEmail, "APPLICATION_SUBMITTED", `Job: ${job.title}, Match Score: ${matchScore}%`);
  });
}
