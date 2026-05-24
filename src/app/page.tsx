"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Users, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, Zap, Globe, Layers, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Smooth transitions and entrance animations
const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen porsche-bg text-white selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none grid-pattern opacity-[0.4]" />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px] animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse-glow" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-cyan-400 to-blue-500 p-[1px] premium-glow-cyan shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <div className="w-full h-full bg-black/50 backdrop-blur-md rounded-[11px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tighter">HireSphere<span className="text-gradient">.ai</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors duration-300">Platform</Link>
            <Link href="#stats" className="hover:text-white transition-colors duration-300">Capabilities</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors duration-300">Enterprise</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 h-10 px-6 rounded-full font-medium transition-all">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="h-10 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">Deploy Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-cyan-300 mb-10 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium tracking-wide">HireSphere OS 2.0 is now live</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
                Intelligence <br />
                <span className="text-gradient">Engineered for Talent.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-3xl mx-auto leading-relaxed font-light">
                The world's most sophisticated AI hiring platform. Predictive matching, autonomous resume analysis, and verified multi-dimensional talent scoring.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link href="/signup?role=candidate">
                  <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 rounded-full shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] w-full sm:w-auto group transition-all duration-300 transform hover:-translate-y-1">
                    Find Opportunities
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/signup?role=employer">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md rounded-full w-full sm:w-auto transition-all duration-300 hover:border-white/20">
                    Enterprise Solutions
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Dashboard Preview mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-28 relative mx-auto max-w-5xl group perspective-[1000px]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-blue-600/30 rounded-2xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
              <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:rotate-x-2">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                  <div className="bg-white/5 px-6 py-1.5 rounded-full text-xs text-gray-400 font-mono tracking-widest border border-white/5">OS.HIRESPHERE.AI</div>
                  <div className="w-16"></div> {/* Spacer for balance */}
                </div>
                
                <div className="grid grid-cols-12 gap-6 text-left">
                  {/* Sidebar */}
                  <div className="col-span-12 md:col-span-3 space-y-4 hidden md:block">
                    <div className="h-32 glass-panel rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-xl rounded-full"></div>
                      <div className="text-xs text-cyan-400 mb-2 font-medium tracking-wide uppercase">AI Match Score</div>
                      <div className="text-5xl font-bold tracking-tighter">98<span className="text-2xl text-gray-500">%</span></div>
                    </div>
                    <div className="h-40 glass-panel rounded-xl p-5">
                      <div className="text-xs text-gray-400 mb-4 font-medium tracking-wide uppercase">Top Skills Matrix</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">React & Next.js</span>
                        <span className="px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">TypeScript</span>
                        <span className="px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">Architecture</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Feed */}
                  <div className="col-span-12 md:col-span-9 space-y-4">
                    <div className="h-24 md:h-20 glass-panel border border-purple-500/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between premium-glow">
                      <div className="flex items-center gap-4 mb-2 md:mb-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30"><Zap className="w-5 h-5 text-purple-400" /></div>
                        <div>
                          <div className="text-base font-semibold text-white">Senior Frontend Engineer</div>
                          <div className="text-sm text-gray-400">TechCorp Inc. • Remote Global</div>
                        </div>
                      </div>
                      <div className="text-left md:text-right w-full md:w-auto">
                        <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Perfect Match</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-mono">1 Click Apply</div>
                      </div>
                    </div>
                    
                    <div className="h-20 glass-panel rounded-xl p-5 hidden md:flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><BrainCircuit className="w-5 h-5 text-gray-300" /></div>
                        <div>
                          <div className="text-base font-semibold text-white">Full Stack Developer Lead</div>
                          <div className="text-sm text-gray-400">StartupX • New York (Hybrid)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-cyan-400">92% Match</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 relative z-10">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-purple-400 mb-6 uppercase tracking-widest font-mono">
                Platform Architecture
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">The intelligence layer <br/><span className="text-gray-500 font-light">for modern recruitment.</span></h2>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { title: "Neural Resume Parsing", desc: "Instantly parse and evaluate complex resumes against job requirements using deep learning.", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                { title: "Predictive Matching", desc: "Our algorithm finds the exact nexus between candidate capability and enterprise requirements.", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                { title: "Frictionless Deployment", desc: "Apply to multiple perfect-match roles instantly using your AI-optimized profile architecture.", icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { title: "Telemetry Dashboard", desc: "Granular insights into hiring pipelines, market velocity, and candidate conversion metrics.", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { title: "Autonomous Interviews", desc: "Simulate high-pressure technical interviews with our voice-enabled conversational AI.", icon: Globe, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                { title: "Cryptographic Verification", desc: "Immutable skill verification ensures candidates possess the exact capabilities they claim.", icon: ShieldCheck, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
              ].map((feature, idx) => (
                <motion.div key={idx} variants={fadeIn} className="group h-full">
                  <div className="h-full p-8 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full transition-transform group-hover:scale-110"></div>
                    <div>
                      <div className={`w-14 h-14 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-8 shadow-inner`}>
                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed font-light">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 px-6 border-y border-white/5 bg-black/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.2]"></div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { label: "Active Roles", value: "50K+" },
                { label: "Enterprise Partners", value: "2,500+" },
                { label: "Successful Placements", value: "15K+" },
                { label: "Algorithm Accuracy", value: "98.5%" },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="text-5xl md:text-6xl font-bold text-gradient-silver tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 via-purple-900/10 to-transparent z-0"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Enter the new paradigm.</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
              Join thousands of visionary enterprises and elite professionals operating on the HireSphere OS.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300">
                Initialize Workspace
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-lg py-12 px-6 relative z-10">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <BrainCircuit className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold tracking-tight text-gray-300">HireSphere<span className="text-gray-600">.os</span></span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 items-center font-medium">
            <Link href="#" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/dashboard/admin" className="text-red-500/40 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/10 transition-all flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-red-500/80" /> System Root
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
