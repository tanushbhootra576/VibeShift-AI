"use client";

import { BrainCircuit, Sparkles, Target, Activity, Clock, Zap, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: "SCHEDULE_OPTIMIZATION",
      title: "Reserve 3-Hour Deep Work Block",
      description: "You have a continuous 3-hour block available tomorrow morning. Based on your historical velocity, mornings are your peak execution window. Should I reserve this for 'Finalize Project Presentation'?",
      icon: Clock,
      color: "var(--accent-primary)",
      action: "Reserve Block",
      status: "ACTIVE"
    },
    {
      id: 2,
      type: "TASK_SHIFT",
      title: "Tackle Quick Wins Now",
      description: "It's 2:00 PM. Based on your biometric data, your execution velocity drops 15% post-lunch. I recommend clearing 'Respond to Client Emails' now before starting your next heavy cognitive load task.",
      icon: Target,
      color: "var(--color-warning)",
      action: "Start Task",
      status: "ACTIVE"
    },
    {
      id: 3,
      type: "RECOVERY_NUDGE",
      title: "Kinetic Reset Required",
      description: "You've been in a continuous flow state for 110 minutes. Your focus variability suggests cognitive fatigue is imminent. Take a 15-minute physical reset to preserve overall daily velocity.",
      icon: Activity,
      color: "var(--color-info)",
      action: "Start Break",
      status: "ACTIVE"
    },
    {
      id: 4,
      type: "HABIT_INSIGHT",
      title: "Caffeine Tapering Advised",
      description: "Analysis of your sleep latency over the past 7 days shows a correlation with late-afternoon coffee. Try swapping your 4:00 PM espresso for hydration to improve tomorrow's baseline energy.",
      icon: Zap,
      color: "var(--color-success)",
      action: "Log Water",
      status: "ACTIVE"
    }
  ]);

  const dismissRecommendation = (id: number) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const executeRecommendation = (id: number) => {
    alert("Executing AI Action Protocol...");
    dismissRecommendation(id);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] font-body relative">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b-4 border-black z-10 bg-transparent">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-[28px] font-display font-black text-[var(--text-primary)] flex items-center gap-2 tracking-tight uppercase">
            <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" /> AI Insights & Recommendations
          </h2>
          <p className="text-[14px] text-[var(--text-tertiary)] mt-1 font-mono font-bold uppercase tracking-widest">
            Predictive Analytics Engine: Online
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
           <span className="badge badge--cyan px-4 py-2 border-2 text-[12px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {recommendations.length} Active Insights
           </span>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-20">
        
        {/* Intro Box */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 glass-card border-4 border-black p-6 bg-[var(--bg-surface)]">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_var(--accent-primary)]">
                <BrainCircuit className="w-6 h-6 text-[var(--accent-primary)]" />
             </div>
             <div>
                <h3 className="text-[16px] font-bold font-display uppercase mb-1">Pattern Analysis Complete</h3>
                <p className="text-[13px] font-mono text-[var(--text-secondary)] leading-relaxed ai-streaming">
                  VibeShift continuously monitors your task execution, calendar density, and focus blocks to provide proactive recommendations designed to maximize your daily output and prevent cognitive burnout.
                </p>
             </div>
          </div>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {recommendations.map((rec, i) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card flex flex-col p-6 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-black flex items-center justify-center" style={{ backgroundColor: rec.color }}>
                      <rec.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: rec.color }}>{rec.type}</span>
                      <h4 className="text-[16px] font-bold font-display leading-tight">{rec.title}</h4>
                    </div>
                  </div>
                  <button onClick={() => dismissRecommendation(rec.id)} className="text-gray-400 hover:text-black transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-[13px] font-mono text-[var(--text-secondary)] leading-relaxed mb-6 flex-1">
                  {rec.description}
                </p>

                <div className="flex gap-3 mt-auto">
                  <button onClick={() => executeRecommendation(rec.id)} className="flex-1 bg-black text-white font-bold font-mono text-[11px] uppercase tracking-widest py-3 border-2 border-black hover:bg-[var(--accent-primary)] hover:border-black transition-colors flex items-center justify-center gap-2">
                    {rec.action} <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => dismissRecommendation(rec.id)} className="px-6 bg-white text-black font-bold font-mono text-[11px] uppercase tracking-widest py-3 border-2 border-black hover:bg-gray-100 transition-colors">
                    Skip
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {recommendations.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-20 border-4 border-dashed border-gray-300">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-[14px] font-bold font-mono uppercase text-gray-400">All insights resolved. Output optimal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
