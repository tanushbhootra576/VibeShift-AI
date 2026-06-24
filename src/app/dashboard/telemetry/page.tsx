"use client";

import { Activity, BrainCircuit, Sparkles, Network, Target, ListTodo, CheckCircle2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TelemetryPage() {
  const [productivityData, setProductivityData] = useState<number[]>(Array(60).fill(70));
  const [stream, setStream] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProductivityData(prev => [...prev.slice(1), 60 + Math.random() * 40]);
    }, 100); 
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tasks = [
      "Prioritizing 'Core Engine' based on upcoming deadline.",
      "Analyzing available calendar blocks for Deep Work.",
      "Rescheduling 3:00 PM sync to protect focus state.",
      "Generating sub-tasks for 'Stakeholder Demo'.",
      "Calculating optimal break time based on fatigue.",
      "Suggesting 'Visual Defocus' protocol.",
      "Syncing with Google Calendar."
    ];
    
    const streamInt = setInterval(() => {
      setStream(prev => [tasks[Math.floor(Math.random() * tasks.length)], ...prev].slice(0, 6));
    }, 2000);

    return () => clearInterval(streamInt);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#050505] text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[#222] bg-black/50 backdrop-blur-sm z-10 relative">
        <div>
          <h2 className="text-[28px] font-display font-bold text-white tracking-tight flex items-center gap-3">
             <BrainCircuit className="w-6 h-6 text-[var(--accent-live)]" /> Autonomous Engine Status
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Live monitoring of AI-powered scheduling and task optimization.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 border border-[#333] bg-black text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-success)] flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse"></span> Engine Active
           </div>
           <div className="px-4 py-2 border border-[#333] bg-black text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-live)] flex items-center gap-2">
             23 Tasks Managed
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Main Visualizer: Productivity Output */}
          <div className="col-span-8 flex flex-col gap-6">
             {/* Productivity Graph */}
             <div className="glass-card p-6 bg-[#0a0a0a] border border-[#222] relative overflow-hidden h-[300px] flex flex-col">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--accent-live) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 flex justify-between items-center mb-6">
                  <h3 className="card-eyebrow text-[var(--accent-live)] m-0 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Live Productivity Optimization
                  </h3>
                  <div className="text-[32px] font-display font-black text-white tracking-tighter">
                    {Math.round(productivityData[productivityData.length - 1])} <span className="text-[12px] font-mono text-[var(--text-secondary)] uppercase">Score</span>
                  </div>
                </div>

                <div className="flex-1 w-full flex items-end gap-[2px] relative z-10 h-full">
                  {productivityData.map((hr, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${hr}%` }} 
                      transition={{ duration: 0.1, ease: "linear" }}
                      className="flex-1 bg-[var(--accent-live)] opacity-80"
                      style={{ filter: 'drop-shadow(0 0 4px var(--accent-live))' }}
                    />
                  ))}
                </div>
                
                <div className="mt-4 relative z-10 flex justify-between text-[var(--text-tertiary)] font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                  <span>Past Hour</span>
                  <div className="flex items-center gap-2 text-[var(--accent-live)]">
                     <Sparkles className="w-3 h-3" /> AI Engine Resolving Conflicts
                  </div>
                  <span>Now</span>
                </div>
             </div>

             {/* Intelligent Task Prioritization Matrix */}
             <div className="grid grid-cols-4 gap-4 flex-1">
                {/* Metric 1 */}
                <div className="glass-card bg-[#0a0a0a] border border-[#222] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <Target className="w-8 h-8 text-[var(--color-success)] mb-3 relative z-10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] relative z-10">Goals Tracked</h4>
                  <span className="text-[28px] font-display font-black mt-1 text-white tracking-tighter relative z-10">14</span>
                </div>
                {/* Metric 2 */}
                <div className="glass-card bg-[#0a0a0a] border border-[#222] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <Calendar className="w-8 h-8 text-[var(--color-info)] mb-3 relative z-10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] relative z-10">Calendar Syncs</h4>
                  <span className="text-[28px] font-display font-black mt-1 text-white tracking-tighter relative z-10">32</span>
                </div>
                {/* Metric 3 */}
                <div className="glass-card bg-[#0a0a0a] border border-[#222] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <ListTodo className="w-8 h-8 text-[var(--color-warning)] mb-3 relative z-10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] relative z-10">Tasks Prioritized</h4>
                  <span className="text-[28px] font-display font-black mt-1 text-white tracking-tighter relative z-10">128</span>
                </div>
                {/* Metric 4 */}
                <div className="glass-card bg-[#0a0a0a] border border-[#222] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <CheckCircle2 className="w-8 h-8 text-[var(--accent-primary)] mb-3 relative z-10" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] relative z-10">Hours Saved</h4>
                  <span className="text-[28px] font-display font-black mt-1 text-white tracking-tighter relative z-10">4.5</span>
                </div>
             </div>
          </div>

          {/* Right Column: AI Scheduling Assistance */}
          <div className="col-span-4 flex flex-col gap-6">
             
             {/* AI Agent Execution Log */}
             <div className="glass-card flex-1 bg-[#0a0a0a] border border-[#222] p-6 flex flex-col overflow-hidden relative">
                <h3 className="card-eyebrow text-[#fff] mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" /> AI Scheduling Assistance
                </h3>
                
                <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-[var(--accent-primary)] to-transparent"></div>

                <div className="flex-1 overflow-hidden flex flex-col justify-start relative">
                  {/* Fading gradient for text overflow */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
                  
                  <AnimatePresence>
                    {stream.map((text, i) => (
                      <motion.div 
                        key={`${i}-${text}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 text-[13px] font-body text-[var(--text-secondary)] p-3 border border-[#222] bg-[#111]"
                      >
                         <span className="text-[var(--accent-primary)] font-bold mr-2">VibeShift:</span>
                         {text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
             </div>

             {/* Personal Recommendation */}
             <div className="glass-card h-64 bg-[#0a0a0a] border border-[var(--accent-primary)] p-6 flex flex-col relative overflow-hidden group hover:bg-[var(--accent-primary-glow)] transition-colors cursor-pointer">
                
                <h4 className="text-[12px] font-bold text-[var(--accent-primary)] uppercase tracking-widest mb-4">Personalized Recommendation</h4>
                
                <p className="text-[16px] font-bold text-white leading-relaxed mb-4">You have a continuous 3-hour block available tomorrow morning. Should I reserve this for "Core Engine UI Polish"?</p>

                <div className="mt-auto flex gap-3 relative z-10">
                   <button className="flex-1 py-2 bg-[var(--accent-primary)] text-black font-bold uppercase tracking-wider text-[11px] hover:brightness-110">Schedule It</button>
                   <button className="flex-1 py-2 bg-transparent border border-[#444] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] hover:text-white">Dismiss</button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
