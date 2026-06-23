"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Zap, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--accent-primary)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-base)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-primary-glow)] rounded-none  pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-none glass-card flex flex-col items-center max-w-md w-full text-center relative z-10 shadow-none"
      >
        <div className="w-20 h-20 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--border-active)] mb-8 flex items-center justify-center shadow-none">
          <Zap className="w-10 h-10 text-[var(--accent-primary)]" />
        </div>
        <h1 className="text-[32px] font-display font-bold text-[var(--text-primary)] mb-3">Welcome to VibeShift</h1>
        <p className="text-[14px] text-[var(--text-secondary)] font-body mb-10 leading-relaxed">
          Sign in to access your proactive operations partner and calibrate your focus.
        </p>
        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-none bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-[16px] hover:bg-white transition-colors shadow-lg"
        >
          <LogIn className="w-6 h-6" /> Continue with Google
        </button>
        
        <p className="text-[11px] text-[var(--text-tertiary)] mt-8 uppercase tracking-widest font-medium">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
