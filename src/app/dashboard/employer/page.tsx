"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, Bell, Settings, Users, PlusCircle, 
  TrendingUp, BarChart3, Zap, ShieldCheck, LogOut, Check, 
  Trash2, X, Briefcase, Calendar, MapPin, Mail, Phone, 
  Globe, Award, FileText, Clock, Link2, 
  AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AIChatbot from "@/components/AIChatbot";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Central database integrations
import { 
  getDatabase, 
  postJob, 
  removeJob, 
  updateCompanyProfile, 
  updateApplicationStatus, 
  markNotificationsRead, 
  reportJob,
  calculateFraudProbability,
  HireSphereDB, 
  Applicant
} from "@/lib/db";

// Responsive Recharts for dynamic visual intelligence
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

export default function EmployerDashboard() {
  const router = useRouter();
  const [db, setDb] = useState<HireSphereDB | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "post" | "applicants" | "profile">("overview");
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; candidates: number; skill: string; demand: string; trend: string; cx: string; cy: string; color: string } | null>(null);
  
  // Local interface states
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [schedulerApplicantId, setSchedulerApplicantId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLink, setInterviewLink] = useState("https://hiresphere.ai/meet/sandbox-zoom");
  
  // Real-time notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  // Post Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    salary: "$130,000 - $160,000",
    skills: "",
    deadline: "2026-06-30",
    experience: "4+ years",
    location: "Remote",
    remote: true
  });

  // Edit Company Profile state
  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    teamSize: "",
    logoEmoji: ""
  });

  // Auth context for route guarding
  const { user, loading: authLoading, logout } = useAuth();

  // Security Route Guard check
  useEffect(() => {
    if (authLoading) return;
    if (!user?.isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user.role !== "employer" && user.role !== "admin") {
      router.push("/dashboard/candidate");
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

  // Set Profile form once company database records resolve
  useEffect(() => {
    if (db) {
      const tc = db.companies.find(c => c.id === "techcorp");
      if (tc) {
        setProfileForm({
          name: tc.name,
          description: tc.description,
          website: tc.website,
          industry: tc.industry,
          teamSize: tc.teamSize,
          logoEmoji: tc.logoEmoji
        });
      }
    }
  }, [db]);

  // Simulation loop: trigger candidate applications randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (!db || db.jobs.length === 0) return;
      
      // 30% chance to generate applicant event
      if (Math.random() > 0.7) {
        const randomJob = db.jobs[Math.floor(Math.random() * db.jobs.length)];
        
        // Simulating applicant application
        const candidateNames = ["Liam Patel", "Fiona Gallagher", "Hiroshi Tanaka", "Sophia Dubois", "Carlos Santana"];
        const chosenName = candidateNames[Math.floor(Math.random() * candidateNames.length)];
        
        const msg = `${chosenName} has applied for "${randomJob.title}"! (AI Match: ${Math.floor(Math.random() * 20) + 80}%)`;
        
        // Trigger Toast & Live Notification
        showToastNotification(msg, "apply");
        
        // Force refresh from database
        setDb(getDatabase());
      }
    }, 45000); // Check every 45s

    return () => clearInterval(interval);
  }, [db]);

  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-400 font-mono text-sm tracking-widest">LOADING HIRESPHERE STATE...</p>
        </div>
      </div>
    );
  }

  // Identify current context company: "TechCorp"
  const company = db.companies.find(c => c.id === "techcorp") || {
    id: "techcorp",
    name: "TechCorp Inc.",
    logoColor: "from-purple-500 to-indigo-500",
    logoEmoji: "💻",
    description: "Building the next generation of cloud storage.",
    website: "https://techcorp.ai",
    industry: "Software Engineering",
    teamSize: "250-500 employees",
    verified: true
  };

  const companyJobs = db.jobs.filter(j => j.companyId === company.id);
  const jobIds = companyJobs.map(j => j.id);
  const companyApplicants = db.applicants.filter(a => jobIds.includes(a.jobId));
  const unreadNotifications = db.notifications.filter(n => !n.read);

  // Toast dispatch handler
  const showToastNotification = (message: string, type: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Job Submission handler
  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.skills.trim()) {
      showToastNotification("Please input a valid job title and skill requirements.", "error");
      return;
    }

    const skillsArray = jobForm.skills.split(",").map(s => s.trim()).filter(Boolean);
    
    postJob({
      title: jobForm.title,
      description: jobForm.description,
      salary: jobForm.salary,
      skills: skillsArray,
      deadline: jobForm.deadline,
      experience: jobForm.experience,
      location: jobForm.location,
      remote: jobForm.remote,
      companyId: company.id
    });

    showToastNotification(`Successfully published: "${jobForm.title}"!`, "success");
    
    setTimeout(() => {
      showToastNotification(`AI Matcher parsed job! 3 matched applicants ranked automatically.`, "info");
    }, 1500);

    // Reset Form & Redirect
    setJobForm({
      title: "",
      description: "",
      salary: "$130,000 - $160,000",
      skills: "",
      deadline: "2026-06-30",
      experience: "4+ years",
      location: "Remote",
      remote: true
    });
    setActiveTab("applicants");
  };

  // Delete Job Handler
  const handleJobDelete = (jobId: string, title: string) => {
    removeJob(jobId);
    showToastNotification(`Job "${title}" and associated applicants successfully removed.`, "success");
  };

  // Company Profile Update handler
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(company.id, profileForm);
    showToastNotification("Company profile settings updated successfully!", "success");
  };

  // Applicant Status Pipeline controllers
  const handleStatusUpdate = (appId: string, status: Applicant["status"]) => {
    updateApplicationStatus(appId, status);
    showToastNotification(`Candidate marked as: ${status}`, "success");
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant(prev => prev ? { ...prev, status } : null);
    }
  };

  // Interview Scheduler Dispatcher
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulerApplicantId || !interviewDate || !interviewTime) {
      showToastNotification("Please select a valid date and time.", "error");
      return;
    }

    updateApplicationStatus(schedulerApplicantId, "Interview Scheduled", {
      interviewDate,
      interviewTime,
      interviewLink
    });

    showToastNotification("Interview scheduled successfully! Meeting links generated.", "success");
    setSchedulerApplicantId(null);
    setInterviewDate("");
    setInterviewTime("");
  };

  const handleFlagAsFake = (jobId: string, title: string) => {
    reportJob(jobId, "Flagged by employer sandbox moderation testing.");
    showToastNotification(`Job "${title}" flagged for admin moderation review.`, "info");
  };

  // ----------------------------------------------------
  // DYNAMIC CHART DATA COMPILATIONS
  // ----------------------------------------------------
  
  // 1. Job views & application trends
  const analyticsViewsData = companyJobs.map(j => ({
    name: j.title.substring(0, 15) + (j.title.length > 15 ? "..." : ""),
    Views: j.views,
    Applicants: companyApplicants.filter(a => a.jobId === j.id).length
  }));

  // 2. Hiring funnel breakdown (Pie Chart)
  const funnelCounts = {
    Applied: companyApplicants.filter(a => a.status === "Applied").length,
    Shortlisted: companyApplicants.filter(a => a.status === "Shortlisted").length,
    Interviewing: companyApplicants.filter(a => a.status === "Interview Scheduled").length,
    Hired: companyApplicants.filter(a => a.status === "Hired").length,
    Rejected: companyApplicants.filter(a => a.status === "Rejected").length,
  };

  const analyticsFunnelData = [
    { name: "Applied", value: funnelCounts.Applied, color: "#a855f7" },
    { name: "Shortlisted", value: funnelCounts.Shortlisted, color: "#3b82f6" },
    { name: "Interviewing", value: funnelCounts.Interviewing, color: "#06b6d4" },
    { name: "Hired", value: funnelCounts.Hired, color: "#10b981" },
    { name: "Rejected", value: funnelCounts.Rejected, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // 3. Skill Demand index
  const skillCountMap: Record<string, number> = {};
  companyApplicants.forEach(a => {
    a.skills.forEach(skill => {
      skillCountMap[skill] = (skillCountMap[skill] || 0) + 1;
    });
  });
  const analyticsSkillsData = Object.entries(skillCountMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // 4. Job Engagement index

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

      {/* Floating Notifications System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto p-4 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-0.5">
                <Zap className="w-3. h-3" />
              </div>
              <div className="flex-1 text-xs font-medium text-gray-200">{t.message}</div>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-white/10 bg-black/80 backdrop-blur-xl p-6 flex flex-col hidden md:flex relative z-20">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HireSphere<span className="text-purple-400">.ai</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("overview")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Analytics Overview
          </button>
          <button 
            onClick={() => setActiveTab("jobs")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "jobs" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Active Jobs ({companyJobs.length})
          </button>
          <button 
            onClick={() => setActiveTab("post")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "post" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Post New Job
          </button>
          <button 
            onClick={() => setActiveTab("applicants")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "applicants" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Users className="w-4 h-4 text-pink-400" />
            AI Applicant Ranker
          </button>
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
          <button 
            onClick={() => setActiveTab("profile")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "profile" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Settings className="w-4 h-4 text-gray-400" />
            Company Profile
          </button>
          <button onClick={async () => { await logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Navigation Header / Topbar */}
        <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${company.logoColor} flex items-center justify-center text-lg shadow-md`}>
              {company.logoEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-white tracking-tight">{company.name}</h1>
                {company.verified && (
                  <div className="inline-flex items-center justify-center p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs" title="Verified Employer">
                    <ShieldCheck className="w-3.5 h-3.5 fill-cyan-400/20 text-cyan-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{company.industry} • {company.teamSize}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setActiveTab("post")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-9 px-4 hidden sm:flex border-0 shadow-lg shadow-purple-500/20"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post Job
            </Button>

            {/* Notification popover button */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markNotificationsRead();
                  if (db) setDb(getDatabase());
                }}
                className="text-gray-400 hover:text-white relative bg-white/5 border border-white/10"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl p-4 space-y-3 z-50 text-left"
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">System Notifications</span>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {db.notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No recent notifications</p>
                      ) : (
                        db.notifications.slice(0, 6).map((n) => (
                          <div key={n.id} className={`p-2.5 rounded-lg text-xs leading-relaxed border ${n.read ? "bg-white/2 border-white/5 text-gray-400" : "bg-purple-500/10 border-purple-500/20 text-white"}`}>
                            <div className="font-semibold mb-0.5 text-[10px] uppercase text-gray-500">
                              {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            {n.message}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Small Developer indicator */}
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-400 select-none">
              TC
            </div>
          </div>
        </header>

        {/* Tab content wrappers */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Counters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Active Jobs", value: companyJobs.length, change: "Updated Live", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Total Candidates", value: companyApplicants.length, change: "+3 matching currently", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "AI Screened Profiles", value: companyApplicants.filter(a => a.matchScore > 75).length, change: "95% ATS match avg", icon: BrainCircuit, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "Verification Level", value: company.verified ? "Verified" : "Unverified", change: company.verified ? "Badge active" : "Verify in Admin", icon: ShieldCheck, color: company.verified ? "text-emerald-400" : "text-amber-400", bg: company.verified ? "bg-emerald-500/10" : "bg-amber-500/10" },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-white/[0.03] border-white/10 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span className="font-semibold text-gray-400">{stat.label}</span> • <span>{stat.change}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Job Views vs Applicants rate */}
                <Card className="lg:col-span-2 bg-white/[0.02] border-white/10 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Job Views vs. Applicant Funnel
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Track user engagement metrics per job posting.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 pr-2">
                    {analyticsViewsData.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No data available. Post a job first.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsViewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11 }} />
                          <Area type="monotone" dataKey="Views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorViews)" name="Job Views" />
                          <Area type="monotone" dataKey="Applicants" stroke="#06b6d4" fillOpacity={1} fill="url(#colorApps)" name="Applicants" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Applicant Funnel (Donut Pie Chart) */}
                <Card className="bg-white/[0.02] border-white/10 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Pipeline Funnel Share
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Distribution of candidate status profiles.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex flex-col justify-center">
                    {analyticsFunnelData.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No active applicants.</div>
                    ) : (
                      <>
                        <div className="h-56 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsFunnelData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {analyticsFunnelData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11 }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-white">{companyApplicants.length}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Total applicants</span>
                          </div>
                        </div>
                        {/* Legends grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 text-[10px]">
                          {analyticsFunnelData.map((f, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                              <span className="text-gray-400 truncate">{f.name} ({f.value})</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Skill Demand Vertical Bar Chart */}
                <Card className="bg-white/[0.02] border-white/10 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-pink-400" />
                      Applicant Skill Demand
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Top keywords parsed from applicant resumes.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 pr-2">
                    {analyticsSkillsData.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Waiting for applications.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsSkillsData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={9} allowDecimals={false} />
                          <YAxis dataKey="skill" type="category" stroke="rgba(255,255,255,0.4)" fontSize={9} width={60} />
                          <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11 }} />
                          <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} name="Candidates Count">
                            {analyticsSkillsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#ec4899" : "#a855f7"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* 4. AI Insights & Pipeline Bottlenecks */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border-purple-500/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-purple-400" />
                      AI Talent Recruiter Insights
                    </CardTitle>
                    <CardDescription className="text-xs text-purple-300/60">Automated structural recommendations for pipeline scaling.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Market Intelligence
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Salary metrics for &quot;Senior Frontend Engineer&quot; rose by 4.2% across local brackets. Consider expanding your remote boundaries to recruit elite candidates who value flexible schedules.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pipeline Congestion Flagged
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        You have {companyApplicants.filter(a => a.status === "Applied").length} unprocessed candidates on hold. To prevent candidate attrition and drop-off, trigger shortlisting operations or schedule automated AI initial screening rooms.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Ecosystem Talent Regional Heatmap */}
                <Card className="lg:col-span-3 bg-white/[0.02] border-white/10 shadow-2xl relative overflow-hidden select-none">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-gray-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                      Ecosystem Talent Regional Heatmap
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Live regional tracking showing geographic applicant concentration hubs &amp; leading skillsets. Hover over any neon cluster point.</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6">
                    {/* SVG Map telemetry grid */}
                    <div className="lg:col-span-7 relative h-72 border border-white/5 rounded-2xl bg-black/60 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04),transparent_60%)]" />
                      
                      {/* Grid wires */}
                      <svg className="absolute inset-0 w-full h-full text-white/[0.02]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>

                      {/* Geographic hub glowing nodes */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Wires connecting nodes to center remote bridge */}
                        {[
                          { cx: "20%", cy: "45%" },
                          { cx: "45%", cy: "70%" },
                          { cx: "80%", cy: "35%" },
                          { cx: "25%", cy: "20%" }
                        ].map((node, nIdx) => (
                          <line
                            key={nIdx}
                            x1="50%"
                            y1="40%"
                            x2={node.cx}
                            y2={node.cy}
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                          />
                        ))}

                        {/* Interactive Nodes */}
                        {[
                          { name: "Silicon Valley Hub", candidates: 148, skill: "ML / Transformer Architecture", demand: "Critical", trend: "+12.4%", cx: "20%", cy: "45%", color: "#a855f7" },
                          { name: "Austin Tech Corridor", candidates: 94, skill: "React 19 & Next.js Server Actions", demand: "High", trend: "+8.9%", cx: "45%", cy: "70%", color: "#06b6d4" },
                          { name: "New York Metro Cluster", candidates: 118, skill: "Solidity / Web3 DeFi Engines", demand: "Elite", trend: "+15.1%", cx: "80%", cy: "35%", color: "#ec4899" },
                          { name: "Seattle Developer Belt", candidates: 68, skill: "PostgreSQL & Row-Level Security", demand: "Stable", trend: "+4.2%", cx: "25%", cy: "20%", color: "#3b82f6" },
                          { name: "Global Remote Bridge", candidates: 215, skill: "Rust Systems & WebAssembly", demand: "Absolute", trend: "+18.7%", cx: "50%", cy: "40%", color: "#10b981" }
                        ].map((hub, hIdx) => {
                          const isHovered = hoveredRegion?.name === hub.name;
                          return (
                            <g 
                              key={hIdx}
                              onMouseEnter={() => setHoveredRegion(hub)}
                              onMouseLeave={() => setHoveredRegion(null)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={hub.cx}
                                cy={hub.cy}
                                r={isHovered ? "4" : "2"}
                                fill={hub.color}
                                className="transition-all duration-300 opacity-60"
                              />
                              <circle
                                cx={hub.cx}
                                cy={hub.cy}
                                r={isHovered ? "8" : "4"}
                                fill="transparent"
                                stroke={hub.color}
                                strokeWidth="0.5"
                                className={`transition-all duration-300 ${isHovered ? 'animate-ping' : ''}`}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Map HUD tags */}
                      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest">Global Sandbox Geo Telemetry Grid v1.5</div>
                      <div className="absolute top-3 right-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Live Feeds Connected
                      </div>
                    </div>

                    {/* Regional stats HUD console */}
                    <div className="lg:col-span-5 space-y-4">
                      {hoveredRegion ? (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono text-white" style={{ backgroundColor: `${hoveredRegion.color}30`, border: `1px solid ${hoveredRegion.color}60` }}>
                              Region Selected
                            </span>
                            <h4 className="text-base font-bold text-white mt-1.5">{hoveredRegion.name}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Talent Count</span>
                              <span className="text-xl font-bold font-mono text-white block">{hoveredRegion.candidates} <span className="text-[10px] text-gray-400 font-normal">Active</span></span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase font-mono">Growth Velocity</span>
                              <span className="text-xl font-bold font-mono text-emerald-400 block">{hoveredRegion.trend}</span>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-white/5 pt-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase font-mono block">Primary Skill Stack Domain</span>
                              <span className="text-xs text-gray-300 font-mono">{hoveredRegion.skill}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-500 font-bold uppercase font-mono block">Scarcity Demand Rating</span>
                              <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-widest">{hoveredRegion.demand} Priority</span>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full flex flex-col justify-center text-center p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
                          <Globe className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                          <h4 className="text-xs font-bold text-gray-400">Map HUD Inactive</h4>
                          <p className="text-[10.5px] text-gray-500 mt-1 max-w-[220px] mx-auto">Hover over any glowing neon dot on the geo telemetry grid on the left to reveal target regional candidate insights.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE JOBS LIST */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold">Active Postings</h3>
                  <p className="text-xs text-gray-500">Inspect listed jobs, metrics, and report states.</p>
                </div>
                <Button 
                  onClick={() => setActiveTab("post")}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10"
                >
                  Post Another Job
                </Button>
              </div>

              {companyJobs.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-base font-bold text-gray-400">No Active Jobs Found</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-6">Create your first job posting using our simple details form to initiate AI talent matches.</p>
                  <Button 
                    onClick={() => setActiveTab("post")}
                    className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shadow-purple-500/20"
                  >
                    Post A Job Now
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyJobs.map((job) => {
                    const applicantsCount = companyApplicants.filter(a => a.jobId === job.id).length;
                    const fraudResult = calculateFraudProbability(job);
                    return (
                      <Card key={job.id} className={`bg-white/[0.02] border-white/10 hover:border-purple-500/30 transition-all shadow-md relative ${job.isFake ? 'border-red-500/40' : ''}`}>
                        
                        {job.isFake && (
                          <div className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 z-10 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Flagged Fake / Moderation Review
                          </div>
                        )}
                        {!job.isFake && fraudResult.score >= 40 && (
                          <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 z-10 animate-pulse cursor-help" title={fraudResult.reasons.join(". ")}>
                            <AlertTriangle className="w-3 h-3" /> AI Suspect Fraud Flag ({fraudResult.score}%)
                          </div>
                        )}

                        <CardContent className="p-6 space-y-4">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                              {job.salary}
                            </span>
                            <h4 className="text-lg font-bold text-white mt-2 leading-snug">{job.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-600" /> {job.location}</span>
                              <span>•</span>
                              <span>{job.experience} exp</span>
                              {job.remote && (
                                <>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-semibold border border-cyan-500/20 uppercase tracking-wide">Remote</span>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{job.description}</p>

                          <div className="flex flex-wrap gap-1">
                            {job.skills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-gray-300 font-mono">{skill}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                            <div>
                              <div className="text-sm font-extrabold text-purple-400">{job.views}</div>
                              <div className="text-[9px] uppercase tracking-wider text-gray-500">Views</div>
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-cyan-400">{job.engagement}%</div>
                              <div className="text-[9px] uppercase tracking-wider text-gray-500">Engage</div>
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-emerald-400">{applicantsCount}</div>
                              <div className="text-[9px] uppercase tracking-wider text-gray-500">Applicants</div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center gap-3 border-t border-white/10 pt-4">
                            <button
                              onClick={() => handleFlagAsFake(job.id, job.title)}
                              className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Flag Job for Demo Admin Verification"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Flag
                            </button>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  setActiveTab("applicants");
                                }}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-7 px-3 text-xs"
                              >
                                Review
                              </Button>
                              <button 
                                onClick={() => handleJobDelete(job.id, job.title)}
                                className="w-7 h-7 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                title="Remove Job Posting"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POST JOB PAGE */}
          {activeTab === "post" && (
            <Card className="bg-white/[0.02] border-white/10 shadow-2xl max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-400" />
                  Post an Active Position
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Input job details. Our AI matcher will automatically parse requirements and synchronize candidate recommendations in real time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-semibold text-gray-300">Job Title</Label>
                    <Input 
                      id="title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer" 
                      required 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-xs font-semibold text-gray-300">Salary Range</Label>
                      <Input 
                        id="salary"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                        placeholder="e.g. $130,000 - $160,000" 
                        required 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-xs font-semibold text-gray-300">Experience Needed</Label>
                      <Input 
                        id="experience"
                        value={jobForm.experience}
                        onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                        placeholder="e.g. 4+ years" 
                        required 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-semibold text-gray-300">Location</Label>
                      <Input 
                        id="location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="e.g. Austin, TX or Remote" 
                        required 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-xs font-semibold text-gray-300">Application Deadline</Label>
                      <Input 
                        id="deadline"
                        type="date"
                        value={jobForm.deadline}
                        onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                        required 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="skills" className="text-xs font-semibold text-gray-300">Required Skill Keywords</Label>
                      <span className="text-[10px] text-gray-500">Separated by commas</span>
                    </div>
                    <Input 
                      id="skills"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                      placeholder="React, TypeScript, TailwindCSS, Next.js" 
                      required 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-semibold text-gray-300">Job Description</Label>
                    <textarea 
                      id="description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      rows={5}
                      placeholder="Describe core engineering targets, modular systems responsibility, optimization metrics..."
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <input 
                      type="checkbox" 
                      id="remote"
                      checked={jobForm.remote}
                      onChange={(e) => setJobForm({ ...jobForm, remote: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-500 border-white/20 bg-white/5 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <Label htmlFor="remote" className="text-xs font-bold text-white cursor-pointer select-none">Remote Option Available</Label>
                      <p className="text-[10px] text-gray-500">Allows candidates globally to apply via asynchronous channels.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("jobs")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-10 px-4"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-10 px-6 border-0 shadow-lg shadow-purple-500/25"
                    >
                      Publish Posting
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: APPLICANTS AI RANKER AND PIPELINE */}
          {activeTab === "applicants" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Candidates list */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      AI Ranker Pool
                    </h3>
                    <p className="text-[11px] text-gray-500">Sorted dynamically by match score.</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {companyApplicants.length} Candidates
                  </span>
                </div>

                {companyApplicants.length === 0 ? (
                  <div className="text-center py-12 border border-white/10 rounded-xl bg-white/[0.01]">
                    <p className="text-xs text-gray-500">No applicants yet. Post a job to generate mock applications.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {/* Sort candidates by overall matchScore descending */}
                    {[...companyApplicants]
                      .sort((a, b) => b.matchScore - a.matchScore)
                      .map((applicant) => {
                        const isSelected = selectedApplicant && selectedApplicant.id === applicant.id;
                        return (
                          <div 
                            key={applicant.id}
                            onClick={() => setSelectedApplicant(applicant)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${isSelected ? 'bg-purple-900/10 border-purple-500/40 shadow-md' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${applicant.avatarColor} flex items-center justify-center font-bold text-white shadow-inner text-sm`}>
                                  {applicant.candidateName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-white flex items-center gap-1">{applicant.candidateName}</h4>
                                  <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{applicant.jobTitle}</p>
                                  <p className="text-[9px] text-gray-600 mt-0.5">{new Date(applicant.appliedAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1.5">
                                <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10px] font-mono font-bold text-purple-400">
                                  <BrainCircuit className="w-3 h-3" />
                                  {applicant.matchScore}%
                                </div>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  applicant.status === 'Hired' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                  applicant.status === 'Rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                                  applicant.status === 'Shortlisted' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                                  applicant.status === 'Interview Scheduled' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' :
                                  'bg-white/10 text-gray-400 border border-white/10'
                                }`}>
                                  {applicant.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Right Column: AI Detail Breakdown Card */}
              <div className="lg:col-span-7">
                {selectedApplicant ? (
                  <Card className="bg-white/[0.02] border-white/10 shadow-2xl relative">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full ${selectedApplicant.avatarColor} flex items-center justify-center font-bold text-xl text-white shadow-inner`}>
                            {selectedApplicant.candidateName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">{selectedApplicant.candidateName}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>Applied for: </span>
                              <span className="text-purple-400 font-semibold">{selectedApplicant.jobTitle}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 mt-1 font-mono">
                              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-600" /> {selectedApplicant.candidateEmail}</span>
                              {selectedApplicant.candidatePhone && (
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-600" /> {selectedApplicant.candidatePhone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-end gap-2 justify-between sm:justify-start">
                          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-sm flex items-center gap-1 shadow-md shadow-purple-500/25">
                            <BrainCircuit className="w-4 h-4" />
                            {selectedApplicant.matchScore}% Match
                          </div>
                          <span className="text-[10px] text-gray-500">AI Verified Score</span>
                        </div>
                      </div>

                      {/* Schedule Summary details */}
                      {selectedApplicant.status === "Interview Scheduled" && selectedApplicant.interviewDate && (
                        <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between text-xs text-cyan-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Interview: <strong>{selectedApplicant.interviewDate}</strong> at <strong>{selectedApplicant.interviewTime}</strong>
                            </span>
                          </div>
                          <a 
                            href={selectedApplicant.interviewLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" /> Start Meet
                          </a>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6 max-h-[500px] overflow-y-auto pr-1">
                      
                      {/* AI Structural Rating Sliders */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-purple-400" /> AI Diagnostic Breakdown
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { name: "Resume Quality", score: selectedApplicant.resumeQuality, color: "bg-purple-500" },
                            { name: "Skill Match Core", score: selectedApplicant.skillMatch, color: "bg-cyan-500" },
                            { name: "Experience Tenure", score: selectedApplicant.experienceScore, color: "bg-pink-500" },
                            { name: "ATS Semantic Score", score: selectedApplicant.atsScore, color: "bg-emerald-500" }
                          ].map((slider, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                              <div className="flex justify-between items-center text-xs font-medium text-gray-300">
                                <span>{slider.name}</span>
                                <span className="font-mono font-bold text-white">{slider.score}/100</span>
                              </div>
                              <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                                <div className={`h-full ${slider.color}`} style={{ width: `${slider.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Keywords Matched Check */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate Credentials</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedApplicant.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" /> {skill}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-gray-500 font-mono">
                            {selectedApplicant.experienceYears} Years Experience
                          </span>
                        </div>
                      </div>

                      {/* Bio Summary */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Resume Executive Summary
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                          {selectedApplicant.resumeSummary}
                        </p>
                      </div>

                      {/* AI Qualitative Feedback */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Recruiter Diagnostics</h4>
                        <div className="space-y-2 bg-purple-950/20 p-4 rounded-xl border border-purple-500/10">
                          {selectedApplicant.atsFeedback.map((tip, idx) => (
                            <div key={idx} className="flex gap-2 text-xs leading-relaxed text-gray-300">
                              <span className="text-purple-400 font-semibold shrink-0">✔</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action Controls */}
                      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
                        {selectedApplicant.status !== "Interview Scheduled" && (
                          <Button 
                            onClick={() => setSchedulerApplicantId(selectedApplicant.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold h-10 px-4 flex items-center gap-1 border-0"
                          >
                            <Calendar className="w-4 h-4" /> Schedule Interview
                          </Button>
                        )}
                        
                        {selectedApplicant.status !== "Shortlisted" && selectedApplicant.status !== "Hired" && (
                          <Button 
                            onClick={() => handleStatusUpdate(selectedApplicant.id, "Shortlisted")}
                            className="bg-blue-600 hover:bg-blue-500 text-white h-10 px-4 border-0"
                          >
                            Shortlist Candidate
                          </Button>
                        )}

                        {selectedApplicant.status !== "Hired" && (
                          <Button 
                            onClick={() => handleStatusUpdate(selectedApplicant.id, "Hired")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-10 px-4 border-0"
                          >
                            Hire Candidate
                          </Button>
                        )}

                        {selectedApplicant.status !== "Rejected" && (
                          <Button 
                            onClick={() => handleStatusUpdate(selectedApplicant.id, "Rejected")}
                            className="bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 h-10 px-4"
                          >
                            Reject
                          </Button>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-[500px] border border-dashed border-white/10 rounded-2xl bg-white/[0.01] flex flex-col items-center justify-center text-center p-6">
                    <Zap className="w-12 h-12 text-purple-600/30 mb-4" />
                    <h4 className="text-sm font-bold text-gray-400">Select a Candidate for AI Scan</h4>
                    <p className="text-xs text-gray-600 max-w-xs mt-1">Review deep technical matches, education levels, strengths and keyword diagnostics computed by our engine.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: COMPANY PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <Card className="bg-white/[0.02] border-white/10 shadow-2xl max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Company Profile Settings
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Update public-facing metadata. Synchronizes instantly across job listings and candidate portal feeds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="logoEmoji" className="text-xs font-semibold text-gray-300">Logo Icon / Emoji</Label>
                      <Input 
                        id="logoEmoji"
                        value={profileForm.logoEmoji}
                        onChange={(e) => setProfileForm({ ...profileForm, logoEmoji: e.target.value })}
                        className="bg-white/5 border-white/10 text-white text-center text-lg focus-visible:ring-purple-500"
                        maxLength={2}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="cName" className="text-xs font-semibold text-gray-300">Company Name</Label>
                      <Input 
                        id="cName"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cWeb" className="text-xs font-semibold text-gray-300">Website Address</Label>
                    <Input 
                      id="cWeb"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      placeholder="e.g. https://techcorp.ai"
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 font-mono text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cInd" className="text-xs font-semibold text-gray-300">Industry Segment</Label>
                      <Input 
                        id="cInd"
                        value={profileForm.industry}
                        onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cSize" className="text-xs font-semibold text-gray-300">Team Size Bracket</Label>
                      <Input 
                        id="cSize"
                        value={profileForm.teamSize}
                        onChange={(e) => setProfileForm({ ...profileForm, teamSize: e.target.value })}
                        placeholder="e.g. 250-500 employees"
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cDesc" className="text-xs font-semibold text-gray-300">Company Bio / Description</Label>
                    <textarea 
                      id="cDesc"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-500 text-white h-10 px-6 border-0 shadow-lg shadow-purple-500/25"
                    >
                      Save Profile Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      {/* POPUP MODAL: INTERVIEW DATE-TIME SCHEDULER */}
      {schedulerApplicantId !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-black border border-white/10 rounded-2xl shadow-2xl p-6 relative"
          >
            <button 
              onClick={() => setSchedulerApplicantId(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Schedule Virtual Interview
            </h3>
            <p className="text-xs text-gray-500 mb-6">Set a virtual conference. It creates live meeting rooms and logs logs to database.</p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schDate" className="text-xs font-semibold text-gray-300">Select Date</Label>
                  <Input 
                    id="schDate"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schTime" className="text-xs font-semibold text-gray-300">Select Time</Label>
                  <Input 
                    id="schTime"
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schLink" className="text-xs font-semibold text-gray-300">Meeting Room Link</Label>
                <Input 
                  id="schLink"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-cyan-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                <Button 
                  type="button" 
                  onClick={() => setSchedulerApplicantId(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold h-9 text-xs border-0"
                >
                  Confirm Schedule
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <AIChatbot />
    </div>
  );
}
