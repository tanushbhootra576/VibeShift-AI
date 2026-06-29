"use client";

import { useAuth } from "@/context/AuthContext";
import { Zap, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--memphis-pink)]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-base)] relative overflow-hidden">
      {/* Decorative background patterns */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-2 bg-[var(--memphis-pink)]" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-[var(--memphis-blue)]" />

      {/* Floating geometric shapes */}
      <div className="absolute top-16 left-16 w-20 h-20 bg-[var(--memphis-yellow)] border-4 border-black shape-triangle opacity-60 memphis-float pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-[var(--memphis-mint)] border-4 border-black shape-circle opacity-60 memphis-float pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-16 w-12 h-12 bg-[var(--memphis-pink)] border-4 border-black rotate-12 opacity-60 memphis-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 left-20 w-14 h-14 bg-[var(--memphis-red)] border-4 border-black shape-blob opacity-50 memphis-float pointer-events-none" style={{ animationDelay: '0.5s' }} />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="memphis-card memphis-card--pink p-10 flex flex-col items-center text-center">
          {/* Logo Icon */}
          <div className="w-20 h-20 bg-[var(--memphis-pink)] border-4 border-black rounded-2xl flex items-center justify-center mb-6 relative">
            <Zap className="w-10 h-10 text-black" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--memphis-yellow)] border-2 border-black rounded-full" />
          </div>

          <h1 className="text-[36px] font-display font-black text-black mb-2 uppercase tracking-tight leading-none">
            Welcome to<br />
            <span className="text-[var(--memphis-pink)]">VibeShift</span>
          </h1>
          <p className="text-[14px] text-black/70 font-mono mb-8 leading-relaxed">
            Your proactive AI productivity<br />operations partner. Let's go.
          </p>

          {/* Squiggle divider */}
          <div className="w-full pattern-squiggles-pink h-4 opacity-60 mb-8" />

          <button
            onClick={signInWithGoogle}
            className="memphis-btn memphis-btn--yellow w-full justify-center text-[16px] py-4"
          >
            <LogIn className="w-5 h-5" /> Continue with Google
          </button>

          <p className="text-[10px] text-black/50 mt-8 uppercase tracking-widest font-bold">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
