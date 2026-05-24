"use client";
import { Job, Applicant, getDatabase } from "./db";

// ==========================================
// MULTI-FACTOR HIRING RECOMMENDATION MODEL
// ==========================================

export interface CandidateScore {
  applicantId: string;
  candidateName: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  atsScore: number;
  cultureFitScore: number;
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "No Hire";
  strengths: string[];
  risks: string[];
  rank: number;
}

export interface JobRecommendation {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salaryFit: string;
  reasoning: string;
}

// Weights for the multi-factor model
const WEIGHTS = { skills: 0.30, experience: 0.25, education: 0.15, ats: 0.15, culture: 0.15 };

// Education tier mapping
const EDU_TIERS: Record<string, number> = {
  "phd": 100, "ph.d": 100, "doctorate": 100,
  "masters": 88, "m.s.": 88, "m.sc": 88, "mba": 88,
  "bachelors": 75, "b.s.": 75, "b.sc": 75, "b.a.": 75,
  "associate": 60, "bootcamp": 55, "self-taught": 50, "none": 30,
};

// Top-tier universities boost
const ELITE_UNIS = ["stanford", "mit", "harvard", "berkeley", "caltech", "carnegie mellon", "georgia tech", "princeton", "oxford", "cambridge"];

function computeSkillScore(candidateSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 70;
  const cLower = candidateSkills.map(s => s.toLowerCase());
  const jLower = jobSkills.map(s => s.toLowerCase());
  const matched = jLower.filter(s => cLower.some(c => c.includes(s) || s.includes(c)));
  return Math.round((matched.length / jLower.length) * 100);
}

function computeExperienceScore(candidateYears: number, jobExp: string): number {
  const match = jobExp.match(/(\d+)/);
  const required = match ? parseInt(match[1]) : 3;
  if (candidateYears >= required + 3) return 95;
  if (candidateYears >= required) return 90;
  if (candidateYears >= required - 1) return 75;
  if (candidateYears >= required - 2) return 60;
  return 40;
}

function computeEducationScore(education: string): number {
  const eduLower = education.toLowerCase();
  let score = 65;
  for (const [key, val] of Object.entries(EDU_TIERS)) {
    if (eduLower.includes(key)) { score = Math.max(score, val); }
  }
  if (ELITE_UNIS.some(u => eduLower.includes(u))) score = Math.min(score + 10, 100);
  return score;
}

function computeCultureFit(candidateSkills: string[], companyIndustry: string): number {
  const techKeywords = ["react", "typescript", "python", "node.js", "go", "rust", "kubernetes"];
  const finKeywords = ["solidity", "defi", "blockchain", "smart contract", "ethers"];
  const mlKeywords = ["tensorflow", "pytorch", "ml", "machine learning", "data science"];
  const cLower = candidateSkills.map(s => s.toLowerCase());
  const indLower = (companyIndustry || "").toLowerCase();
  let fitScore = 70;
  if (indLower.includes("saas") || indLower.includes("cloud")) {
    fitScore += cLower.filter(s => techKeywords.some(k => s.includes(k))).length * 5;
  } else if (indLower.includes("fintech") || indLower.includes("web3")) {
    fitScore += cLower.filter(s => finKeywords.some(k => s.includes(k))).length * 6;
  } else if (indLower.includes("quantum") || indLower.includes("ml")) {
    fitScore += cLower.filter(s => mlKeywords.some(k => s.includes(k))).length * 6;
  }
  return Math.min(fitScore, 100);
}

function getRecommendation(score: number): CandidateScore["recommendation"] {
  if (score >= 88) return "Strong Hire";
  if (score >= 75) return "Hire";
  if (score >= 55) return "Maybe";
  return "No Hire";
}

function getStrengths(skillScore: number, expScore: number, eduScore: number): string[] {
  const s: string[] = [];
  if (skillScore >= 85) s.push("Excellent technical skill alignment");
  if (expScore >= 85) s.push("Strong experience match for the role");
  if (eduScore >= 85) s.push("Outstanding academic background");
  if (s.length === 0) s.push("Solid foundational profile");
  return s;
}

function getRisks(skillScore: number, expScore: number, atsScore: number): string[] {
  const r: string[] = [];
  if (skillScore < 60) r.push("Significant skill gaps detected");
  if (expScore < 60) r.push("Below required experience level");
  if (atsScore < 60) r.push("Low ATS resume quality score");
  if (r.length === 0) r.push("No significant risks identified");
  return r;
}

// Main: Rank all applicants for a specific job
export function rankCandidatesForJob(jobId: string): CandidateScore[] {
  const db = getDatabase();
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return [];
  const company = db.companies.find(c => c.id === job.companyId);
  const applicants = db.applicants.filter(a => a.jobId === jobId);

  const scored = applicants.map(app => {
    const skillScore = computeSkillScore(app.skills, job.skills);
    const experienceScore = computeExperienceScore(app.experienceYears, job.experience);
    const educationScore = computeEducationScore(app.education);
    const atsScore = app.atsScore;
    const cultureFitScore = computeCultureFit(app.skills, company?.industry || "");
    const overallScore = Math.round(
      skillScore * WEIGHTS.skills + experienceScore * WEIGHTS.experience +
      educationScore * WEIGHTS.education + atsScore * WEIGHTS.ats +
      cultureFitScore * WEIGHTS.culture
    );
    return {
      applicantId: app.id, candidateName: app.candidateName, overallScore,
      skillScore, experienceScore, educationScore, atsScore, cultureFitScore,
      recommendation: getRecommendation(overallScore),
      strengths: getStrengths(skillScore, experienceScore, educationScore),
      risks: getRisks(skillScore, experienceScore, atsScore),
      rank: 0,
    };
  });

  scored.sort((a, b) => b.overallScore - a.overallScore);
  scored.forEach((s, i) => { s.rank = i + 1; });
  return scored;
}

// Recommend jobs for a candidate profile
export function recommendJobsForCandidate(candidateSkills: string[], expYears: number, education: string): JobRecommendation[] {
  const db = getDatabase();
  const recs = db.jobs.filter(j => !j.isFake).map(job => {
    const company = db.companies.find(c => c.id === job.companyId);
    const cLower = candidateSkills.map(s => s.toLowerCase());
    const matchedSkills = job.skills.filter(s => cLower.some(c => c.includes(s.toLowerCase()) || s.toLowerCase().includes(c)));
    const missingSkills = job.skills.filter(s => !cLower.some(c => c.includes(s.toLowerCase()) || s.toLowerCase().includes(c)));
    const skillScore = job.skills.length > 0 ? (matchedSkills.length / job.skills.length) * 100 : 60;
    const expScore = computeExperienceScore(expYears, job.experience);
    const eduScore = computeEducationScore(education);
    const matchScore = Math.round(skillScore * 0.45 + expScore * 0.35 + eduScore * 0.20);

    let reasoning = "";
    if (matchScore >= 85) reasoning = "Excellent fit — your skills and experience align perfectly.";
    else if (matchScore >= 70) reasoning = "Good fit — minor gaps could be bridged with focused upskilling.";
    else if (matchScore >= 50) reasoning = "Moderate fit — consider expanding key technical skills.";
    else reasoning = "Stretch role — significant skill development needed.";

    return {
      jobId: job.id, jobTitle: job.title, companyName: company?.name || "Unknown",
      matchScore, matchedSkills, missingSkills,
      salaryFit: job.salary, reasoning,
    };
  });
  recs.sort((a, b) => b.matchScore - a.matchScore);
  return recs;
}

// Hiring suggestions summary for employer overview
export function getHiringSuggestions(): Array<{ jobTitle: string; jobId: string; topCandidate: string; score: number; recommendation: string }> {
  const db = getDatabase();
  return db.jobs.filter(j => !j.isFake).map(job => {
    const ranked = rankCandidatesForJob(job.id);
    const top = ranked[0];
    return {
      jobTitle: job.title, jobId: job.id,
      topCandidate: top?.candidateName || "No applicants",
      score: top?.overallScore || 0,
      recommendation: top?.recommendation || "N/A",
    };
  }).filter(s => s.score > 0);
}
