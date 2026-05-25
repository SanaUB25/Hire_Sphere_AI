"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, Search, Bell, Settings, FileText, Target, 
  Sparkles, Building2, MapPin, Briefcase, Zap, LogOut, 
  User, GraduationCap, Link2, Globe, Upload, 
  AlertCircle, CheckCircle, ChevronRight, Play, MessageSquare, 
  Clock, ArrowUpRight, DollarSign, BriefcaseIcon, Filter,
  Star, Mail, Sun, Moon, Send, ArrowRight, RefreshCw, BookmarkCheck, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AIChatbot from "@/components/AIChatbot";
import { useAuth } from "@/lib/auth-context";
import { generateRoadmapAI, generateJobRecommendationReasoningAI, generateBookmarkInsightAI, generateTrackerNextStepsAI } from "@/app/actions/ai-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { 
  getDatabase, 
  postJob, 
  HireSphereDB, 
  Job, 
  Applicant,
  calculateFraudProbability
} from "@/lib/db";

// Helper hook for debouncing search inputs
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [db, setDb] = useState<HireSphereDB | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "analyzer" | "jobs" | "bookmarks" | "tracker" | "interview" | "chat" | "emails" | "roadmap" | "comparison"
  >("overview");
  
  // Theme state: dark (Midnight Cyberpunk) vs light (Light Cyberpunk)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Auth context for route guarding
  const { user, loading: authLoading, logout } = useAuth();

  // Security Route Guard check
  useEffect(() => {
    if (authLoading) return;
    if (!user?.isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user.role === "employer") {
      router.push("/dashboard/employer");
    } else if (user.role === "admin") {
      router.push("/dashboard/admin");
    }
  }, [user, authLoading, router]);

  // State synchronization listener
  useEffect(() => {
    setDb(getDatabase());

    const handleDbChange = () => {
      setDb(getDatabase());
    };
    window.addEventListener("hiresphere_db_change", handleDbChange);
    return () => {
      window.removeEventListener("hiresphere_db_change", handleDbChange);
    };
  }, []);

  // Profile Builder State
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    skills: "React, TypeScript, Next.js, CSS, HTML5, TailwindCSS, Git",
    experience: "3 Years as Frontend Engineer at TechCorp",
    education: "B.S. in Computer Science - Stanford University",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    portfolio: "alexjohnson.dev",
    bio: "Passionate frontend developer focused on crafting beautiful, highly performant web applications with outstanding user experiences."
  });

  // Dynamic AI Resume Analyzer States
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedProfile, setAnalyzedProfile] = useState<typeof profile | null>(null);
  const [dynamicAtsScore, setDynamicAtsScore] = useState(87);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [improvementsList, setImprovementsList] = useState<string[]>([]);

  // NEW Hackathon Feature States
  // 1. AI Career Roadmap Generator
  const [roadmapDreamJob, setRoadmapDreamJob] = useState("");
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState<{
    role: string;
    skills: string[];
    phases: Array<{ title: string; duration: string; details: string[]; courses: string[] }>;
  } | null>(null);

  // 2. AI Resume vs Job Comparison
  const [compJobId, setCompJobId] = useState("");
  const [compCustomTitle, setCompCustomTitle] = useState("");
  const [compCustomDesc, setCompCustomDesc] = useState("");
  const [comparingResume, setComparingResume] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    experienceRating: number;
    skillsRating: number;
    academicRating: number;
    feedback: string[];
  } | null>(null);

  // 3. Voice-Based AI Interview Simulation
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceInterviewerState, setVoiceInterviewerState] = useState<"idle" | "speaking" | "listening" | "analyzing">("idle");
  const [voiceCurrentQuestionIdx, setVoiceCurrentQuestionIdx] = useState(0);
  const [voiceCritique, setVoiceCritique] = useState<{
    overallGrade: string;
    clarityScore: number;
    deliveryPace: number;
    technicalSubstance: number;
    recs: string[];
  } | null>(null);

  const voiceQuestions = [
    "Tell me about a complex async layout bug you solved in React. What was the impact?",
    "How do you design a database schema to support real-time chat with rapid writes? What is your scaling strategy?",
    "Why is security essential in web applications, and what measures do you take to secure Supabase/PostgreSQL RLS pools?"
  ];

  // Job Search / Debouncing states
  const [rawSearchQuery, setRawSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(rawSearchQuery, 400); // 400ms debounce
  const [isSearching, setIsSearching] = useState(false);

  // Filter criteria
  const [filterRemote, setFilterRemote] = useState<boolean | null>(null);
  const [filterExperience, setFilterExperience] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Pagination & Infinite scroll
  const [visibleJobsCount, setVisibleJobsCount] = useState(3);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const applicationsPerPage = 3;

  // Bookmarks (Saved Jobs) State
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkInsights, setBookmarkInsights] = useState<Record<string, string>>({});
  const [trackerInsights, setTrackerInsights] = useState<Record<string, string>>({});

  // Toast alert system
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  // Mock Recruiter Chat State
  const [activeChatRecruiter, setActiveChatRecruiter] = useState<"sarah" | "david">("sarah");
  const [chatInput, setChatInput] = useState("");
  const [chatThreads, setChatThreads] = useState({
    sarah: [
      { sender: "recruiter", text: "Hi Alex! I reviewed your 98% AI Match score for our Senior Frontend position at Stripe. Your Next.js portfolio looks fantastic!", time: "10:15 AM" },
      { sender: "candidate", text: "Hi Sarah! Thank you, I am really excited about Stripe's developer dashboard products.", time: "10:20 AM" },
      { sender: "recruiter", text: "Awesome. I've sent you a formal invitation to schedule a live technical assessment. Let me know if the time slots in your tracker tab work!", time: "10:22 AM" }
    ],
    david: [
      { sender: "recruiter", text: "Hey Alex, David here from Vercel. We saw your Full Stack developer match profile. Do you have any experience with edge middleware?", time: "Yesterday" }
    ]
  });

  // Mock Transactions Email Hub State
  const [activeEmailId, setActiveEmailId] = useState<string>("em-1");
  const [emails, setEmails] = useState([
    {
      id: "em-1",
      sender: "Stripe Talent Acquisition",
      email: "recruiting@stripe.com",
      subject: "Invitation: Technical Screen & Live Assessment - Stripe",
      date: "May 17, 2026",
      body: `Hi Alex Johnson,

We are thrilled to invite you to the next step of our evaluation pipeline for the Senior Frontend Engineer role! 

Our AI Screen Matcher evaluated your Stanford CS background and React/TypeScript skills at a 98% compatibility rate, which represents an elite cohort match.

Please log in to your dashboard to confirm your scheduled interview time. We look forward to meeting you!

Best regards,
Stripe Recruiting Team`,
      read: false
    },
    {
      id: "em-2",
      sender: "Vercel System Team",
      email: "careers@vercel.com",
      subject: "Application Status Update: Full Stack Developer - Vercel",
      date: "May 16, 2026",
      body: `Hey Alex,

Thanks for submitting your application to Vercel via HireSphere! 

Your profile is currently under review by our core platform engineering team. We will notify you instantly via real-time alerts once your interview assessment window is active.

Best,
Vercel Engineering Team`,
      read: true
    }
  ]);

  // Interview prep states
  const [prepRole, setPrepRole] = useState("React & Frontend Developer");
  const [prepQuestions, setPrepQuestions] = useState<{ hr: string[]; technical: string[] } | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "system" | "user" | "ai_eval"; text: string }>>([
    { role: "system", text: "Hello! I am your AI Interview Prep Assistant. Let's practice. What is your understanding of React's Virtual DOM, and why is it useful?" }
  ]);

  // Loading skeleton simulation on search debouncing
  useEffect(() => {
    if (rawSearchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [rawSearchQuery, debouncedSearchQuery]);

  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-cyan-500 animate-spin" />
          <p className="text-gray-400 font-mono text-sm tracking-widest">CONNECTING TO HIRESPHERE CORE...</p>
        </div>
      </div>
    );
  }

  // 1. AI Career Roadmap Generator Logic
  const handleGenerateRoadmap = async () => {
    if (!roadmapDreamJob.trim()) {
      showToast("Please specify your dream target job role first!", "error");
      return;
    }
    setGeneratingRoadmap(true);
    try {
      const targetRole = roadmapDreamJob.trim();
      const candSkills = profile.skills.split(",").map(s => s.trim());
      const aiData = await generateRoadmapAI(targetRole, candSkills);
      
      setRoadmapData({
        role: targetRole,
        skills: aiData.skills || ["Core Skill 1", "Core Skill 2"],
        phases: aiData.phases || []
      });
      showToast(`AI Career Roadmap generated for "${targetRole}"!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate AI roadmap. Ensure Gemini API key is configured.", "error");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  // 2. AI Resume vs Job Comparison Logic
  const handleCompareResume = () => {
    if (!compJobId && (!compCustomTitle.trim() || !compCustomDesc.trim())) {
      showToast("Please choose an open job, or paste a custom title/description!", "error");
      return;
    }

    setComparingResume(true);
    setTimeout(() => {
      let jobTitle = compCustomTitle;
      let reqSkills = ["React", "TypeScript", "PostgreSQL", "TailwindCSS"];

      if (compJobId) {
        const selected = db.jobs.find(j => j.id === compJobId);
        if (selected) {
          jobTitle = selected.title;
          reqSkills = selected.skills;
        }
      }

      const candSkills = profile.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const matched = reqSkills.filter(s => candSkills.includes(s.toLowerCase()));
      const missing = reqSkills.filter(s => !candSkills.includes(s.toLowerCase()));

      const matchedScoreBase = reqSkills.length > 0 ? (matched.length / reqSkills.length) * 40 : 25;
      const parsedAtsScore = Math.min(Math.round(matchedScoreBase + 55 + Math.random() * 8), 100);

      setComparisonResult({
        score: parsedAtsScore,
        matchedSkills: matched,
        missingSkills: missing,
        experienceRating: Math.round(75 + Math.random() * 20),
        skillsRating: Math.round((matched.length / Math.max(reqSkills.length, 1)) * 100),
        academicRating: profile.education.includes("Stanford") || profile.education.includes("MIT") ? 98 : 80,
        feedback: [
          matched.length > 0 
            ? `Excellent key keyword matches for: ${matched.join(", ")}.` 
            : "No exact structural skill keywords matched candidate profile.",
          missing.length > 0
            ? `Inject missing keyword tags: ${missing.join(", ")} to boost ATS semantic parsing compatibility.`
            : "Perfect alignment on all requested software technologies.",
          "Elaborate on quantitative business impacts in tenure descriptions (e.g. 'reduced latency by 35%')."
        ]
      });

      setComparingResume(false);
      showToast(`Comparison complete for "${jobTitle}"!`, "success");
    }, 1200);
  };

  // 3. Voice AI Prep Assistant vocal triggers
  const handleToggleVoiceSimulation = () => {
    if (voiceActive) {
      setVoiceActive(false);
      setVoiceInterviewerState("idle");
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      showToast("Voice simulation practice room closed.", "info");
    } else {
      setVoiceActive(true);
      setVoiceCritique(null);
      setVoiceTranscript("Connecting vocal telemetry... Click Speak Question to begin!");
      setVoiceCurrentQuestionIdx(0);
      setVoiceInterviewerState("idle");
      showToast("Voice AI practice room connected!", "success");
    }
  };

  const handleSpeakQuestion = () => {
    const questionText = voiceQuestions[voiceCurrentQuestionIdx];
    setVoiceTranscript("Interviewer is speaking. Listen carefully...");
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      utterance.onstart = () => {
        setVoiceInterviewerState("speaking");
      };
      utterance.onend = () => {
        setVoiceInterviewerState("listening");
        handleCaptureVoiceResponse();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceInterviewerState("speaking");
      setTimeout(() => {
        setVoiceInterviewerState("listening");
        handleCaptureVoiceResponse();
      }, 3000);
    }
  };

  const handleCaptureVoiceResponse = () => {
    setVoiceTranscript("Listening to your voice... Speak now!");
    
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognition.onstart = () => {
          setVoiceInterviewerState("listening");
        };
        
        recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
          const resultText = event.results[0][0].transcript;
          setVoiceTranscript(resultText);
        };
        
        recognition.onerror = () => {
          setVoiceTranscript("Typing simulated answer: In my previous architecture roles, I established sub-second hydration boundaries using next-generation server actions and strict layout boundaries...");
        };
        
        recognition.onend = () => {
          setVoiceInterviewerState("analyzing");
          handleSimulateVoiceAnalysis();
        };
        
        recognition.start();
      } else {
        let count = 0;
        const mockResponses = [
          "In my previous project at TechCorp, I engineered a high-throughput React context caching model that eliminated redundant re-renders. I also established sub-second hydration boundaries using next-generation server actions...",
          "To scale database rapid writes for real-time channels, I configure partitioned PostgreSQL schemas and layer a Redis cache cluster. We use connection pools and WebSockets to route payload broadcasts instantly.",
          "Security is paramount. In Supabase deployments, I write strict Row-Level Security policies ensuring users can only read or mutate their verified records, authenticated via checked JWT tokens."
        ];
        const activeMockText = mockResponses[voiceCurrentQuestionIdx] || mockResponses[0];
        
        const typingTimer = setInterval(() => {
          setVoiceTranscript(activeMockText.slice(0, count * 3));
          count++;
          if (count * 3 >= activeMockText.length) {
            clearInterval(typingTimer);
            setVoiceInterviewerState("analyzing");
            handleSimulateVoiceAnalysis();
          }
        }, 30);
      }
    }
  };

  const handleSimulateVoiceAnalysis = () => {
    setTimeout(() => {
      if (voiceCurrentQuestionIdx < voiceQuestions.length - 1) {
        setVoiceCurrentQuestionIdx(p => p + 1);
        setVoiceInterviewerState("idle");
        showToast("Round complete! Moving to next mock question.", "success");
      } else {
        setVoiceCritique({
          overallGrade: "A-",
          clarityScore: 92,
          deliveryPace: 88,
          technicalSubstance: 94,
          recs: [
            "Technical details are robust and quantitative.",
            "Pacing was stable. Try incorporating shorter sentences for improved client delivery.",
            "Excellent articulation of RLS and indexing constraints."
          ]
        });
        setVoiceActive(false);
        setVoiceInterviewerState("idle");
        showToast("Voice Simulation completed! Final critique scorecard ready.", "success");
      }
    }, 1500);
  };

  // Identify jobs that candidate is eligible for
  const companyJobs = db.jobs;
  const companyApplicants = db.applicants.filter(a => a.candidateEmail === "candidate@hiresphere.ai");

  // Dynamic Job Match Engine (Jaccard Index matching between Candidate Profile skills and Job Required skills)
  const calculateMatch = (jobSkills: string[]) => {
    const candidateSkills = profile.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const requiredSkills = jobSkills.map(s => s.toLowerCase());
    
    if (candidateSkills.length === 0 || requiredSkills.length === 0) return 60; // Base score
    
    const intersection = candidateSkills.filter(s => requiredSkills.includes(s));
    const union = Array.from(new Set([...candidateSkills, ...requiredSkills]));
    
    // Similarity ratio + offset base
    const similarity = intersection.length / union.length;
    const computed = Math.round(similarity * 40) + 60; // Scale 60-100%
    return Math.min(computed, 100);
  };

  // Dispatch visual Toast Notifications
  const showToast = (message: string, type: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Bookmark toggler
  const handleToggleBookmark = (jobId: string, jobTitle: string) => {
    setBookmarks(prev => {
      const exists = prev.includes(jobId);
      if (exists) {
        showToast(`Removed bookmark: "${jobTitle}"`, "info");
        return prev.filter(id => id !== jobId);
      } else {
        showToast(`Bookmarked position: "${jobTitle}"! Generating AI prep insight...`, "success");
        // Fetch AI insight in background
        const job = db?.jobs.find(j => j.id === jobId);
        if (job) {
          generateBookmarkInsightAI(job.title, job.skills).then(insight => {
            setBookmarkInsights(curr => ({ ...curr, [jobId]: insight }));
          }).catch(err => console.error("Error generating insight", err));
        }
        return [...prev, jobId];
      }
    });
  };

  // dynamic profile resume parsing
  const handleResumeUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzedProfile(profile);

      // Compute dynamic variables based on their typed profile skills!
      const skillsArray = profile.skills.split(",").map(s => s.trim());
      const lowerSkills = skillsArray.map(s => s.toLowerCase());
      
      const missing = [];
      const improvements = [];
      let score = 75;

      if (!lowerSkills.includes("next.js")) { missing.push("Next.js App Router"); } else { score += 5; }
      if (!lowerSkills.includes("typescript")) { missing.push("TypeScript Core Type Definitions"); } else { score += 5; }
      if (!lowerSkills.includes("redux") && !lowerSkills.includes("zustand")) { missing.push("State Management (Zustand/Redux)"); } else { score += 5; }
      if (!lowerSkills.includes("jest") && !lowerSkills.includes("testing")) { missing.push("Automated Testing (Jest/Cypress)"); } else { score += 5; }
      if (missing.length === 0) missing.push("Serverless edge caching", "Accessibility (a11y)");
      
      if (profile.experience.toLowerCase().includes("junior")) {
        improvements.push("Shift tone to highlight project leadership roles and cross-functional metrics.");
        score -= 5;
      } else {
        improvements.push("Include specific metric outcomes (e.g. 'boosted web core vitals score by 35%').");
        score += 8;
      }

      improvements.push("Highlight modular architecture patterns (like component isolation or utility hooks).");
      improvements.push("Add concrete portfolio links next to major roles to verify coding credentials.");

      setDynamicAtsScore(Math.min(score, 99));
      setMissingKeywords(missing);
      setImprovementsList(improvements);
      showToast("AI Analyzer processed resume against system benchmarks!", "success");
    }, 2000);
  };

  // Optimistic job application
  const handleApplyOptimistic = (job: Job) => {
    const alreadyApplied = companyApplicants.some(a => a.jobId === job.id);
    if (alreadyApplied) {
      showToast("You have already submitted an application for this role!", "error");
      return;
    }

    // Optimistic UI updates: append application to local list immediately
    const computedMatch = calculateMatch(job.skills);
    
    // Inject mock application into HireSphere DB
    const mockApp: Applicant = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      candidateName: profile.name,
      candidateEmail: "candidate@hiresphere.ai",
      candidatePhone: "+1-555-901-4432",
      avatarColor: "bg-cyan-500",
      status: "Applied",
      appliedAt: new Date().toISOString(),
      matchScore: computedMatch,
      resumeQuality: Math.round(Math.random() * 20) + 75,
      skillMatch: Math.round(Math.random() * 20) + 75,
      experienceScore: Math.round(Math.random() * 20) + 75,
      atsScore: Math.round(Math.random() * 20) + 75,
      resumeSummary: profile.bio,
      skills: profile.skills.split(",").map(s => s.trim()),
      experienceYears: parseInt(profile.experience) || 3,
      education: profile.education,
      atsFeedback: [
        "Strong fundamental skill alignment.",
        "Include business impact statistics to further secure priority standing."
      ]
    };

    // Save mock record in localStorage DB
    db.applicants.unshift(mockApp);
    localStorage.setItem("hiresphere_mock_db", JSON.stringify(db));
    
    // Dispatch system change event to synchronize dashboards
    window.dispatchEvent(new Event("hiresphere_db_change"));
    
    showToast(`Optimistic UI: Successfully applied to "${job.title}"!`, "success");
    setSelectedJob(null);
    setActiveTab("tracker");
  };

  // Real-time Chat Responder simulation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    const recruiter = activeChatRecruiter;
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setChatThreads(prev => ({
      ...prev,
      [recruiter]: [...prev[recruiter], { sender: "candidate", text: userMessage, time: timeNow }]
    }));
    setChatInput("");

    // Simulated instant intelligent response from mock recruiter
    setTimeout(() => {
      let reply = "Got it! Thanks for the info, let me sync with our engineering director and get back to you shortly.";
      if (recruiter === "sarah") {
        reply = "Perfect explanation! I love that you focused on Next.js performance optimizations. Let's schedule our 30-minute technical video call.";
      } else if (recruiter === "david") {
        reply = "That makes sense. Vercel utilizes serverless frameworks heavily, so edge middleware experience is highly valued. I will trigger a coderpad screen link for you!";
      }

      setChatThreads(prev => ({
        ...prev,
        [recruiter]: [...prev[recruiter], { sender: "recruiter", text: reply, time: timeNow }]
      }));
      showToast(`New chat message from ${recruiter === 'sarah' ? 'Sarah (Stripe)' : 'David (Vercel)'}!`, "info");
    }, 1500);
  };
  // Filter Jobs List
  const filteredJobs = companyJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
      db.companies.find(c => c.id === job.companyId)?.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    
    const matchesRemote = filterRemote === null || job.remote === filterRemote;
    const matchesExp = filterExperience === "all" || job.experience.toLowerCase().includes(filterExperience.toLowerCase());
    
    return matchesSearch && matchesRemote && matchesExp;
  });

  // Pagination for application tracker
  const totalApplicationPages = Math.ceil(companyApplicants.length / applicationsPerPage);
  const paginatedApplicants = companyApplicants.slice(
    (applicationsPage - 1) * applicationsPerPage,
    applicationsPage * applicationsPerPage
  );

  // ----------------------------------------------------
  // DYNAMIC CAREER PATHS & SKILL GAP ALGORITHMS
  // ----------------------------------------------------
  
  // A. AI Career Suggestions Array
  const careerSuggestions = [
    { title: "Senior Frontend Engineer", salary: "$160k - $210k", fit: "98% Fit", desc: "Your background in Stanford CS and strong React expertise aligns perfectly with design systems and dashboard teams at Stripe or Spotify.", roadmap: "Learn: System design, Webpack internals, and next-gen CSS systems." },
    { title: "Full Stack Engineer", salary: "$150k - $190k", fit: "91% Fit", desc: "Given your Next.js and Git skills, transitioning into Full-Stack cloud roles (Vercel, Linear) is highly viable.", roadmap: "Learn: Serverless APIs, Edge database adapters (Prisma, PostgreSQL), and Redis cache layers." },
    { title: "Engineering Manager (Tech Lead)", salary: "$180k - $230k", fit: "84% Fit", desc: "Your experience tenure makes lead tracks viable if you expand leadership competencies.", roadmap: "Learn: High-scale system design, scrum metrics, and product management basics." }
  ];

  // B. AI Skill Gap Detection Logic
  // Extracts all skills listed in the system and compares against candidate profile
  const allSystemSkills = Array.from(new Set(companyJobs.flatMap(j => j.skills)));
  const candidateSkills = profile.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const missingSkillsGap = allSystemSkills
    .filter(s => !candidateSkills.includes(s.toLowerCase()))
    .slice(0, 5); // Display top 5

  return (
    <div className={`min-h-screen transition-colors duration-300 flex relative overflow-hidden ${
      theme === "dark" 
        ? "bg-black text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Dynamic Cyberpunk background glows */}
      {theme === "dark" ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-200/40 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-200/40 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Floating System Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-xl ${
                theme === "dark" 
                  ? "border-cyan-500/20 bg-black/80 text-white" 
                  : "border-cyan-200 bg-white/95 text-slate-800"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mt-0.5 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-xs font-semibold">{t.message}</div>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-gray-400 hover:text-gray-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r p-6 flex flex-col hidden md:flex shrink-0 relative z-20 ${
        theme === "dark" 
          ? "border-white/10 bg-black/50" 
          : "border-slate-200 bg-white/40"
      }`}>
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center shadow-md">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HireSphere<span className="text-cyan-500 font-mono">.ai</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: Target, color: "text-cyan-400" },
            { id: "profile", label: "Profile Builder", icon: User, color: "text-blue-400" },
            { id: "roadmap", label: "AI Career Roadmap", icon: BrainCircuit, color: "text-indigo-400" },
            { id: "comparison", label: "AI Resume vs Job", icon: ArrowUpRight, color: "text-cyan-400" },
            { id: "analyzer", label: "AI Resume Analyzer", icon: FileText, color: "text-purple-400" },
            { id: "jobs", label: "Job Recommendations", icon: Search, color: "text-emerald-400" },
            { id: "bookmarks", label: "Bookmarked Jobs", icon: Star, color: "text-amber-400" },
            { id: "tracker", label: "Application Tracker", icon: Clock, color: "text-pink-400" },
            { id: "interview", label: "AI Voice Interview", icon: Sparkles, color: "text-purple-400" },
            { id: "chat", label: "Recruiter Chats", icon: MessageSquare, color: "text-cyan-400" },
            { id: "emails", label: "Ecosystem Inbox", icon: Mail, color: "text-pink-400" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setSelectedJob(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected 
                    ? theme === "dark"
                      ? "bg-white/10 text-white shadow-inner border border-white/5"
                      : "bg-slate-200/60 text-slate-900 shadow-sm border border-slate-300/40"
                    : "text-gray-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
                {tab.id === 'bookmarks' && bookmarks.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.2 bg-amber-500/20 text-amber-500 text-[9px] font-bold rounded">
                    {bookmarks.length}
                  </span>
                )}
                {tab.id === 'emails' && emails.some(em => !em.read) && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t dark:border-white/10 border-slate-200 space-y-2">
          <button onClick={async () => { await logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Topbar navigation */}
        <header className={`h-20 border-b px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${
          theme === "dark" 
            ? "border-white/10 bg-black/40" 
            : "border-slate-200 bg-white/40"
        }`}>
          <div>
            <h1 className="text-lg font-bold">{profile.name}</h1>
            <p className="text-xs text-gray-500">Talent Candidate Portal</p>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Cyberpunk Theme Toggler */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                showToast(`Switched to ${theme === 'dark' ? 'Light Cyberpunk' : 'Dark Cyberpunk'} mode!`, "info");
              }}
              className={`h-8 w-8 border-0 ${
                theme === "dark" ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-slate-200 text-purple-700 hover:bg-slate-300"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <button 
              onClick={() => setActiveTab("emails")}
              className="text-gray-400 hover:text-white relative cursor-pointer"
            >
              <Mail className="w-4 h-4 text-gray-500" />
              {emails.some(em => !em.read) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500" />
              )}
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-cyan-500/20 select-none">
              AJ
            </div>
          </div>
        </header>

        {/* Dashboard Tab Panels */}
        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              
              {/* Profile welcome board */}
              <div className={`rounded-2xl border p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden ${
                theme === "dark" 
                  ? "bg-gradient-to-r from-cyan-950/20 to-purple-950/10 border-cyan-500/20 text-white" 
                  : "bg-gradient-to-r from-cyan-100/40 to-purple-100/30 border-cyan-200 text-slate-800"
              }`}>
                <div className="relative z-10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">ATS Ecosystem Match Profile</span>
                  <h2 className="text-2xl font-bold tracking-tight">AI Talent Engine Active.</h2>
                  <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                    Welcome back, Alex. Your profile matches **12 active roles** in the ecosystem. Upload your resume file to obtain ATS feedback, study candidate skill gaps, and explore interactive AI career suggests.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab("analyzer")} 
                  className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-lg shadow-cyan-500/20 border-0"
                >
                  Analyze Resume File
                </Button>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "AI ATS Match Score", value: `${dynamicAtsScore}%`, status: "High Priority Rank", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "Matched Positions", value: `${filteredJobs.length} Active`, status: "Dynamic Match", color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "Scheduled Interviews", value: `${companyApplicants.filter(a => a.status === "Interview Scheduled").length} Active`, status: "Schedule Ready", color: "text-pink-400", bg: "bg-pink-500/10" }
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-white/[0.02] dark:border-white/10 border-slate-200 shadow-md">
                    <CardContent className="p-6">
                      <span className="text-xs text-gray-500 block mb-1 font-semibold">{stat.label}</span>
                      <div className="text-3xl font-extrabold text-white flex items-baseline gap-2 mb-1">
                        <span className={stat.color}>{stat.value}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.status}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* AI Skill Gap Detection Card */}
                <Card className="lg:col-span-6 bg-white/[0.02] dark:border-white/10 border-slate-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> AI Skill Gap Detection
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Real-time keyword analysis comparing your profile against active jobs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {missingSkillsGap.length === 0 ? (
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> All tech skill gaps resolved! You have a 100% keyword score.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Identified Skill Gaps:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {missingSkillsGap.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono">
                                ✖ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[11px] leading-relaxed text-gray-400 space-y-1">
                          <span className="font-bold text-cyan-400 block">💡 Learning Recommendation:</span>
                          We recommend taking interactive developer sandboxes on **Next.js Server Actions** and **Advanced TypeScript Patterns** to immediately lift match scoring by +12%.
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* AI Career Suggestions Card */}
                <Card className="lg:col-span-6 bg-white/[0.02] dark:border-white/10 border-slate-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Career Suggestions
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Dynamic long-term roadmap computed from active resume profiles.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {careerSuggestions.slice(0, 2).map((s, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{s.title}</span>
                            <span className="px-2 py-0.2 rounded bg-purple-500/15 border border-purple-500/20 text-[9px] font-bold text-purple-400 font-mono">{s.fit}</span>
                          </div>
                          <p className="text-[10.5px] text-gray-400 leading-normal">{s.desc}</p>
                          <span className="text-[9.5px] font-mono text-gray-500 block">{s.roadmap}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}

          {/* TAB 2: PROFILE BUILDER */}
          {activeTab === "profile" && (
            <Card className="bg-white/[0.02] dark:border-white/10 border-slate-200 shadow-2xl max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Profile Credentials Builder
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Update your tech profile. Changes instantly adjust dynamic AI job matching filters and ATS scoring logs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); showToast("Profile variables saved successfully!", "success"); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cName" className="text-xs font-semibold text-gray-300">Name</Label>
                      <Input 
                        id="cName"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cWeb" className="text-xs font-semibold text-gray-300">Portfolio URL</Label>
                      <Input 
                        id="cWeb"
                        value={profile.portfolio}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cLi" className="text-xs font-semibold text-gray-300">LinkedIn Username</Label>
                      <Input 
                        id="cLi"
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cGt" className="text-xs font-semibold text-gray-300">GitHub Profile</Label>
                      <Input 
                        id="cGt"
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cSkills" className="text-xs font-semibold text-gray-300">Skills (Comma-separated)</Label>
                      <span className="text-[10px] text-gray-500">Triggers AI Job Match re-indexing</span>
                    </div>
                    <Input 
                      id="cSkills"
                      value={profile.skills}
                      onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                      placeholder="React, TypeScript, Next.js"
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 font-mono text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cExp" className="text-xs font-semibold text-gray-300">Experience Statement</Label>
                      <Input 
                        id="cExp"
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cEdu" className="text-xs font-semibold text-gray-300">Education Background</Label>
                      <Input 
                        id="cEdu"
                        value={profile.education}
                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cBio" className="text-xs font-semibold text-gray-300">Professional Summary Bio</Label>
                    <textarea 
                      id="cBio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                    <Button 
                      type="submit" 
                      className="bg-cyan-600 hover:bg-cyan-500 text-white h-10 px-6 border-0 shadow-lg shadow-cyan-500/25"
                    >
                      Save Profile Variables
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: DYNAMIC AI RESUME ANALYZER */}
          {activeTab === "analyzer" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Dynamic AI Resume Analyzer
                </h2>
                <p className="text-xs text-gray-500">Upload your PDF resume. Our AI automatically extracts text keywords, parses ATS benchmarks, and computes a score.</p>
              </div>

              {!analyzedProfile && !analyzing && (
                <div className="border border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-all relative">
                  <input type="file" onChange={handleResumeUploadSimulate} accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold mb-2">Simulate Resume File Upload</h3>
                  <p className="text-xs text-gray-500 mb-6 text-center max-w-sm">Drag and drop your PDF resume. We will analyze your active profile skills immediately.</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-lg">Upload PDF File</Button>
                </div>
              )}

              {analyzing && (
                <div className="border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center bg-white/[0.01] min-h-[300px]">
                  <div className="relative w-14 h-14 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-base font-bold mb-2 animate-pulse">Running AI Semantic Engine...</h3>
                  <p className="text-xs text-gray-500 text-center max-w-sm">Computing Jaccard keyword overlaps, checking system templates, and scoring index tables.</p>
                </div>
              )}

              {analyzedProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {/* Circle score meter */}
                  <Card className="bg-white/[0.02] border-white/10 p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-6">Dynamic ATS Score</span>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle cx="72" cy="72" r="62" stroke="#06b6d4" strokeWidth="8" fill="transparent" strokeDasharray={390} strokeDashoffset={390 - (390 * dynamicAtsScore) / 100} className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-white">{dynamicAtsScore}%</span>
                        <span className="text-[9px] text-cyan-400 font-bold tracking-widest uppercase">ATS Score</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-center"><CheckCircle className="w-4 h-4 text-emerald-400" /> Parsed Successfully</div>
                      <span className="text-[10px] text-gray-500">Ready for priority recruiter screening pipelines.</span>
                    </div>
                    <Button 
                      onClick={() => setAnalyzedProfile(null)}
                      className="mt-6 bg-white/5 border border-white/10 text-xs h-8 px-4 text-gray-400 hover:text-white"
                    >
                      Re-Analyze Resume
                    </Button>
                  </Card>

                  {/* Missing keywords / Improvements details */}
                  <div className="md:col-span-2 space-y-6">
                    <Card className="bg-white/[0.02] border-white/10">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Missing Keywords Detected
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">Integrate these tech keywords into your bio text to boost dynamic recruiter parsing scores.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((kw) => (
                          <span key={kw} className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/25 text-[10.5px] text-red-400 font-mono">
                            ✖ {kw}
                          </span>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/[0.02] border-white/10">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-cyan-400">AI Structural Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {improvementsList.map((imp, idx) => (
                          <div key={idx} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                            <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                            <span>{imp}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 4: JOB DISCOVERY & AI MATCHING */}
          {activeTab === "jobs" && !selectedJob && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold">Discovery Feed &amp; Job Matching</h2>
                <p className="text-xs text-gray-500">Discover live openings. Match scores calculate dynamically against your profile skills.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Search query Filters sidebar */}
                <div className="lg:col-span-4">
                  <Card className="bg-white/[0.02] border-white/10 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Filter className="w-4 h-4 text-cyan-400" /> Filter Discovery Feed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      
                      {/* Debounced Search keyword input */}
                      <div className="space-y-2">
                        <Label htmlFor="search" className="text-xs text-gray-400">Search Job Keywords</Label>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <Input 
                            id="search"
                            value={rawSearchQuery}
                            onChange={(e) => setRawSearchQuery(e.target.value)}
                            placeholder="Type title, skill, company..." 
                            className="bg-white/5 border-white/10 pl-9 text-xs text-white focus-visible:ring-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Remote preferences */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-400">Workplace preference</Label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setFilterRemote(filterRemote === true ? null : true)}
                            className={`flex-1 h-8 text-xs border border-white/10 bg-transparent hover:bg-white/5 ${filterRemote === true ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" : "text-gray-400"}`}
                          >
                            Remote Only
                          </Button>
                          <Button 
                            onClick={() => setFilterRemote(filterRemote === false ? null : false)}
                            className={`flex-1 h-8 text-xs border border-white/10 bg-transparent hover:bg-white/5 ${filterRemote === false ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" : "text-gray-400"}`}
                          >
                            On-site
                          </Button>
                        </div>
                      </div>

                      {/* Experience levels selection */}
                      <div className="space-y-2">
                        <Label htmlFor="expSel" className="text-xs text-gray-400">Experience Threshold</Label>
                        <select 
                          id="expSel"
                          value={filterExperience}
                          onChange={(e) => setFilterExperience(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="all">All Experience Levels</option>
                          <option value="junior">Junior (1-2 years)</option>
                          <option value="mid">Mid-Level (3-4 years)</option>
                          <option value="senior">Senior (5+ years)</option>
                          <option value="lead">Lead / Principal</option>
                        </select>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* Main Discovery feed list */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* SKELETON LOADING LOOPS (triggers for 400ms when typing debounced terms!) */}
                  {isSearching ? (
                    <div className="space-y-4">
                      {[1, 2].map((skel) => (
                        <div key={skel} className="p-6 border border-white/5 rounded-xl bg-white/[0.01] animate-pulse space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="h-4 w-40 bg-white/10 rounded"></div>
                            <div className="h-4 w-16 bg-white/10 rounded"></div>
                          </div>
                          <div className="h-3 w-72 bg-white/10 rounded"></div>
                          <div className="flex gap-2">
                            <div className="h-4 w-12 bg-white/10 rounded"></div>
                            <div className="h-4 w-12 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                      <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No jobs match your active filters.</p>
                    </div>
                  ) : (
                    <>
                      {/* Paginated Render with Infinite Load More trigger */}
                      {filteredJobs.slice(0, visibleJobsCount).map((job) => {
                        const comp = db.companies.find(c => c.id === job.companyId) || { name: "Company", logoEmoji: "🏢" };
                        const matchPct = calculateMatch(job.skills);
                        const isBookmarked = bookmarks.includes(job.id);
                        const alreadyApplied = companyApplicants.some(a => a.jobId === job.id);
                        const fraudResult = calculateFraudProbability(job);

                        return (
                          <Card key={job.id} className="bg-white/[0.01] dark:border-white/10 border-slate-200 hover:border-cyan-500/20 transition-all shadow-md relative group">
                            
                            {/* Bookmark Star Toggle */}
                            <button
                              onClick={() => handleToggleBookmark(job.id, job.title)}
                              className="absolute top-4 right-4 text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Bookmark / Save Position"
                            >
                              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>

                            <CardContent className="p-6 space-y-4">
                              <div className="flex justify-between items-start pr-6">
                                <div>
                                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                                    <span>{comp.logoEmoji}</span>
                                    <span>{comp.name}</span>
                                    {fraudResult.score >= 40 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-0.5 animate-pulse cursor-help" title={fraudResult.reasons.join(". ")}>
                                        <AlertCircle className="w-2.5 h-2.5 shrink-0" /> AI Scam Risk ({fraudResult.score}%)
                                      </span>
                                    )}
                                  </span>
                                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mt-1.5">{job.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-semibold">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-600" /> {job.location}</span>
                                    <span>•</span>
                                    <span>{job.experience}</span>
                                  </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-1.5">
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400">
                                    {matchPct}% Match
                                  </span>
                                  {alreadyApplied && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
                                      Applied
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{job.description}</p>

                              <div className="flex flex-wrap gap-1">
                                {job.skills.map(s => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500">{s}</span>
                                ))}
                              </div>

                              <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-4">
                                <span className="text-xs font-bold text-purple-400 font-mono">{job.salary}</span>
                                <Button
                                  onClick={() => setSelectedJob(job)}
                                  className="bg-white/5 hover:bg-white/10 text-white h-7 px-3 text-[10.5px] border border-white/10"
                                >
                                  Review Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {/* Infinite Load More button */}
                      {visibleJobsCount < filteredJobs.length && (
                        <div className="flex justify-center pt-4">
                          <Button
                            onClick={() => {
                              showToast("Paginated UI: Loaded more postings.", "info");
                              setVisibleJobsCount(prev => prev + 3);
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10"
                          >
                            Load More Openings...
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: JOB DETAILS REVIEW & OPTIMISTIC APPLY */}
          {activeTab === "jobs" && selectedJob && (
            <div className="max-w-3xl mx-auto space-y-6">
              <button 
                onClick={() => setSelectedJob(null)} 
                className="text-xs text-gray-500 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                &larr; Return to Discovery Feed
              </button>

              <Card className="bg-white/[0.02] border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
                
                <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-white/10 pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400">
                          {calculateMatch(selectedJob.skills)}% AI Match
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-gray-400">
                          {selectedJob.experience} Needed
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h2>
                      <span className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-semibold">
                        {db.companies.find(c => c.id === selectedJob.companyId)?.logoEmoji}{" "}
                        {db.companies.find(c => c.id === selectedJob.companyId)?.name}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleApplyOptimistic(selectedJob)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white h-10 px-6 border-0 shadow-lg shadow-cyan-500/25 shrink-0"
                    >
                      Instant One-Click Apply
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center p-3 rounded-lg bg-white/5 border border-white/5 text-xs font-semibold">
                    <div>
                      <span className="text-gray-500 block mb-1">Salary Range</span>
                      <span className="text-white font-bold">{selectedJob.salary}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Location</span>
                      <span className="text-white font-bold">{selectedJob.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Deadline</span>
                      <span className="text-white font-bold">{new Date(selectedJob.deadline).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Workplace</span>
                      <span className="text-white font-bold">{selectedJob.remote ? 'Remote' : 'On-Site'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white border-l-2 border-cyan-500 pl-3">Job Description</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{selectedJob.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white border-l-2 border-cyan-500 pl-3">Required Technical Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: BOOKMARKED / SAVED JOBS */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold">Bookmarked Opportunities</h2>
                <p className="text-xs text-gray-500">Review positions you have saved for asynchronous application.</p>
              </div>

              {bookmarks.length === 0 ? (
                <div className="text-center py-16 border border-white/5 rounded-xl bg-white/[0.01]">
                  <Star className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">You have no bookmarked listings yet.</p>
                  <Button 
                    onClick={() => setActiveTab("jobs")}
                    className="mt-6 bg-cyan-600 text-white text-xs h-8 border-0"
                  >
                    Explore Job Discovery
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarks.map((jobId) => {
                    const job = db.jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    const comp = db.companies.find(c => c.id === job.companyId) || { name: "Company", logoEmoji: "🏢" };
                    return (
                      <Card key={job.id} className="bg-white/[0.01] border-white/10 hover:border-white/20 transition-all shadow-md relative">
                        <button
                          onClick={() => handleToggleBookmark(job.id, job.title)}
                          className="absolute top-4 right-4 text-amber-400 hover:text-gray-500 cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </button>
                        <CardContent className="p-5 space-y-4">
                          <div>
                            <span className="text-[10px] text-gray-500 font-mono">{comp.logoEmoji} {comp.name}</span>
                            <h4 className="text-base font-bold text-white mt-1.5">{job.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-1 font-semibold">{job.location} • {job.experience}</p>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{job.description}</p>
                          <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                            <span className="text-xs font-mono font-bold text-cyan-400">{job.salary}</span>
                            <Button 
                              onClick={() => setSelectedJob(job)}
                              className="bg-white/5 text-white h-7 px-3 text-xs border border-white/10"
                            >
                              Apply Now
                            </Button>
                          </div>
                          
                          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1 text-indigo-400">
                              <BrainCircuit className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">AI Prep Insight</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              {bookmarkInsights[job.id] || "Generating AI preparation strategy..."}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: APPLICATION TRACKER WITH PAGINATION */}
          {activeTab === "tracker" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold">Applications &amp; Scheduled Assessments</h2>
                <p className="text-xs text-gray-500">Monitor active statuses, AI scores, and conference scheduled details.</p>
              </div>

              {companyApplicants.length === 0 ? (
                <div className="text-center py-16 border border-white/5 rounded-xl bg-white/[0.01]">
                  <BriefcaseIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No applications sent. Submit an application in Job Recommendations feed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedApplicants.map((app) => (
                    <Card key={app.id} className="bg-white/[0.01] border-white/10 shadow-md">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                              ATS Match Match: {app.matchScore}%
                            </span>
                            <h4 className="text-lg font-bold text-white mt-2">{app.jobTitle}</h4>
                            <p className="text-xs text-gray-500">Recruiter: {db.companies.find(c => c.id === db.jobs.find(j => j.id === app.jobId)?.companyId)?.name || "TechCorp"} • Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shrink-0 self-start sm:self-center ${
                            app.status === 'Hired' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            app.status === 'Rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                            app.status === 'Shortlisted' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                            app.status === 'Interview Scheduled' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 animate-pulse' :
                            'bg-white/10 text-gray-400 border border-white/10'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Interview Details if Scheduled */}
                        {app.status === "Interview Scheduled" && app.interviewDate && (
                          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-cyan-300">
                            <div>
                              <span className="font-bold uppercase tracking-wider text-[9px] block text-cyan-500">Live Video Assessment Scheduled:</span>
                              <strong>{app.interviewDate}</strong> at <strong>{app.interviewTime}</strong>
                            </div>
                            <a 
                              href={app.interviewLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded bg-cyan-500 text-black font-bold text-[10.5px] hover:bg-cyan-400 transition-colors flex items-center gap-1 border-0"
                            >
                              <Link2 className="w-3.5 h-3.5" /> Start Meeting Room
                            </a>
                          </div>
                        )}

                        {/* AI Next Steps Section */}
                        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 text-indigo-400">
                              <BrainCircuit className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">AI Next Step Recommendation</span>
                            </div>
                            {!trackerInsights[app.id] && (
                              <Button 
                                onClick={() => {
                                  setTrackerInsights(prev => ({ ...prev, [app.id]: "Generating AI next steps..." }));
                                  generateTrackerNextStepsAI(app.jobTitle, app.status).then(res => {
                                    setTrackerInsights(prev => ({ ...prev, [app.id]: res }));
                                  }).catch(err => {
                                    console.error(err);
                                    setTrackerInsights(prev => ({ ...prev, [app.id]: "Error generating insight." }));
                                  });
                                }}
                                className="h-6 text-[10px] px-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30"
                              >
                                <Sparkles className="w-3 h-3 mr-1" /> Get Advice
                              </Button>
                            )}
                          </div>
                          {trackerInsights[app.id] && (
                            <p className="text-[11px] text-gray-300 leading-relaxed mt-2">
                              {trackerInsights[app.id]}
                            </p>
                          )}
                        </div>

                        {/* Timeline */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-white/5 pt-4 text-center">
                          {[
                            { label: "Applied", active: true },
                            { label: "Viewed", active: app.status !== "Applied" },
                            { label: "Shortlisted", active: app.status === "Shortlisted" || app.status === "Interview Scheduled" || app.status === "Hired" },
                            { label: "Interview", active: app.status === "Interview Scheduled" || app.status === "Hired" },
                            { label: "Decision", active: app.status === "Hired" || app.status === "Rejected" }
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                step.active ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 text-gray-600'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${step.active ? 'text-white' : 'text-gray-600'}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination control footer */}
                  {totalApplicationPages > 1 && (
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-4">
                      <span>Page {applicationsPage} of {totalApplicationPages}</span>
                      <div className="flex gap-2">
                        <Button
                          disabled={applicationsPage === 1}
                          onClick={() => setApplicationsPage(p => p - 1)}
                          className="bg-white/5 border border-white/10 text-white h-7 px-3 disabled:opacity-30"
                        >
                          Prev
                        </Button>
                        <Button
                          disabled={applicationsPage === totalApplicationPages}
                          onClick={() => setApplicationsPage(p => p + 1)}
                          className="bg-white/5 border border-white/10 text-white h-7 px-3 disabled:opacity-30"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: AI CAREER ROADMAP GENERATOR */}
          {activeTab === "roadmap" && (
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  AI Career Roadmap Generator
                </h2>
                <p className="text-xs text-gray-500">Enter your ultimate dream job, and our AI compiler will generate a detailed, phase-by-phase chronological learning roadmap.</p>
              </div>

              <Card className="bg-white/[0.02] border-white/10 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="dreamJobInput" className="text-xs text-gray-400">Dream Job Role</Label>
                    <Input
                      id="dreamJobInput"
                      value={roadmapDreamJob}
                      onChange={(e) => setRoadmapDreamJob(e.target.value)}
                      placeholder="e.g. Senior Machine Learning Engineer, Smart Contract Lead at Stripe..."
                      className="bg-white/5 border-white/10 text-white text-xs h-10 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateRoadmap}
                    disabled={generatingRoadmap}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 px-6 border-0 shadow-lg shadow-indigo-600/20"
                  >
                    {generatingRoadmap ? "Compiling Roadmap..." : "Generate AI Roadmap"}
                  </Button>
                </div>
              </Card>

              {generatingRoadmap && (
                <div className="space-y-6">
                  <div className="h-6 w-48 bg-white/5 animate-pulse rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              )}

              {roadmapData && !generatingRoadmap && (
                <div className="space-y-8 animate-none">
                  <Card className="bg-white/[0.01] border-white/10 p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-3">Core Target Skillsets</span>
                    <div className="flex flex-wrap gap-2">
                      {roadmapData.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-mono shadow-[0_0_8px_rgba(99,102,241,0.1)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-8 space-y-8 py-2">
                    {roadmapData.phases.map((phase, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.15 }}
                        className="relative"
                      >
                        <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-black border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all p-5 rounded-2xl">
                          <div className="lg:col-span-8 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase font-mono tracking-wider">{phase.duration}</span>
                              <h4 className="text-base font-bold text-white">{phase.title}</h4>
                            </div>
                            <ul className="space-y-1.5 list-disc pl-4 text-xs text-gray-400">
                              {phase.details.map((detail, dIdx) => (
                                <li key={dIdx}>{detail}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Recommended Courses</span>
                            <div className="space-y-1.5">
                              {phase.courses.map((course, cIdx) => (
                                <div key={cIdx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 hover:border-indigo-500/20 transition-all text-xs text-gray-300 font-medium select-none cursor-pointer flex items-center justify-between">
                                  <span>{course}</span>
                                  <ArrowUpRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: AI RESUME VS JOB COMPARISON */}
          {activeTab === "comparison" && (
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                  AI Resume vs Job Description Parser
                </h2>
                <p className="text-xs text-gray-500">Cross-reference your parsed resume profile with any platform-posted job or standard descriptive text to map keyword alignment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                <div className="md:col-span-5 space-y-4">
                  <Card className="bg-white/[0.02] border-white/10 p-5 space-y-4 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block border-b border-white/5 pb-2">Target Selection</span>

                    <div className="space-y-2">
                      <Label htmlFor="compareJobSelect" className="text-xs text-gray-400">Choose Active Database Job</Label>
                      <select
                        id="compareJobSelect"
                        value={compJobId}
                        onChange={(e) => {
                          setCompJobId(e.target.value);
                          if (e.target.value) {
                            setCompCustomTitle("");
                            setCompCustomDesc("");
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="" className="bg-neutral-900 text-gray-400">-- Choose Job --</option>
                        {db.jobs.map(j => (
                          <option key={j.id} value={j.id} className="bg-neutral-900 text-white">
                            {j.title} ({db.companies.find(c => c.id === j.companyId)?.name || "Tech"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Or Custom Job</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customTitle" className="text-xs text-gray-400">Job Title</Label>
                      <Input
                        id="customTitle"
                        value={compCustomTitle}
                        onChange={(e) => {
                          setCompCustomTitle(e.target.value);
                          setCompJobId("");
                        }}
                        placeholder="e.g. Lead Smart Contract Architect"
                        className="bg-white/5 border-white/10 text-white text-xs h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customDesc" className="text-xs text-gray-400">Job Description Keywords</Label>
                      <textarea
                        id="customDesc"
                        rows={4}
                        value={compCustomDesc}
                        onChange={(e) => {
                          setCompCustomDesc(e.target.value);
                          setCompJobId("");
                        }}
                        placeholder="Paste details, requirements, stack details..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleCompareResume}
                      disabled={comparingResume}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold h-9 text-xs border-0 mt-2"
                    >
                      {comparingResume ? "Analyzing Similarity..." : "Run Compatibility Comparison"}
                    </Button>
                  </Card>
                </div>

                <div className="md:col-span-7 space-y-4">
                  {comparingResume && (
                    <Card className="bg-white/[0.02] border-white/10 min-h-[300px] flex items-center justify-center shadow-lg animate-pulse">
                      <div className="text-center space-y-2">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                        <span className="font-mono text-[10px] tracking-wider text-gray-500 block">AI ALIGNMENT PARSING...</span>
                      </div>
                    </Card>
                  )}

                  {!comparisonResult && !comparingResume && (
                    <Card className="bg-white/[0.01] border-white/5 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                      <FileText className="w-12 h-12 text-gray-600 mb-2" />
                      <h4 className="text-sm font-bold text-gray-400">No Comparison Active</h4>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-[280px]">Select a posted platform role or paste custom requirements on the left to see semantic compatibility ratings.</p>
                    </Card>
                  )}

                  {comparisonResult && !comparingResume && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4 animate-none"
                    >
                      <Card className="bg-white/[0.02] border-white/10 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                        
                        <div className="relative w-28 h-28 shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              stroke="#06b6d4" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * comparisonResult.score) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold font-mono text-cyan-400">{comparisonResult.score}%</span>
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">ATS Score</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                          <span className="text-xs font-mono font-bold uppercase text-cyan-400">Match Verdict</span>
                          <h4 className="text-lg font-bold text-white">
                            {comparisonResult.score >= 85 ? "Elite Cohort Match" : comparisonResult.score >= 70 ? "Competitive Match" : "Keywords Deficit - Adjustments Required"}
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed">Your parsed profile has high semantic relevance. Injecting the missing technologies detailed below will yield perfect index placement.</p>
                        </div>
                      </Card>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { title: "Experience Alignment", val: comparisonResult.experienceRating, color: "from-blue-500 to-indigo-500" },
                          { title: "Skill Matrix Fit", val: comparisonResult.skillsRating, color: "from-cyan-500 to-purple-500" },
                          { title: "Academic Score", val: comparisonResult.academicRating, color: "from-emerald-500 to-teal-500" }
                        ].map((rate, i) => (
                          <Card key={i} className="bg-white/[0.01] border-white/5 p-4 text-center">
                            <span className="text-[10px] text-gray-400 block font-medium truncate mb-1">{rate.title}</span>
                            <span className="text-lg font-bold font-mono text-white block mb-2">{rate.val}%</span>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${rate.color}`} style={{ width: `${rate.val}%` }} />
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Card className="bg-white/[0.02] border-white/10 p-5 space-y-4">
                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Matched Keywords (Green) &amp; Missing Keywords (Red)</span>
                          
                          <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
                            {comparisonResult.matchedSkills.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wide">
                                {s}
                              </span>
                            ))}
                            {comparisonResult.matchedSkills.length === 0 && (
                              <span className="text-xs text-gray-500 italic">No matching tech stack items identified.</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {comparisonResult.missingSkills.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/10 border border-red-500/30 text-red-400 uppercase tracking-wide">
                                {s}
                              </span>
                            ))}
                            {comparisonResult.missingSkills.length === 0 && (
                              <span className="text-xs text-emerald-400 font-semibold italic">0 missing skills! Perfect tech alignment.</span>
                            )}
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white/[0.01] border-white/5 p-5 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block border-b border-white/5 pb-2">AI Optimization Recommendations</span>
                        <div className="space-y-2 text-xs leading-relaxed text-gray-300">
                          {comparisonResult.feedback.map((feed, idx) => (
                            <div key={idx} className="flex gap-2.5">
                              <span className="text-cyan-400 font-bold shrink-0">•</span>
                              <span>{feed}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                    </motion.div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: VOICE-BASED AI INTERVIEW SIMULATION */}
          {activeTab === "interview" && (
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Voice-Based AI Interview Simulation
                </h2>
                <p className="text-xs text-gray-500">Practice live interviews where the AI literally speaks the questions using Text-To-Speech, and captures your response via mic streams!</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-4 space-y-4">
                  <Card className="bg-white/[0.02] border-white/10 p-5 space-y-4 shadow-lg relative">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block border-b border-white/5 pb-2">Telemetry control</span>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-gray-500 font-bold block">Current Round</span>
                      <span className="text-xs font-semibold text-white font-mono block">Question {voiceCurrentQuestionIdx + 1} of {voiceQuestions.length}</span>
                    </div>

                    <Button
                      onClick={handleToggleVoiceSimulation}
                      className={`w-full font-bold h-9 text-xs border-0 ${
                        voiceActive 
                          ? "bg-red-600 hover:bg-red-500 text-white" 
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                      }`}
                    >
                      {voiceActive ? "Close Practice Room" : "Start Voice AI Practice"}
                    </Button>
                  </Card>

                  {voiceActive && (
                    <Card className={`p-4 border text-[11px] leading-relaxed font-mono flex items-center gap-3 ${
                      voiceInterviewerState === "speaking" 
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                        : voiceInterviewerState === "listening" 
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse"
                          : voiceInterviewerState === "analyzing"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-white/[0.02] border-white/5 text-gray-500"
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        voiceInterviewerState === "speaking" ? "bg-purple-500" : voiceInterviewerState === "listening" ? "bg-cyan-400" : "bg-gray-600"
                      }`} />
                      <span>
                        {voiceInterviewerState === "speaking" && "Interviewer is reading the question..."}
                        {voiceInterviewerState === "listening" && "Microphone open: Listening..."}
                        {voiceInterviewerState === "analyzing" && "AI parsing voice telemetry..."}
                        {voiceInterviewerState === "idle" && "Connected. Ready to trigger speak."}
                      </span>
                    </Card>
                  )}

                  {voiceCritique && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 animate-none"
                    >
                      <Card className="bg-white/[0.02] border-white/10 p-5 space-y-4 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block border-b border-white/5 pb-2">Final Mock Critique</span>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Overall Grade</span>
                          <span className="text-3xl font-extrabold font-mono text-emerald-400">{voiceCritique.overallGrade}</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { label: "Vocal Clarity", val: voiceCritique.clarityScore },
                            { label: "Delivery Pacing", val: voiceCritique.deliveryPace },
                            { label: "Technical Substance", val: voiceCritique.technicalSubstance }
                          ].map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                <span>{item.label}</span>
                                <span>{item.val}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${item.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">AI Evaluation Tips</span>
                          <ul className="space-y-1.5 list-disc pl-3 text-[10.5px] leading-relaxed text-gray-400">
                            {voiceCritique.recs.map((rec, rIdx) => (
                              <li key={rIdx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>

                <div className="lg:col-span-8 space-y-4">
                  {voiceActive ? (
                    <Card className="bg-white/[0.02] border-white/10 p-6 flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative">
                      <div className="flex items-center justify-center gap-1.5 h-16 my-6">
                        {[...Array(15)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scaleY: voiceInterviewerState === "speaking" ? [1, 2.5, 1] : voiceInterviewerState === "listening" ? [1, 1.8, 1] : 1,
                              height: ["16px", "42px", "16px"]
                            }}
                            transition={{
                              duration: 0.5 + (i % 3) * 0.15,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className={`w-1 rounded-full ${
                              voiceInterviewerState === "speaking" 
                                ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                                : voiceInterviewerState === "listening" 
                                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                                  : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-center space-y-2 mb-6 max-w-sm">
                        <span className="text-[10px] font-bold font-mono tracking-widest text-purple-400 block uppercase">Question Narration Prompt</span>
                        <p className="text-sm font-semibold text-white leading-relaxed">{voiceQuestions[voiceCurrentQuestionIdx]}</p>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handleSpeakQuestion}
                          disabled={voiceInterviewerState === "speaking" || voiceInterviewerState === "listening"}
                          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs h-9 px-6 border-0 shadow-md shadow-purple-600/10"
                        >
                          {voiceInterviewerState === "speaking" ? "AI speaking..." : "Speak Question"}
                        </Button>
                      </div>

                      <div className="w-full mt-6 border border-white/5 rounded-xl bg-black/60 p-4 font-mono text-xs leading-relaxed text-gray-400 min-h-[100px] flex flex-col justify-between select-text relative">
                        <div className="absolute top-2 right-4 text-[8px] font-bold text-gray-500 uppercase tracking-widest">Mic Transcripts Relay</div>
                        <span className="text-gray-300 block">{voiceTranscript}</span>
                        {voiceInterviewerState === "listening" && (
                          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-[10px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span>Vocal streaming active... Speak into your microphone</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <Card className="bg-white/[0.01] border-white/5 min-h-[380px] flex flex-col items-center justify-center text-center p-8">
                      <Sparkles className="w-12 h-12 text-gray-600 mb-2" />
                      <h4 className="text-sm font-bold text-gray-400">Practice Room Closed</h4>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-[320px]">Click the &quot;Start Voice AI Practice&quot; button on the left to boot up browser-level voice narration telemetry and simulated microphone streaming.</p>
                    </Card>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: REAL-TIME RECRUITER CHAT */}
          {activeTab === "chat" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold">Ecosystem Recruiter Chat Channels</h2>
                <p className="text-xs text-gray-500">Live chat rooms with verified employer recruiters matching your active applications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.01] shadow-2xl h-[500px]">
                
                {/* Left recruiter channels list */}
                <div className="md:col-span-4 border-r border-white/10 bg-black/30 flex flex-col divide-y divide-white/5">
                  {[
                    { id: "sarah", name: "Sarah Croft", role: "Stripe Talent Lead", emoji: "💳", active: activeChatRecruiter === "sarah" },
                    { id: "david", name: "David Vercel", role: "Vercel Platform Recruiter", emoji: "▲", active: activeChatRecruiter === "david" }
                  ].map((chan) => (
                    <div
                      key={chan.id}
                      onClick={() => setActiveChatRecruiter(chan.id as typeof activeChatRecruiter)}
                      className={`p-4 cursor-pointer text-left transition-all ${chan.active ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span className="text-sm select-none">{chan.emoji}</span>
                          {chan.name}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-semibold">{chan.role}</p>
                    </div>
                  ))}
                </div>

                {/* Right Chat messages grid */}
                <div className="md:col-span-8 flex flex-col h-full bg-black/60">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {activeChatRecruiter === "sarah" ? "Sarah Croft (Stripe)" : "David Vercel (Vercel)"}
                      </h4>
                      <p className="text-[9px] text-gray-500">Recruiting assessments active</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[300px]">
                    {chatThreads[activeChatRecruiter].map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "candidate" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                          msg.sender === "candidate"
                            ? "bg-cyan-600 text-black font-semibold shadow-md"
                            : "bg-white/5 border border-white/5 text-gray-300"
                        }`}>
                          {msg.text}
                          <span className="block text-[8px] text-gray-500 text-right mt-1">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message to recruiter..."
                        className="bg-white/5 border-white/10 text-xs text-white flex-1 focus-visible:ring-cyan-500"
                      />
                      <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold h-9 px-4 border-0">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: EMAIL HUB */}
          {activeTab === "emails" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold">AI Ecosystem Notifications Inbox</h2>
                <p className="text-xs text-gray-500">Formal system and employer notifications sent to your registered profile email address.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.01] shadow-2xl h-[500px]">
                
                {/* Left Email list */}
                <div className="md:col-span-5 border-r border-white/10 bg-black/30 flex flex-col divide-y divide-white/5 overflow-y-auto">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setActiveEmailId(email.id);
                        // Mark read optimistically
                        setEmails(prev => prev.map(em => em.id === email.id ? { ...em, read: true } : em));
                      }}
                      className={`p-4 cursor-pointer text-left transition-all ${activeEmailId === email.id ? 'bg-pink-500/10 border-l-2 border-pink-500' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{email.sender}</span>
                        {!email.read && <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-lg shrink-0" />}
                      </div>
                      <h5 className="text-[11px] text-gray-300 font-semibold truncate mt-1">{email.subject}</h5>
                      <span className="text-[9px] text-gray-500 mt-1 block">{email.date}</span>
                    </div>
                  ))}
                </div>

                {/* Right Email Preview */}
                <div className="md:col-span-7 flex flex-col h-full bg-black/60 p-6 overflow-y-auto">
                  {(() => {
                    const em = emails.find(e => e.id === activeEmailId);
                    if (!em) return <div className="text-center text-xs text-gray-500 py-20">Select an email to view.</div>;
                    return (
                      <div className="space-y-6 select-text text-left">
                        <div className="border-b border-white/10 pb-4 space-y-1.5">
                          <h4 className="text-base font-bold text-white">{em.subject}</h4>
                          <div className="flex justify-between text-[11px] text-gray-400">
                            <span>From: <strong>{em.sender}</strong> &lt;{em.email}&gt;</span>
                            <span>{em.date}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed white-space-pre-line font-mono bg-white/2 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                          {em.body}
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
