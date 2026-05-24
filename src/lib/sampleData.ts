"use client";
import type { Company, Job, Applicant, User } from "./db";

// ==========================================
// EXPANDED SAMPLE HIRING DATA
// ==========================================

export const EXTRA_COMPANIES: Company[] = [
  {
    id: "nexushealth", name: "NexusHealth Systems", logoColor: "from-red-500 to-orange-500",
    logoEmoji: "🏥", description: "AI-powered telemedicine and diagnostic platforms revolutionizing remote patient care.",
    website: "https://nexushealth.io", industry: "HealthTech & AI", teamSize: "200-400 employees", verified: true,
  },
  {
    id: "arcadestudios", name: "Arcade Studios", logoColor: "from-yellow-500 to-red-500",
    logoEmoji: "🎮", description: "AAA indie game studio building immersive multiplayer experiences with Unreal Engine 5.",
    website: "https://arcadestudios.gg", industry: "Gaming & Interactive", teamSize: "50-100 employees", verified: true,
  },
  {
    id: "datavault", name: "DataVault Analytics", logoColor: "from-blue-500 to-indigo-500",
    logoEmoji: "📊", description: "Enterprise data warehousing, BI dashboards, and predictive analytics at scale.",
    website: "https://datavault.co", industry: "Data Analytics & BI", teamSize: "150-300 employees", verified: true,
  },
  {
    id: "greenenergy", name: "GreenPulse Energy", logoColor: "from-green-500 to-lime-500",
    logoEmoji: "🌱", description: "Sustainable energy management platforms optimizing solar and wind grid distribution.",
    website: "https://greenpulse.energy", industry: "CleanTech & Energy", teamSize: "80-150 employees", verified: false,
  },
  {
    id: "cyberfort", name: "CyberFort Security", logoColor: "from-slate-500 to-zinc-500",
    logoEmoji: "🔒", description: "Zero-trust network security, penetration testing automation, and SOC-as-a-Service.",
    website: "https://cyberfort.sec", industry: "Cybersecurity", teamSize: "100-200 employees", verified: true,
  },
  {
    id: "eduspark", name: "EduSpark Learning", logoColor: "from-amber-500 to-yellow-500",
    logoEmoji: "📚", description: "Adaptive learning platforms with AI tutoring engines for K-12 and higher education.",
    website: "https://eduspark.learn", industry: "EdTech & AI", teamSize: "60-120 employees", verified: true,
  },
];

export const EXTRA_JOBS: Job[] = [
  {
    id: "job-6", title: "ML Engineer — Medical Imaging", description: "Design and deploy deep learning models for X-ray and MRI diagnostic classification. You will work with medical datasets, optimize model inference latency, and integrate with HIPAA-compliant cloud infrastructure.",
    salary: "$155,000 - $195,000", skills: ["Python", "TensorFlow", "PyTorch", "Docker", "AWS"],
    deadline: "2026-07-15", experience: "4+ years", location: "Boston, MA", remote: true,
    companyId: "nexushealth", postedAt: "2026-05-18T10:00:00.000Z", views: 234, engagement: 85, isFake: false,
  },
  {
    id: "job-7", title: "Unreal Engine Game Developer", description: "Build core gameplay systems for our multiplayer arena shooter. Experience with C++, Blueprints, and networked replication is essential. You will design combat mechanics, optimize rendering pipelines, and create dynamic particle systems.",
    salary: "$130,000 - $165,000", skills: ["C++", "Unreal Engine", "Blueprints", "Networking", "3D Math"],
    deadline: "2026-06-30", experience: "3+ years", location: "Los Angeles, CA", remote: false,
    companyId: "arcadestudios", postedAt: "2026-05-19T14:00:00.000Z", views: 567, engagement: 91, isFake: false,
  },
  {
    id: "job-8", title: "Senior Data Engineer", description: "Architect scalable ETL pipelines using Apache Spark and Kafka. You will design data lake schemas, optimize query performance on Snowflake, and build real-time streaming dashboards for enterprise clients.",
    salary: "$145,000 - $180,000", skills: ["Python", "Apache Spark", "Kafka", "Snowflake", "SQL"],
    deadline: "2026-07-01", experience: "5+ years", location: "New York, NY", remote: true,
    companyId: "datavault", postedAt: "2026-05-17T09:30:00.000Z", views: 312, engagement: 76, isFake: false,
  },
  {
    id: "job-9", title: "Embedded IoT Engineer", description: "Design firmware for solar panel monitoring sensors. Work with ARM microcontrollers, MQTT protocols, and edge computing nodes to optimize energy grid telemetry data collection.",
    salary: "$120,000 - $150,000", skills: ["C", "Embedded Systems", "MQTT", "ARM", "Python"],
    deadline: "2026-06-20", experience: "3+ years", location: "Denver, CO", remote: false,
    companyId: "greenenergy", postedAt: "2026-05-20T11:00:00.000Z", views: 98, engagement: 63, isFake: false,
  },
  {
    id: "job-10", title: "Penetration Testing Lead", description: "Lead offensive security assessments for enterprise clients. You will conduct web app pentests, network vulnerability scans, write detailed reports, and mentor junior security analysts.",
    salary: "$160,000 - $200,000", skills: ["Burp Suite", "Metasploit", "Python", "OWASP", "Linux"],
    deadline: "2026-07-10", experience: "6+ years", location: "Remote", remote: true,
    companyId: "cyberfort", postedAt: "2026-05-16T08:00:00.000Z", views: 445, engagement: 88, isFake: false,
  },
  {
    id: "job-11", title: "AI Curriculum Designer", description: "Create adaptive learning pathways using NLP and knowledge graphs. You will design assessment algorithms, build recommendation engines for student content, and collaborate with educators.",
    salary: "$110,000 - $140,000", skills: ["Python", "NLP", "Machine Learning", "SQL", "Education"],
    deadline: "2026-06-25", experience: "2+ years", location: "San Francisco, CA", remote: true,
    companyId: "eduspark", postedAt: "2026-05-21T13:00:00.000Z", views: 178, engagement: 72, isFake: false,
  },
  {
    id: "job-12", title: "DevOps & Cloud Architect", description: "Design and manage multi-cloud Kubernetes clusters. Implement CI/CD pipelines, infrastructure as code with Terraform, and container orchestration for microservices at scale.",
    salary: "$150,000 - $185,000", skills: ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD"],
    deadline: "2026-07-05", experience: "5+ years", location: "Seattle, WA", remote: true,
    companyId: "datavault", postedAt: "2026-05-15T07:00:00.000Z", views: 389, engagement: 81, isFake: false,
  },
];

export const EXTRA_APPLICANTS: Applicant[] = [
  {
    id: "app-7", jobId: "job-6", jobTitle: "ML Engineer — Medical Imaging",
    candidateName: "Dr. Priya Patel", candidateEmail: "priya.patel@medai.org", candidatePhone: "+1 (555) 440-6612",
    avatarColor: "bg-red-500", status: "Shortlisted", appliedAt: "2026-05-19T09:15:00.000Z",
    matchScore: 96, resumeQuality: 95, skillMatch: 98, experienceScore: 94, atsScore: 96,
    atsFeedback: ["Deep expertise in medical imaging and TensorFlow model deployment", "Published 12 peer-reviewed papers on diagnostic AI", "HIPAA compliance experience documented"],
    skills: ["Python", "TensorFlow", "PyTorch", "Medical Imaging", "Docker", "Kubernetes", "MLOps"],
    experienceYears: 7, education: "Ph.D. in Biomedical Engineering, Johns Hopkins University",
    resumeSummary: "Researcher and ML engineer specializing in medical AI systems. Deployed diagnostic models processing 50k+ scans annually with 99.2% accuracy.",
  },
  {
    id: "app-8", jobId: "job-7", jobTitle: "Unreal Engine Game Developer",
    candidateName: "Marcus Webb", candidateEmail: "marcus.webb@gamedev.io", candidatePhone: "+1 (555) 829-3341",
    avatarColor: "bg-yellow-500", status: "Applied", appliedAt: "2026-05-20T16:30:00.000Z",
    matchScore: 91, resumeQuality: 88, skillMatch: 94, experienceScore: 89, atsScore: 90,
    atsFeedback: ["Strong C++ and Unreal Engine portfolio with shipped titles", "Multiplayer networking experience with 64-player lobbies", "Minor gap: limited 3D math optimization experience"],
    skills: ["C++", "Unreal Engine", "Blueprints", "Networking", "Git", "Perforce"],
    experienceYears: 5, education: "B.S. in Game Design, DigiPen Institute of Technology",
    resumeSummary: "Game developer with 3 shipped titles. Expert in UE5 gameplay systems, combat mechanics, and networked multiplayer architecture.",
  },
  {
    id: "app-9", jobId: "job-8", jobTitle: "Senior Data Engineer",
    candidateName: "Lisa Chen", candidateEmail: "lisa.chen@datapro.net", candidatePhone: "+1 (555) 662-7789",
    avatarColor: "bg-indigo-500", status: "Interview Scheduled", appliedAt: "2026-05-18T11:00:00.000Z",
    matchScore: 94, resumeQuality: 92, skillMatch: 96, experienceScore: 93, atsScore: 95,
    atsFeedback: ["Expert-level Apache Spark and Kafka pipeline design", "Managed 50TB+ data lakes on Snowflake", "Clean resume with quantitative impact metrics"],
    skills: ["Python", "Apache Spark", "Kafka", "Snowflake", "SQL", "Airflow", "dbt"],
    experienceYears: 6, education: "M.S. in Data Science, Columbia University",
    resumeSummary: "Data engineer building enterprise-scale analytics pipelines. Reduced ETL processing time by 60% through Spark optimization and partitioned storage strategies.",
    interviewDate: "2026-05-25", interviewTime: "11:00", interviewLink: "https://hiresphere.ai/meet/interview-lisa",
  },
  {
    id: "app-10", jobId: "job-10", jobTitle: "Penetration Testing Lead",
    candidateName: "Jake Morrison", candidateEmail: "jake.m@cybersec.pro", candidatePhone: "+1 (555) 991-4456",
    avatarColor: "bg-slate-500", status: "Shortlisted", appliedAt: "2026-05-17T14:20:00.000Z",
    matchScore: 93, resumeQuality: 91, skillMatch: 95, experienceScore: 92, atsScore: 94,
    atsFeedback: ["OSCP, OSCE, and GPEN certified professional", "Led 200+ enterprise penetration tests", "Published security research on OWASP Top 10 vulnerabilities"],
    skills: ["Burp Suite", "Metasploit", "Python", "OWASP", "Linux", "Nmap", "Wireshark"],
    experienceYears: 8, education: "B.S. in Cybersecurity, RIT",
    resumeSummary: "Offensive security professional with 8+ years leading red team operations. Discovered critical vulnerabilities in Fortune 500 enterprise systems.",
  },
  {
    id: "app-11", jobId: "job-11", jobTitle: "AI Curriculum Designer",
    candidateName: "Emily Torres", candidateEmail: "emily.t@edtech.com", candidatePhone: "+1 (555) 337-8800",
    avatarColor: "bg-amber-500", status: "Applied", appliedAt: "2026-05-22T10:45:00.000Z",
    matchScore: 87, resumeQuality: 85, skillMatch: 88, experienceScore: 84, atsScore: 86,
    atsFeedback: ["Strong NLP background with curriculum design experience", "Built adaptive learning systems serving 100k+ students", "Minor gap: limited knowledge graph experience"],
    skills: ["Python", "NLP", "Machine Learning", "SQL", "Curriculum Design", "React"],
    experienceYears: 4, education: "M.Ed. in Learning Technologies, Stanford University",
    resumeSummary: "EdTech specialist combining AI expertise with pedagogical design. Created personalized learning pathways that improved student outcomes by 28%.",
  },
  {
    id: "app-12", jobId: "job-12", jobTitle: "DevOps & Cloud Architect",
    candidateName: "Ryan Nakamura", candidateEmail: "ryan.n@cloudops.dev", candidatePhone: "+1 (555) 552-1190",
    avatarColor: "bg-blue-500", status: "Applied", appliedAt: "2026-05-16T13:00:00.000Z",
    matchScore: 95, resumeQuality: 93, skillMatch: 97, experienceScore: 94, atsScore: 95,
    atsFeedback: ["Expert Kubernetes and Terraform infrastructure architect", "Managed 500+ node clusters on multi-cloud environments", "Strong CI/CD pipeline automation with GitOps methodology"],
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD", "ArgoCD", "Prometheus"],
    experienceYears: 7, education: "B.S. in Computer Engineering, University of Washington",
    resumeSummary: "Cloud infrastructure architect specializing in multi-cloud Kubernetes orchestration. Achieved 99.99% uptime across production clusters serving 10M+ requests/day.",
  },
];

export const EXTRA_USERS: User[] = [
  { id: "u-10", name: "Dr. Priya Patel", email: "priya.patel@medai.org", role: "candidate", banned: false, registeredAt: "2026-05-07" },
  { id: "u-11", name: "Marcus Webb", email: "marcus.webb@gamedev.io", role: "candidate", banned: false, registeredAt: "2026-05-08" },
  { id: "u-12", name: "Lisa Chen", email: "lisa.chen@datapro.net", role: "candidate", banned: false, registeredAt: "2026-05-09" },
  { id: "u-13", name: "Jake Morrison", email: "jake.m@cybersec.pro", role: "candidate", banned: false, registeredAt: "2026-05-10" },
  { id: "u-14", name: "Emily Torres", email: "emily.t@edtech.com", role: "candidate", banned: false, registeredAt: "2026-05-11" },
  { id: "u-15", name: "Ryan Nakamura", email: "ryan.n@cloudops.dev", role: "candidate", banned: false, registeredAt: "2026-05-12" },
  { id: "u-16", name: "NexusHealth HR", email: "hr@nexushealth.io", role: "employer", banned: false, registeredAt: "2026-05-07" },
  { id: "u-17", name: "Arcade Studios Recruiting", email: "jobs@arcadestudios.gg", role: "employer", banned: false, registeredAt: "2026-05-08" },
  { id: "u-18", name: "DataVault Talent", email: "talent@datavault.co", role: "employer", banned: false, registeredAt: "2026-05-09" },
];
