"use client";

import { BrainCircuit, Target, Sparkles, Calendar, Mic, Bell, Settings2, Activity } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CalibratePage() {
  const [focusLevel, setFocusLevel] = useState(85);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autonomousPlanning, setAutonomousPlanning] = useState(true);
  const [contextReminders, setContextReminders] = useState(true);

  // Generate SVG Polygon points based on habits
  const getRadarPoints = () => {
    const cx = 100, cy = 100, r = 80;
    const stats = [focusLevel, 90, 75, 80, 95, 85]; // Mock habit scores
    return stats.map((val, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const dist = (val / 100) * r;
      return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
    }).join(" ");
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] relative overflow-hidden">
      
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent relative z-10">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <Settings2 className="w-6 h-6 text-[var(--accent-primary)]" /> AI Preferences & Habits
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Personalize your AI scheduling assistance and track goals.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="btn-primary w-[200px] justify-center text-[13px] relative overflow-hidden group">
             <Sparkles className="w-4 h-4" /> Save Preferences
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10 flex gap-8">
        
        {/* Left Column: Feature Toggles */}
        <div className="flex-1 flex flex-col gap-6 shrink-0">
          <div className="glass-card bg-[var(--bg-elevated)] p-8 shadow-lg border border-[var(--glass-border)] h-full">
             <h3 className="card-eyebrow mb-8 text-[var(--accent-primary)] flex items-center gap-2"><Sparkles className="w-4 h-4" /> VibeShift Intelligence Features</h3>
             
             <div className="space-y-6">
                
                {/* Feature 1 */}
                <div className="flex items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--accent-primary)] flex items-center justify-center shrink-0">
                       <BrainCircuit className="w-5 h-5 text-[var(--accent-primary)]" />
                     </div>
                     <div>
                       <h4 className="text-[15px] font-bold text-[var(--text-primary)]">Autonomous Task Planning</h4>
                       <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm">Allow AI to automatically break down large goals into actionable execution steps.</p>
                     </div>
                  </div>
                  <button onClick={() => setAutonomousPlanning(!autonomousPlanning)} className={`w-12 h-6 border-2 flex items-center px-0.5 transition-colors ${autonomousPlanning ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-glow)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-4 h-4 ${autonomousPlanning ? 'bg-[var(--accent-primary)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-none bg-[rgba(16,185,129,0.1)] border border-[var(--color-success)] flex items-center justify-center shrink-0">
                       <Bell className="w-5 h-5 text-[var(--color-success)]" />
                     </div>
                     <div>
                       <h4 className="text-[15px] font-bold text-[var(--text-primary)]">Context-Aware Reminders</h4>
                       <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm">Receive smart nudges based on your current location, time, and execution velocity.</p>
                     </div>
                  </div>
                  <button onClick={() => setContextReminders(!contextReminders)} className={`w-12 h-6 border-2 flex items-center px-0.5 transition-colors ${contextReminders ? 'border-[var(--color-success)] bg-[rgba(16,185,129,0.1)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-4 h-4 ${contextReminders ? 'bg-[var(--color-success)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-none bg-[rgba(245,158,11,0.1)] border border-[var(--color-warning)] flex items-center justify-center shrink-0">
                       <Mic className="w-5 h-5 text-[var(--color-warning)]" />
                     </div>
                     <div>
                       <h4 className="text-[15px] font-bold text-[var(--text-primary)]">Voice-Enabled Assistance</h4>
                       <p className="text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm">Use voice commands to capture thoughts, log tasks, and reschedule meetings.</p>
                     </div>
                  </div>
                  <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-12 h-6 border-2 flex items-center px-0.5 transition-colors ${voiceEnabled ? 'border-[var(--color-warning)] bg-[rgba(245,158,11,0.1)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-4 h-4 ${voiceEnabled ? 'bg-[var(--color-warning)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

             </div>
          </div>
        </div>

        {/* Right Column: Goal & Habit Tracking Visual */}
        <div className="w-[450px] glass-card bg-[var(--bg-surface)] shadow-lg flex flex-col items-center justify-center relative overflow-hidden border border-[var(--glass-border)] shrink-0">
            
            <h3 className="absolute top-6 left-6 card-eyebrow text-[var(--accent-primary)]"><Target className="w-4 h-4 inline mr-2"/> Goal & Habit Tracking</h3>

            {/* Hexagonal Radar Visual */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center mt-8">
               
               {/* Background Grid */}
               <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20">
                 <circle cx="100" cy="100" r="20" stroke="white" strokeWidth="0.5" fill="none" />
                 <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="0.5" fill="none" />
                 <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5" fill="none" />
                 <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" fill="none" />
                 {Array.from({length: 6}).map((_, i) => {
                   const angle = (Math.PI * 2 * i) / 6;
                   return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)} stroke="white" strokeWidth="0.5" />
                 })}
               </svg>

               {/* Active Radar Shape */}
               <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full z-10">
                 <motion.polygon 
                   points={getRadarPoints()} 
                   fill="rgba(6, 182, 212, 0.2)" 
                   stroke="var(--accent-primary)" 
                   strokeWidth="2" 
                   animate={{ points: getRadarPoints() }} 
                   transition={{ type: "spring", stiffness: 50, damping: 20 }}
                 />
               </svg>

               {/* Center Glow */}
               <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] opacity-10 absolute filter blur-xl animate-pulse"></div>

               {/* Labels */}
               <div className="absolute top-0 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">Focus Blocks</div>
               <div className="absolute bottom-0 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Consistency</div>
               <div className="absolute left-0 top-1/4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-danger)]">Task Execution</div>
               <div className="absolute right-0 top-1/4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-info)]">Adaptability</div>
               <div className="absolute left-0 bottom-1/4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Rest & Breaks</div>
               <div className="absolute right-0 bottom-1/4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Prioritization</div>

            </div>

            <div className="absolute bottom-6 w-full px-8">
               <div className="flex justify-between items-center bg-[var(--bg-elevated)] p-4 border border-[var(--glass-border)]">
                 <div>
                   <p className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Weekly Productivity</p>
                   <h3 className="text-[20px] font-display font-black text-white uppercase mt-1">Excellent</h3>
                 </div>
                 <Activity className="w-8 h-8 text-[var(--accent-primary)]" />
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
