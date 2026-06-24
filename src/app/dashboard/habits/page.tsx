"use client";

import { Target, Flame, Calendar, Award, Mail, Sparkles, Plus, CheckCircle2, Circle, BrainCircuit, Activity } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const MOCK_HABITS = [
  { id: 1, name: "Kinetic Reset (Exercise)", target: "Daily", streak: 12, aiAdjusted: false },
  { id: 2, name: "Deep Work (90m block)", target: "Daily", streak: 5, aiAdjusted: true },
  { id: 3, name: "Hydration Protocol", target: "Daily", streak: 28, aiAdjusted: false },
];

const MOCK_BADGES = [
  { id: 1, name: "IRON WILL", desc: "10-Day Deep Work Streak", icon: Flame, color: "var(--accent-primary)", unlocked: true },
  { id: 2, name: "COGNITIVE ELITE", desc: "100 Hours in Flow State", icon: BrainCircuit, color: "var(--color-info)", unlocked: true },
  { id: 3, name: "SYSTEM OVERRIDE", desc: "Ignored 50 Distractions", icon: Target, color: "var(--color-warning)", unlocked: false },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState(MOCK_HABITS);
  const [mailReminders, setMailReminders] = useState(true);

  // Generate 30-day heatmap data
  const generateHeatmap = () => {
    return Array.from({ length: 30 }).map((_, i) => ({
      day: i,
      intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0 // 0 to 4
    }));
  };
  
  const [heatmapData] = useState(generateHeatmap());

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'transparent';
    if (intensity === 1) return 'rgba(0, 200, 83, 0.2)'; // Very light green
    if (intensity === 2) return 'rgba(0, 200, 83, 0.5)';
    if (intensity === 3) return 'rgba(0, 200, 83, 0.8)';
    return 'var(--color-success)'; // Full green
  };

  const toggleHabit = (id: number) => {
    // Just mock UI toggle for demo
    alert('Habit Executed: Logged to secure ledger.');
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] font-body relative">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b-4 border-black z-10 bg-transparent">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-[28px] font-display font-black text-[var(--text-primary)] flex items-center gap-2 tracking-tight uppercase">
            <Target className="w-6 h-6 text-[var(--accent-primary)]" /> Goal & Habit Matrix
          </h2>
          <p className="text-[14px] text-[var(--text-tertiary)] mt-1 font-mono font-bold uppercase tracking-widest">
            Behavioral Reprogramming Active
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
          <button className="btn-primary">
            <Plus className="w-4 h-4" /> Initialize Goal
          </button>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-20">
        
        {/* Top Section: AI Intervention & Mail Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* AI Dynamic Adjustments */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card border-4 border-black bg-[var(--bg-elevated)] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
               <div className="card-eyebrow justify-between mb-4">
                 <span><BrainCircuit className="w-4 h-4 inline mr-2 text-[var(--accent-primary)]" /> Agent Cognitive Load Balancing</span>
                 <span className="badge badge--cyan animate-pulse">ACTIVE</span>
               </div>
               <p className="text-[14px] font-mono leading-relaxed max-w-xl text-[var(--text-secondary)]">
                 <span className="text-[var(--text-primary)] font-bold">Log:</span> AI noticed your Sleep Latency was exceptionally high last night. To preserve your execution velocity, VibeShift has dynamically adjusted your <strong>Deep Work</strong> habit target from 120m to 90m for today.
               </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="text-[11px] font-bold font-mono uppercase bg-black text-white px-4 py-2 border-2 border-black hover:bg-[var(--accent-primary)] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Accept Override</button>
              <button className="text-[11px] font-bold font-mono uppercase bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Reject & Push Through</button>
            </div>
          </motion.div>

          {/* Aggressive Mail Reminders */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 glass-card border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
             <div className="card-eyebrow mb-4">
               <Mail className="w-4 h-4 text-[var(--color-warning)] mr-2" /> Aggressive Accountability
             </div>
             <p className="text-[12px] font-mono text-[var(--text-secondary)] mb-4">
               When enabled, VibeShift AI will draft and send aggressive email/SMS reminders if a critical habit is missed by 8:00 PM.
             </p>
             <div className="mt-auto border-2 border-black p-3 bg-[var(--bg-base)] flex items-center justify-between cursor-pointer group" onClick={() => setMailReminders(!mailReminders)}>
               <span className="text-[13px] font-bold uppercase">Enable AI Reminders</span>
               <div className={`w-12 h-6 border-2 border-black p-0.5 flex items-center transition-colors ${mailReminders ? 'bg-[var(--color-success)]' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-black transition-transform ${mailReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </div>
          </motion.div>
        </div>

        {/* Heatmap & Consistency Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 glass-card border-4 border-black bg-[var(--bg-elevated)] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <div className="card-eyebrow justify-between mb-6">
             <span><Activity className="w-4 h-4 inline mr-2 text-[var(--color-success)]" /> 30-Day Execution Matrix</span>
           </div>
           <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
             {heatmapData.map((day, i) => (
               <div 
                 key={i} 
                 className="w-8 h-8 shrink-0 border-2 border-black transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-help relative group"
                 style={{ backgroundColor: getHeatmapColor(day.intensity) }}
               >
                 {/* Tooltip */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black text-white text-[10px] p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-mono">
                   Day {30 - i} ago<br/>
                   Intensity: {day.intensity}/4
                 </div>
               </div>
             ))}
           </div>
           <div className="flex items-center gap-4 mt-4 text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)]">
             <span>Less</span>
             <div className="flex gap-1">
               {[0,1,2,3,4].map(v => (
                 <div key={v} className="w-4 h-4 border border-black" style={{ backgroundColor: getHeatmapColor(v) }}></div>
               ))}
             </div>
             <span>More</span>
           </div>
        </motion.div>

        {/* Bottom Grid: Active Habits & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Habits List */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="card-eyebrow justify-between mb-4">
              <span>Daily Protocols</span>
            </div>
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="border-2 border-black p-4 flex items-center justify-between hover:bg-[var(--bg-base)] transition-colors group">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleHabit(habit.id)} className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                      <Circle className="w-6 h-6 text-gray-400 group-hover:text-black" />
                    </button>
                    <div>
                      <h4 className="text-[14px] font-bold font-display uppercase leading-none">{habit.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-mono bg-black text-white px-1.5 py-0.5 uppercase tracking-widest">
                           {habit.target}
                        </span>
                        {habit.aiAdjusted && (
                          <span className="text-[9px] font-mono bg-[var(--accent-primary)] text-white px-1.5 py-0.5 uppercase tracking-widest flex items-center gap-1">
                             <Sparkles className="w-2 h-2" /> AI Adjusted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[20px] font-black font-display text-[var(--accent-primary)] leading-none">{habit.streak}</div>
                    <div className="text-[9px] font-mono uppercase text-[var(--text-tertiary)] mt-1">Day Streak</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gamification & Badges */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="card-eyebrow justify-between mb-4">
              <span><Award className="w-4 h-4 inline mr-2 text-[var(--color-warning)]" /> Operational Achievements</span>
            </div>
            <div className="space-y-4">
              {MOCK_BADGES.map(badge => (
                <div key={badge.id} className={`border-2 border-black p-4 flex items-center gap-4 transition-all ${badge.unlocked ? 'bg-white' : 'bg-gray-100 opacity-60 grayscale'}`}>
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: badge.unlocked ? badge.color : '#ccc' }}>
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold font-display uppercase tracking-widest flex items-center gap-2">
                      {badge.name}
                      {!badge.unlocked && <span className="text-[9px] font-mono bg-black text-white px-1 py-0.5">LOCKED</span>}
                    </h4>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
