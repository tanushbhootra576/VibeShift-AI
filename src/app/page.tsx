"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BrainCircuit, Activity, Calendar, Target, CheckCircle2, Mic } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-body overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 px-8 py-6 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--bg-overlay)] backdrop-">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--border-active)] flex items-center justify-center shadow-none">
             <div className="w-4 h-4 bg-[var(--bg-base)] rounded-none transform rotate-45 border border-[var(--accent-primary)]"></div>
          </div>
          <div>
            <h1 className="text-[20px] font-display font-bold text-[var(--text-primary)] leading-tight tracking-wide">VibeShift AI</h1>
            <p className="text-[10px] text-[var(--accent-live)] uppercase tracking-[0.1em] font-semibold">PS-1: The Last-Minute Life Saver</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth" className="text-[14px] font-medium hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors">Sign In</Link>
          <Link href="/auth" className="btn-primary">
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-primary-glow)] rounded-none  pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[var(--accent-live-glow)] rounded-none  pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-[var(--border-active)] bg-[var(--accent-primary-glow)] text-[var(--accent-primary)] text-[11px] font-semibold uppercase tracking-[0.1em] mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Built for Vibe2Ship Hackathon
          </div>
          <h1 className="text-6xl md:text-[80px] font-display font-bold text-[var(--text-primary)] tracking-tight mb-8 leading-[1.1]">
            Never Miss A <br/>
            <span className="text-transparent bg-clip-text bg-[var(--accent-primary)] from-[var(--accent-primary)] via-[var(--accent-live)] to-[var(--color-success)] animate-shimmer">Deadline Again.</span>
          </h1>
          <p className="text-[18px] md:text-[20px] text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
            Your autonomous AI productivity companion. VibeShift proactively prioritizes your tasks, dynamically schedules your day, and ensures you take action before it's too late.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary shadow-none text-[16px] py-4 px-8 rounded-none">
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn-ghost text-[16px] py-4 px-8 rounded-none bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)]">
              Explore the Solution
            </Link>
          </div>
        </motion.div>

        {/* Hackathon Features Grid */}
        <div id="features" className="mt-40 max-w-6xl w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-display font-bold text-[var(--text-primary)] mb-4 tracking-tight">Solving "The Last-Minute Life Saver"</h2>
            <p className="text-[16px] text-[var(--text-secondary)]">How VibeShift tackles Problem Statement 1 with Agentic AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[var(--border-active)]">
              <div className="w-14 h-14 rounded-none bg-[var(--accent-primary-glow)] flex items-center justify-center mb-6 border border-[var(--border-active)] group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Intelligent Prioritization</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Our Gemini-powered agent autonomously categorizes and ranks your tasks, assignments, and bills to ensure the most critical items are surfaced first.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[rgba(6,182,212,0.4)]">
              <div className="w-14 h-14 rounded-none bg-[var(--accent-live-glow)] flex items-center justify-center mb-6 border border-[rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-[var(--accent-live)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">AI Scheduling & Calendar</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Deep integration with Google Calendar allows the AI to dynamically find open slots, block out deep-work time, and gracefully adjust when meetings run late.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[rgba(16,185,129,0.4)]">
              <div className="w-14 h-14 rounded-none bg-[rgba(16,185,129,0.1)] flex items-center justify-center mb-6 border border-[rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-[var(--color-success)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Context-Aware Interventions</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                By monitoring simulated biometric stress signals and keyboard velocity, the agent proactively recommends the exact physical reset you need to prevent burnout.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[rgba(245,158,11,0.4)]">
              <div className="w-14 h-14 rounded-none bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-6 border border-[rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-[var(--color-warning)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Goal & Habit Tracking</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Maintain consistency with dynamic streak tracking, daily flow visualization, and session progress metrics to build robust productivity habits over time.
              </p>
            </motion.div>

             {/* Feature 5 */}
             <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[rgba(59,130,246,0.4)]">
              <div className="w-14 h-14 rounded-none bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-6 border border-[rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 text-[var(--color-info)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Voice-Enabled Assistance</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Interact with your AI companion hands-free. Command VibeShift to log tasks, check deadlines, or initiate focus mode using just your voice.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 group hover:border-[rgba(239,68,68,0.4)]">
              <div className="w-14 h-14 rounded-none bg-[rgba(239,68,68,0.1)] flex items-center justify-center mb-6 border border-[rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-[var(--color-danger)]" />
              </div>
              <h3 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">Autonomous Execution</h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                It doesn't just remind you; it acts. The agent breaks down massive projects into atomic sub-tasks and suppresses non-critical notifications during focus blocks.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Hackathon Footer */}
        <div className="mt-32 border-t border-[var(--glass-border)] pt-10 text-center w-full z-10">
           <p className="text-[12px] font-mono text-[var(--text-secondary)]">Built using Google AI Studio & Next.js for Vibe2Ship Hackathon 2026.</p>
        </div>
      </main>
    </div>
  );
}
