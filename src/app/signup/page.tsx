"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, Briefcase, UserRound, Shield, Mail, Lock, User, Eye, EyeOff, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/supabase";
import { useAuth, getDashboardPath } from "@/lib/auth-context";

function SignupForm() {
  const { user, signup, loading: authLoading, isSupabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "candidate";
  const [role, setRole] = useState<"candidate" | "employer">(defaultRole);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user?.isAuthenticated) {
      router.push(getDashboardPath(user.role));
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const name = `${firstName} ${lastName}`.trim();
    const result = await signup(email, password, name, role);

    if (!result.success) {
      setError(result.error || "Registration failed.");
      setIsLoading(false);
      return;
    }

    if (result.needsVerification) {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push(getDashboardPath(role));
      }, 2000);
    } else {
      setIsLoading(false);
      router.push(getDashboardPath(role));
    }
  };

  const handleGoogleSignup = async () => {
    if (!isSupabase) {
      setError("Google signup requires Supabase. Configure Supabase in .env.local first.");
      return;
    }
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(typeof googleError === "object" && "message" in googleError ? googleError.message : "Google sign-up failed");
    }
  };

  if (success) {
    return (
      <Card className="glass-panel w-full max-w-md">
        <CardContent className="py-16 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Account Created!</h3>
          <p className="text-gray-400 text-sm">
            {isSupabase ? "Check your email to verify your account. " : ""}Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel w-full max-w-md relative z-10">
      <CardHeader className="space-y-1 text-center pb-2">
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          Join HireSphere.ai and start your hiring journey
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Role selector */}
        <div className="flex gap-3 mb-6">
          {[
            { id: "candidate" as const, label: "Candidate", desc: "Find your dream job", icon: UserRound },
            { id: "employer" as const, label: "Employer", desc: "Hire top talent", icon: Briefcase },
          ].map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer"
              style={{
                background: role === r.id ? `linear-gradient(135deg, rgba(${r.id === "candidate" ? "6, 182, 212" : "139, 92, 246"}, 0.15), rgba(${r.id === "candidate" ? "59, 130, 246" : "99, 102, 241"}, 0.15))` : "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${role === r.id ? `rgba(${r.id === "candidate" ? "6, 182, 212" : "139, 92, 246"}, 0.4)` : "rgba(255, 255, 255, 0.06)"}`,
              }}>
              <r.icon className={`w-5 h-5 mb-1.5 ${role === r.id ? (r.id === "candidate" ? "text-cyan-400" : "text-purple-400") : "text-gray-500"}`} />
              <span className={`text-sm font-semibold ${role === r.id ? "text-white" : "text-gray-400"}`}>{r.label}</span>
              <span className="text-[10px] text-gray-500 mt-0.5">{r.desc}</span>
            </button>
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-xs text-red-300 flex items-start gap-2"
            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />{error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300 text-xs font-medium">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="John"
                  className="pl-10 h-11 bg-white/[0.04] border-white/[0.08] text-white rounded-xl placeholder:text-gray-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300 text-xs font-medium">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Doe"
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white rounded-xl placeholder:text-gray-600" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-gray-300 text-xs font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required
                className="pl-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-gray-300 text-xs font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input id="signup-password" type={showPassword ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters"
                className="pl-10 pr-10 h-11 bg-white/[0.04] border-white/[0.08] text-white rounded-xl placeholder:text-gray-600" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 mt-2 text-sm font-semibold rounded-xl cursor-pointer" disabled={isLoading}
            style={{
              background: isLoading ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${role === "candidate" ? "#06b6d4, #3b82f6" : "#8b5cf6, #6366f1"})`,
              boxShadow: isLoading ? "none" : `0 0 20px rgba(${role === "candidate" ? "6, 182, 212" : "139, 92, 246"}, 0.3)`,
            }}>
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</span>
            ) : (
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Create Account</span>
            )}
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Or</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        <Button variant="outline" onClick={handleGoogleSignup}
          className="w-full mt-4 h-11 rounded-xl text-sm font-medium cursor-pointer"
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
      <CardFooter className="flex justify-center pt-2 pb-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
        <div className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SignupPage() {
  const { isSupabase } = useAuth();

  return (
    <div className="min-h-screen porsche-bg text-white flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none grid-pattern opacity-[0.2]" />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(6, 182, 212, 0.1), transparent)" }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent)", animationDelay: "2s" }} />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              HireSphere<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">.ai</span>
            </span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full flex justify-center">
          <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
            <SignupForm />
          </Suspense>
        </motion.div>

        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono"
            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabase ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-gray-500 uppercase tracking-widest">
              {isSupabase ? "SUPABASE AUTH" : "SANDBOX MODE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
