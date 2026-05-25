"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import { getDatabase } from "@/lib/db";
import { recommendJobsForCandidate } from "@/lib/hiringModel";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Chatbot knowledge base built from live data
function buildContext() {
  const db = getDatabase();
  const jobs = db.jobs.filter(j => !j.isFake);
  const companies = db.companies;
  const applicants = db.applicants;
  return { jobs, companies, applicants, allSkills: Array.from(new Set(jobs.flatMap(j => j.skills))) };
}

async function generateResponse(input: string): Promise<string> {
  const q = input.toLowerCase().trim();
  const ctx = buildContext();

  // Greetings
  if (/^(hi|hello|hey|greetings|yo|sup)/.test(q)) {
    return "Hello! 👋 I'm the HireSphere AI Assistant. I can help you with:\n\n• **Job Search** — Ask about available positions\n• **Resume Tips** — Get feedback on your profile\n• **Interview Prep** — Practice common questions\n• **Career Advice** — Explore career paths\n• **Hiring Insights** — Understand candidate scoring\n\nWhat would you like to explore?";
  }

  // Job listings
  if (q.includes("job") && (q.includes("list") || q.includes("available") || q.includes("open") || q.includes("show") || q.includes("what"))) {
    const jobList = ctx.jobs.slice(0, 5).map((j, i) => {
      const company = ctx.companies.find(c => c.id === j.companyId);
      return `${i + 1}. **${j.title}** at ${company?.name || "Unknown"} — ${j.salary} (${j.location})`;
    }).join("\n");
    return `Here are the current open positions:\n\n${jobList}\n\nWould you like details on any specific role?`;
  }

  // Skills in demand
  if (q.includes("skill") && (q.includes("demand") || q.includes("popular") || q.includes("top") || q.includes("trending"))) {
    const skillCount: Record<string, number> = {};
    ctx.jobs.forEach(j => j.skills.forEach(s => { skillCount[s] = (skillCount[s] || 0) + 1; }));
    const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const list = topSkills.map(([s, c], i) => `${i + 1}. **${s}** — found in ${c} job(s)`).join("\n");
    return `🔥 Top in-demand skills on HireSphere:\n\n${list}\n\nFocusing on these will boost your match scores significantly!`;
  }

  // Resume tips
  if (q.includes("resume") || q.includes("cv")) {
    return "📝 **AI Resume Tips for 2026:**\n\n1. **Use action verbs** — \"Engineered\", \"Optimized\", \"Deployed\" instead of \"Worked on\"\n2. **Quantify impact** — \"Reduced load time by 40%\" beats \"Improved performance\"\n3. **Match keywords** — Mirror the job description's exact terms for ATS parsing\n4. **Keep it concise** — 1-2 pages max, focus on relevant experience\n5. **Include links** — GitHub, portfolio, LinkedIn increase credibility\n6. **Skills section** — List specific technologies, not vague categories\n\nWant me to analyze your profile against a specific job?";
  }

  // Interview tips
  if (q.includes("interview") || q.includes("prepare") || q.includes("prep")) {
    return "🎯 **Interview Preparation Guide:**\n\n**Behavioral Questions:**\n• Use the STAR method (Situation, Task, Action, Result)\n• Prepare 3-4 stories about challenges you've overcome\n\n**Technical Questions:**\n• Practice system design (scalability, databases, caching)\n• Review data structures & algorithms fundamentals\n• Be ready to code on a whiteboard or shared editor\n\n**Tips:**\n• Research the company's tech stack and recent projects\n• Prepare thoughtful questions to ask the interviewer\n• Practice explaining complex concepts simply\n\nWant me to run a mock interview question?";
  }

  // Salary info
  if (q.includes("salary") || q.includes("pay") || q.includes("compensation")) {
    const salaries = ctx.jobs.map(j => ({ title: j.title, salary: j.salary }));
    const list = salaries.slice(0, 5).map(s => `• **${s.title}**: ${s.salary}`).join("\n");
    return `💰 **Salary Ranges on HireSphere:**\n\n${list}\n\nSalaries vary by experience, location, and company size. Remote roles tend to offer competitive packages regardless of location.`;
  }

  // Company info
  if (q.includes("company") || q.includes("companies") || q.includes("employer")) {
    const list = ctx.companies.map(c => `• ${c.logoEmoji} **${c.name}** — ${c.industry} (${c.verified ? "✅ Verified" : "⚠️ Unverified"})`).join("\n");
    return `🏢 **Companies on HireSphere:**\n\n${list}\n\nVerified companies have completed our identity verification process. Always check the verification badge!`;
  }

  // Job recommendations
  if (q.includes("recommend") || q.includes("suggest") || q.includes("match") || q.includes("fit")) {
    const recs = await recommendJobsForCandidate(["React", "TypeScript", "Next.js", "CSS", "HTML5", "TailwindCSS"], 3, "B.S. Computer Science");
    const top3 = recs.slice(0, 3).map((r, i) => `${i + 1}. **${r.jobTitle}** at ${r.companyName} — ${r.matchScore}% match\n   ${r.reasoning}`).join("\n\n");
    return `🎯 **Top Job Recommendations for Your Profile:**\n\n${top3}\n\nThese are based on your skills, experience, and education. Update your profile for more accurate matches!`;
  }

  // ATS score
  if (q.includes("ats") || q.includes("score") || q.includes("ranking")) {
    return "📊 **Understanding ATS Scores:**\n\nOur AI evaluates candidates across 5 dimensions:\n\n• **Skills Match (30%)** — How well your skills align with job requirements\n• **Experience (25%)** — Years and relevance of your work history\n• **Education (15%)** — Academic background and institution tier\n• **Resume Quality (15%)** — Format, keywords, and structure\n• **Culture Fit (15%)** — Industry alignment and soft skill indicators\n\nScores above 85% are considered \"Strong Hire\" candidates. Aim to maximize your skills match for the biggest impact!";
  }

  // Fraud/scam detection
  if (q.includes("scam") || q.includes("fake") || q.includes("fraud")) {
    return "🛡️ **Fraud Detection & Safety:**\n\nOur AI Fraud Shield scans every job posting for:\n\n• Extreme salary-to-experience ratios\n• Phishing keywords (seed phrase, private key, etc.)\n• Unverified company profiles\n• Suspicious engagement patterns\n\n**Red flags to watch for:**\n• \"Guaranteed\" high income with no experience needed\n• Requests for personal financial information\n• Vague job descriptions with urgency pressure\n\nAlways report suspicious listings using the Report button!";
  }

  // Remote work
  if (q.includes("remote") || q.includes("work from home") || q.includes("hybrid")) {
    const remoteJobs = ctx.jobs.filter(j => j.remote);
    return `🌍 **Remote Opportunities:**\n\nWe currently have **${remoteJobs.length}** remote-friendly positions. Remote roles offer:\n\n• Flexible work schedules\n• Access to global talent pools\n• Competitive salaries regardless of location\n• Better work-life balance\n\nFilter by \"Remote\" in the Job Recommendations tab to see all available options!`;
  }

  // How it works
  if (q.includes("how") && (q.includes("work") || q.includes("use") || q.includes("platform"))) {
    return "⚡ **How HireSphere.ai Works:**\n\n**For Candidates:**\n1. Build your profile with skills & experience\n2. AI analyzes your resume and generates ATS scores\n3. Get personalized job recommendations\n4. Apply with one click and track applications\n5. Prepare with AI mock interviews\n\n**For Employers:**\n1. Post job openings with requirements\n2. AI ranks and scores all applicants\n3. Review detailed candidate match reports\n4. Schedule interviews directly in-platform\n5. Monitor hiring pipeline analytics\n\nNeed help with anything specific?";
  }

  // Thank you
  if (q.includes("thank") || q.includes("thanks")) {
    return "You're welcome! 😊 Feel free to ask anytime. Good luck with your hiring journey! 🚀";
  }

  // Default fallback
  return "I'm your HireSphere AI assistant! I can help with:\n\n• **\"Show available jobs\"** — Browse open positions\n• **\"Top skills in demand\"** — See trending skills\n• **\"Resume tips\"** — Improve your CV\n• **\"Interview prep\"** — Practice questions\n• **\"Recommend jobs\"** — Get personalized matches\n• **\"How does it work\"** — Platform overview\n• **\"Salary info\"** — Compensation ranges\n\nTry asking one of these! 💡";
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! 👋 I'm the **HireSphere AI Assistant**. I can help you find jobs, prepare for interviews, improve your resume, and more. What can I help you with?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    "Show available jobs",
    "Top skills in demand",
    "Resume tips",
    "Interview prep",
    "Salary info"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      const response = await generateResponse(userMsg.content);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-cyan-300">{part.slice(2, -2)}</strong>;
      }
      if (part.includes("\n")) {
        return part.split("\n").map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line.startsWith("• ") ? <span className="ml-3 flex items-start"><span className="text-cyan-500 mr-2 mt-[2px]">•</span><span>{line.substring(2)}</span></span> : line}
          </React.Fragment>
        ));
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer group"
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 1), rgba(139, 92, 246, 1))",
              boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(139, 92, 246, 0.4)",
            }}
          >
            <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(15, 15, 25, 0.95) 0%, rgba(5, 5, 10, 0.98) 100%)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 relative overflow-hidden"
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at top left, rgba(6,182,212,0.4), transparent 70%)" }} />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                  <BrainCircuit className="w-5 h-5 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0A0A14]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">HireSphere AI</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Your personal career copilot</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer relative z-10">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
              style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[14px] leading-relaxed shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-sm"
                      : "bg-white/[0.04] text-gray-200 rounded-bl-sm border border-white/[0.05] relative overflow-hidden"
                  }`}>
                    {msg.role === "assistant" && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500 opacity-50" />
                    )}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest opacity-80">Assistant</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
                    <div className={`text-[9px] mt-2 font-medium tracking-wider uppercase ${msg.role === "user" ? "text-cyan-100/50" : "text-gray-500"}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500 opacity-50" />
                    <motion.div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: 0.15, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.div className="w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, ease: "easeInOut" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Suggested Prompts & Input */}
            <div className="px-5 pb-5 pt-3"
              style={{ background: "linear-gradient(0deg, rgba(5,5,10,1) 60%, rgba(5,5,10,0) 100%)" }}>
              
              {/* Suggested Chips */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-1" style={{ scrollbarWidth: "none" }}>
                {messages.length < 3 && suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium text-cyan-100 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer flex-shrink-0"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={onSubmit}>
                <div className="flex items-center gap-2 rounded-2xl px-2 py-2 relative group transition-all duration-300"
                  style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  
                  {/* Focus Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none blur-md" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Message HireSphere AI..."
                    className="flex-1 bg-transparent text-white text-[14px] px-2 placeholder:text-gray-500 outline-none relative z-10"
                  />
                  <button type="submit" disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative z-10 overflow-hidden group/btn disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: input.trim() ? "rgba(255,255,255,0.1)" : "transparent" }}>
                    {input.trim() && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                    )}
                    <Send className={`w-4 h-4 ${input.trim() ? "text-white relative z-10 translate-x-[-2px] group-hover/btn:translate-x-[2px] transition-transform" : "text-gray-600"}`} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
