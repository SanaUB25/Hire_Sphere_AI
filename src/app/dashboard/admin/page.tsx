"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, BrainCircuit, Users, Briefcase, AlertTriangle, 
  Trash2, ToggleLeft, ToggleRight, Search, Terminal, 
  LogOut, CheckCircle, RefreshCw, X, ShieldAlert,
  Sliders, UserX
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AIChatbot from "@/components/AIChatbot";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { 
  getDatabase, 
  verifyCompany, 
  banUser, 
  removeJob, 
  dismissReport, 
  calculateFraudProbability,
  HireSphereDB
} from "@/lib/db";

export default function AdminDashboard() {
  const router = useRouter();
  const [db, setDb] = useState<HireSphereDB | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "jobs" | "users" | "logs">("overview");
  
  // Local interface controllers
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auth context for route guarding
  const { user, loading: authLoading, logout } = useAuth();

  // Security Route Guard check
  useEffect(() => {
    if (authLoading) return;
    if (!user?.isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      if (user.role === "employer") {
        router.push("/dashboard/employer");
      } else {
        router.push("/dashboard/candidate");
      }
    }
  }, [user, authLoading, router]);

  // Sync state
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

  // Auto-scroll terminal log to bottom
  useEffect(() => {
    if (activeTab === "logs" && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, db?.logs]);

  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-red-500 animate-spin" />
          <p className="text-gray-400 font-mono text-sm tracking-widest">LOADING SECURE ADMIN NODE...</p>
        </div>
      </div>
    );
  }

  // Toast dispatch handler
  const showToast = (message: string, type: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Handler: Verify/Unverify Employer
  const handleToggleVerification = (companyId: string, currentStatus: boolean, name: string) => {
    verifyCompany(companyId, !currentStatus);
    showToast(`Company "${name}" is now ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}.`, "success");
    setDb(getDatabase()); // Refresh
  };

  // Handler: Ban/Unban User
  const handleToggleBan = (email: string, currentBanStatus: boolean, name: string) => {
    banUser(email, !currentBanStatus);
    showToast(`User "${name}" has been ${!currentBanStatus ? 'BANNED' : 'UNBANNED'}.`, "info");
    setDb(getDatabase());
  };

  // Handler: Deleting Fake Job Posting
  const handleDeleteJob = (jobId: string, title: string) => {
    removeJob(jobId);
    showToast(`Moderated & Deleted fake position: "${title}"`, "success");
    setDb(getDatabase());
  };

  // Handler: Dismiss Flag
  const handleDismissReport = (reportId: string) => {
    dismissReport(reportId);
    showToast("Abuse flag dismissed and resolved.", "info");
    setDb(getDatabase());
  };

  // ----------------------------------------------------
  // PLATFORM METRICS SUMMARIES
  // ----------------------------------------------------
  const totalUsersCount = db.users.length;
  const bannedUsersCount = db.users.filter(u => u.banned).length;
  const verifiedCompaniesCount = db.companies.filter(c => c.verified).length;
  const activeJobsCount = db.jobs.length;
  const fakeJobsCount = db.jobs.filter(j => j.isFake).length;
  const activeReports = db.reports.filter(r => !r.resolved);

  // Filters candidates and employers list
  const filteredUsers = db.users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filters jobs list
  const filteredJobs = db.jobs.filter(job => 
    job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    db.companies.find(c => c.id === job.companyId)?.name.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      
      {/* Visual background glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* Floating Notifications System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto p-4 rounded-xl border border-red-500/20 bg-black/85 backdrop-blur-xl shadow-2xl flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mt-0.5">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-xs font-semibold text-gray-200">{t.message}</div>
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

      {/* Left Navigation bar */}
      <aside className="w-64 border-r border-white/10 bg-black/75 backdrop-blur-xl p-6 flex flex-col hidden md:flex relative z-20">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HireSphere<span className="text-red-500">.admin</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("overview")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Sliders className="w-4 h-4 text-red-400" />
            System Overview
          </button>
          <button 
            onClick={() => setActiveTab("companies")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "companies" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Verify Employers ({verifiedCompaniesCount}/{db.companies.length})
          </button>
          <button 
            onClick={() => setActiveTab("jobs")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "jobs" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Briefcase className="w-4 h-4 text-purple-400" />
            Remove Fake Jobs {fakeJobsCount > 0 && <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/35 rounded text-[8px] font-bold">{fakeJobsCount}</span>}
          </button>
          <button 
            onClick={() => setActiveTab("users")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <UserX className="w-4 h-4 text-pink-400" />
            Ban Users {bannedUsersCount > 0 && <span className="px-1.5 py-0.2 bg-white/10 text-white rounded text-[8px] font-mono">{bannedUsersCount} banned</span>}
          </button>
          <button 
            onClick={() => setActiveTab("logs")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "logs" ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            Monitor Activity Log
          </button>
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
          <button onClick={async () => { await logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut className="w-4 h-4" />
            Exit Admin Node
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Header Topbar */}
        <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-500/40 flex items-center justify-center text-red-400 text-sm shadow-md font-mono select-none">
              #S
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                SECURE SANDBOX TERMINAL
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="System Live Mode" />
              </h1>
              <p className="text-[10px] text-gray-500 font-mono">Platform Admin Engine v1.0.4 • Connected</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setDb(getDatabase());
                showToast("System state re-indexed from local cache.", "info");
              }}
              className="border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 h-8 text-[11px] font-mono px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> SYNC_REFL
            </Button>
            <div className="px-2.5 py-1 rounded bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-widest">
              ROOT_AUTH
            </div>
          </div>
        </header>

        {/* Tab Displays */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          
          {/* TAB 1: SYSTEM OVERVIEW & PLATFORM STATS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Platform Users", value: totalUsersCount, change: `${bannedUsersCount} account locks`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Verified Employers", value: verifiedCompaniesCount, change: `${db.companies.length - verifiedCompaniesCount} unverified`, icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "Active Open Jobs", value: activeJobsCount, change: `${fakeJobsCount} flagged suspicious`, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "Unresolved Abuse Flags", value: activeReports.length, change: "Requires action", icon: AlertTriangle, color: activeReports.length > 0 ? "text-red-400 animate-pulse" : "text-gray-400", bg: activeReports.length > 0 ? "bg-red-500/10 border border-red-500/25" : "bg-white/5" },
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Outstanding Abuse Flags list */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Flagged Abuse Reports ({activeReports.length})
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono">Job postings reported as scams, fake, or spam.</p>
                    </div>
                  </div>

                  {activeReports.length === 0 ? (
                    <div className="text-center py-12 border border-white/5 rounded-xl bg-white/[0.01] space-y-2">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-xs text-gray-400 font-semibold">Clean Moderation Sheet</p>
                      <p className="text-[10px] text-gray-500">No active job listings are flagged by users.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeReports.map((report) => (
                        <Card key={report.id} className="bg-red-950/5 border-red-500/20 shadow-md">
                          <CardContent className="p-4 sm:p-5 space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[8px] font-mono font-bold text-red-400 uppercase tracking-widest">
                                  Flag ID: {report.id}
                                </span>
                                <h4 className="text-sm font-extrabold text-white mt-1.5">
                                  Scam Flagged: <span className="text-red-400">{report.jobTitle}</span>
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">Posted By: {report.companyName}</p>
                              </div>
                              <span className="text-[9px] text-gray-600 font-mono">{new Date(report.reportedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                              <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold block mb-1">Reporter Reason:</span>
                              <p className="text-xs text-gray-300 leading-relaxed italic">&quot;{report.reason}&quot;</p>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                              <Button 
                                onClick={() => handleDismissReport(report.id)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-7 px-3 text-xs"
                              >
                                Dismiss Report
                              </Button>
                              <Button 
                                onClick={() => handleDeleteJob(report.jobId, report.jobTitle)}
                                className="bg-red-600 hover:bg-red-500 text-white h-7 px-3 text-xs border-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Fake Job
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* System Activity Summary scroll box */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        Live Console Activity
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono">Recent operations log stream.</p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab("logs")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-6 text-[10px] font-mono px-2"
                    >
                      EXP_MON
                    </Button>
                  </div>

                  <div className="bg-black/90 rounded-xl border border-white/10 p-4 font-mono text-[10.5px] leading-relaxed text-emerald-500 h-[380px] overflow-y-auto space-y-3.5 shadow-inner">
                    {db.logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="border-b border-white/5 pb-2">
                        <div className="flex justify-between text-gray-500 text-[9px] mb-0.5">
                          <span>[{log.timestamp.replace("T", " ").substring(0, 19)}]</span>
                          <span className="text-red-500/80">{log.user}</span>
                        </div>
                        <div>
                          <span className="text-white font-bold">{log.action}:</span>{" "}
                          <span className="text-emerald-400/90">{log.details || "No metadata description recorded"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: VERIFY EMPLOYERS */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold">Company License Verifications</h3>
                  <p className="text-xs text-gray-500">Toggle employer verification profiles. Verified companies display the cyan Shield badge next to their listings.</p>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01] shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="p-4">Employer Company</th>
                        <th className="p-4">Industry Segment</th>
                        <th className="p-4">Team Size</th>
                        <th className="p-4">Portal Website</th>
                        <th className="p-4">License Verification</th>
                        <th className="p-4 text-center">Toggle State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {db.companies.map((comp) => (
                        <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold flex items-center gap-2">
                            <span className="text-lg select-none">{comp.logoEmoji}</span>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-white font-bold">{comp.name}</span>
                                {comp.verified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">ID: {comp.id}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{comp.industry}</td>
                          <td className="p-4 text-gray-400">{comp.teamSize}</td>
                          <td className="p-4 text-cyan-400 font-mono text-[11px] underline">
                            <a href={comp.website} target="_blank" rel="noopener noreferrer">{comp.website}</a>
                          </td>
                          <td className="p-4">
                            {comp.verified ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase tracking-wider">
                                Verified Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-[9px] uppercase tracking-wider">
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleToggleVerification(comp.id, comp.verified, comp.name)}
                              className="focus:outline-none transition-all scale-105 cursor-pointer"
                            >
                              {comp.verified ? (
                                <ToggleRight className="w-10 h-10 text-cyan-400" />
                              ) : (
                                <ToggleLeft className="w-10 h-10 text-gray-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REMOVE FAKE JOBS */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold">Remove Scam &amp; Fake Job Listings</h3>
                  <p className="text-xs text-gray-500">Scan and permanently remove postings flagged as suspicious or reported by candidates.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    type="text"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    placeholder="Search by job title or company..."
                    className="bg-white/5 border-white/10 pl-9 text-xs text-white focus-visible:ring-purple-500"
                  />
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 border border-white/5 rounded-xl bg-white/[0.01]">
                  <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No jobs match your search queries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => {
                    const comp = db.companies.find(c => c.id === job.companyId) || { name: "Unknown Company", logoEmoji: "🏢" };
                    const fraudResult = calculateFraudProbability(job);
                    return (
                      <Card key={job.id} className={`bg-white/[0.02] border-white/10 hover:border-white/20 transition-all shadow-md relative ${job.isFake || fraudResult.score >= 40 ? 'border-red-500/40' : ''}`}>
                        <CardContent className="p-5 space-y-4">
                          
                          {/* Fake Alert indicator */}
                          {job.isFake ? (
                            <div className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Reported Scam
                            </div>
                          ) : fraudResult.score >= 40 ? (
                            <div className="absolute top-3 right-3 bg-red-500/25 border border-red-500/45 text-red-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 animate-pulse cursor-help" title={fraudResult.reasons.join(". ")}>
                              <AlertTriangle className="w-3 h-3" /> AI Suspect Fraud ({fraudResult.score}%)
                            </div>
                          ) : null}

                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                              <span>{comp.logoEmoji}</span>
                              <span>{comp.name}</span>
                            </div>
                            <h4 className="text-base font-bold text-white mt-1.5">{job.title}</h4>
                            <p className="text-[10px] text-gray-600 mt-0.5">Posted: {new Date(job.postedAt).toLocaleDateString()} • Exp: {job.experience}</p>
                          </div>

                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{job.description}</p>

                          <div className="flex flex-wrap gap-1">
                            {job.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500">{s}</span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                            <span className="text-[10.5px] font-bold text-red-400/80 font-mono">{job.salary}</span>
                            <Button 
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="bg-red-600 hover:bg-red-500 text-white h-7 px-3 text-xs border-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Listing
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BAN USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/10 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold">Ban Malicious Accounts</h3>
                  <p className="text-xs text-gray-500">Deactivate candidate and recruiter logins to restrict malicious activities and platform exploits.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or role..."
                    className="bg-white/5 border-white/10 pl-9 text-xs text-white focus-visible:ring-red-500"
                  />
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01] shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="p-4">User Account</th>
                        <th className="p-4">Authentication Email</th>
                        <th className="p-4">Ecosystem Role</th>
                        <th className="p-4">Registration</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-center">Security Lock Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user) => {
                        const isSelf = user.email === "admin@hiresphere.ai";
                        return (
                          <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-bold">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 flex items-center justify-center font-bold text-white text-xs">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{user.name}</div>
                                  <span className="text-[9px] text-gray-500 font-mono">UID: {user.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-300 font-mono text-[11px]">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                user.role === 'employer' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400 font-mono text-[11px]">{user.registeredAt}</td>
                            <td className="p-4">
                              {user.banned ? (
                                <span className="px-2 py-0.5 rounded bg-pink-500/15 border border-pink-500/20 text-pink-500 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                  BANNED / LOCKED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                                  Active Clear
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {isSelf ? (
                                <span className="text-[10px] text-gray-600 font-semibold">Non-blockable</span>
                              ) : (
                                <Button
                                  onClick={() => handleToggleBan(user.email, user.banned, user.name)}
                                  className={`h-7 px-3 text-[10.5px] font-semibold border-0 ${
                                    user.banned 
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                      : 'bg-pink-950 hover:bg-pink-900 border border-pink-500/20 text-pink-400'
                                  }`}
                                >
                                  {user.banned ? 'Unban Account' : 'Ban Account'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TERMINAL ACTIVITY MONITOR */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-500" />
                    Platform Activity Log Stream
                  </h3>
                  <p className="text-xs text-gray-500">Live operational events audit trail for sandbox evaluations.</p>
                </div>
                <Button 
                  onClick={() => {
                    if (confirm("Proceed to reset and purge system terminal database? (Resets LocalStorage)")) {
                      localStorage.removeItem("hiresphere_mock_db");
                      setDb(getDatabase());
                      showToast("Terminal session re-initialized.", "success");
                    }
                  }}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 h-8 text-xs"
                >
                  PURGE_CACHE
                </Button>
              </div>

              {/* Developer Terminal Box */}
              <div className="relative rounded-2xl border border-white/10 bg-black/95 shadow-2xl p-6 overflow-hidden">
                {/* Console circles */}
                <div className="absolute top-4 left-6 flex gap-1.5 z-10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="w-full text-center border-b border-white/5 pb-4 mb-4 text-[10px] font-mono text-gray-600">
                  hiresphere.ai:/usr/bin/sandbox-logs --listen
                </div>

                <div className="h-[450px] overflow-y-auto space-y-4 font-mono text-xs pr-2 leading-relaxed text-emerald-500 scrollbar-thin select-text">
                  <div className="text-gray-500">{"// INITIALIZING SECURE EVENT SOCKET HANDLERS..."}</div>
                  <div className="text-cyan-400">{"// CONNECTED TO ECOSYSTEM PORT 443"}</div>
                  
                  {db.logs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-lg bg-white/2 border border-white/5 space-y-1 hover:bg-white/5 transition-all">
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="text-red-500/80">&gt; USER: {log.user}</span>
                        <span>TIMESTAMP: {log.timestamp.replace("T", " ").substring(0, 19)}</span>
                      </div>
                      <div>
                        <span className="text-white font-bold">ACTION:</span>{" "}
                        <span className="text-emerald-400">{log.action}</span>
                      </div>
                      {log.details && (
                        <div className="text-[11px] text-gray-400 bg-black/40 p-2 rounded border border-white/5 mt-1 font-sans">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400 block mb-0.5">Payload Meta:</span>
                          {log.details}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={consoleEndRef} className="text-gray-600 animate-pulse">{"// END OF STREAM • LISTENING FOR PLATFORM TRIGGERS..."}</div>
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
