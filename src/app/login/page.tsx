"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, Shield, Zap, Users, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/supabase";
import { useAuth, getDashboardPath } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, login, loading: authLoading, isSupabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("sandbox123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user?.isAuthenticated) {
      router.push(getDashboardPath(user.role));
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    setError("");

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || "Login failed");
      setIsLoading(false);
      return;
    }

    // Redirect based on role
    const cleanEmail = email.trim().toLowerCase();
    let redirectPath = "/dashboard/candidate";
    if (cleanEmail === "admin@hiresphere.ai") {
      redirectPath = "/dashboard/admin";
    } else if (cleanEmail === "employer@hiresphere.ai" || cleanEmail.includes("employer") || cleanEmail.includes("techcorp")) {
      redirectPath = "/dashboard/employer";
    }

    // Small delay for UX feedback
    setTimeout(() => {
      setIsLoading(false);
      router.push(redirectPath);
    }, 500);
  };

  const handleGoogleLogin = async () => {
    if (!isSupabase) {
      setError("Google login requires Supabase. Add your Supabase credentials to .env.local first.");
      return;
    }
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(typeof googleError === "object" && "message" in googleError ? googleError.message : "Google sign-in failed");
    }
  };

  const features = [
    { icon: Zap, label: "AI-Powered Matching", desc: "Smart candidate-job compatibility scoring" },
    { icon: Shield, label: "Fraud Detection", desc: "Heuristic scam protection for all listings" },
    { icon: Users, label: "Multi-Role Access", desc: "Candidate, Employer, and Admin portals" },
  ];

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-400 font-mono text-sm tracking-widest">CHECKING AUTH SESSION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen porsche-bg text-white flex relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 z-0 pointer-events-none grid-pattern opacity-[0.2]" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent)", animationDelay: "2s" }} />

      {/* Left: Feature showcase panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                HireSphere<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">.ai</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Next-Gen Talent Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
            AI-Powered Hiring<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
              Intelligence System
            </span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
            Advanced multi-factor candidate scoring, voice-based AI mock interviews, 
            heuristic fraud detection, and real-time talent analytics.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-4 p-5 rounded-xl glass-panel glass-panel-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))" }}>
                  <f.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{f.label}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isSupabase ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
            <span className="text-gray-500 uppercase tracking-widest">
              {isSupabase ? "SUPABASE AUTH ACTIVE" : "SANDBOX MODE — LOCAL AUTH"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }} className="w-full max-w-[420px] space-y-6">

          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                HireSphere<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">.ai</span>
              </span>
            </Link>
          </div>

          <Card className="glass-panel relative z-10 p-2">
            <CardHeader className="space-y-1 text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Sign in to access your HireSphere dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Sandbox credentials guide */}
              <div className="mb-5 p-3.5 rounded-xl text-xs space-y-2"
                style={{ background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.12)" }}>
                <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Sandbox Test Accounts
                </span>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                  {[
                    { email: "candidate@hiresphere.ai", role: "Candidate Portal", color: "text-cyan-400" },
                    { email: "employer@hiresphere.ai", role: "Employer Portal", color: "text-purple-400" },
                    { email: "admin@hiresphere.ai", role: "Admin Portal", color: "text-emerald-400" },
                  ].map(acc => (
                    <button key={acc.email} type="button" onClick={() => setEmail(acc.email)}
                      className={`text-left ${acc.color} hover:brightness-125 transition-all cursor-pointer flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5`}>
                      <span>{acc.email}</span>
                      <span className="text-gray-600 text-[10px]">{acc.role}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 block italic">Click an email to pre-fill. Any password works in sandbox mode.</span>
              </div>

              {/* Error message */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl text-xs text-red-300 flex items-start gap-2"
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />{error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 text-xs font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" required
                      className="pl-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/30 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300 text-xs font-medium">Password</Label>
                    <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      className="pl-10 pr-10 h-11 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-purple-500/50 focus-visible:border-purple-500/30 rounded-xl" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 mt-2 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  disabled={isLoading}
                  style={{
                    background: isLoading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    boxShadow: isLoading ? "none" : "0 0 20px rgba(139, 92, 246, 0.3)",
                  }}>
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Sign In</span>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Or</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <Button variant="outline" onClick={handleGoogleLogin}
                className="w-full mt-4 h-11 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#e2e8f0" }}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6"
              style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
              <div className="text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Create account
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Auth mode badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono"
              style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabase ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-gray-500 uppercase tracking-widest">
                {isSupabase ? "SUPABASE AUTHENTICATED" : "SANDBOX MODE"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
