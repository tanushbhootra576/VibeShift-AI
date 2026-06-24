"use client";

import { Library, Play, Activity, Flame, Dumbbell, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LibraryPage() {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeProtocol && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeProtocol) {
      setActiveProtocol(null); // End session
    }
    return () => clearInterval(interval);
  }, [activeProtocol, timeLeft]);

  const startProtocol = (name: string, seconds: number) => {
    setActiveProtocol(name);
    setTimeLeft(seconds);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] relative">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <Library className="w-6 h-6 text-[var(--accent-primary)]" /> Break Library
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Cognitive Reset Protocols & Focus Optimization.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          
          {/* Protocol 1 */}
          <div className="glass-card flex flex-col group hover:border-[var(--accent-primary)] overflow-hidden transition-all duration-300 shadow-sm">
            <div className="h-32 bg-[var(--accent-primary-glow)] border-b border-[var(--glass-border)] relative flex items-center justify-center overflow-hidden">
               <Activity className="w-16 h-16 text-[var(--accent-primary)] opacity-20 absolute" />
               <div className="text-[32px] font-display font-black text-[var(--accent-primary)] z-10 tracking-tighter drop-shadow-md">5:00</div>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-[var(--bg-elevated)]">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="text-[18px] font-bold text-[var(--text-primary)] font-display">NSDR Protocol</h3>
                 <span className="badge badge--info uppercase tracking-widest text-[9px]">Focus</span>
               </div>
               <p className="text-[13px] text-[var(--text-secondary)] flex-1 leading-relaxed font-body">Non-Sleep Deep Rest. Scientifically proven to restore dopamine baseline faster than sleep.</p>
               <button onClick={() => startProtocol("NSDR Protocol", 300)} className="mt-6 w-full py-2.5 bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-[11px] hover:bg-[var(--accent-primary)] hover:text-white hover:border-[var(--accent-primary)] transition-colors flex items-center justify-center gap-2">
                 <Play className="w-3.5 h-3.5 fill-current" /> Initialize
               </button>
            </div>
          </div>

          {/* Protocol 2 */}
          <div className="glass-card flex flex-col group hover:border-[var(--color-danger)] overflow-hidden transition-all duration-300 shadow-sm">
            <div className="h-32 bg-[rgba(239,68,68,0.05)] border-b border-[var(--glass-border)] relative flex items-center justify-center overflow-hidden">
               <Dumbbell className="w-16 h-16 text-[var(--color-danger)] opacity-20 absolute" />
               <div className="text-[32px] font-display font-black text-[var(--color-danger)] z-10 tracking-tighter drop-shadow-md">2:00</div>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-[var(--bg-elevated)]">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="text-[18px] font-bold text-[var(--text-primary)] font-display">Kinetic Reset</h3>
                 <span className="badge badge--danger uppercase tracking-widest text-[9px]">Physical</span>
               </div>
               <p className="text-[13px] text-[var(--text-secondary)] flex-1 leading-relaxed font-body">High-intensity micro-workout. 30s jumping jacks, 30s squats, 60s stretching.</p>
               <button onClick={() => startProtocol("Kinetic Reset", 120)} className="mt-6 w-full py-2.5 bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-[11px] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)] transition-colors flex items-center justify-center gap-2">
                 <Play className="w-3.5 h-3.5 fill-current" /> Initialize
               </button>
            </div>
          </div>

          {/* Protocol 3 */}
          <div className="glass-card flex flex-col group hover:border-[var(--color-info)] overflow-hidden transition-all duration-300 shadow-sm">
            <div className="h-32 bg-[rgba(59,130,246,0.05)] border-b border-[var(--glass-border)] relative flex items-center justify-center overflow-hidden">
               <Flame className="w-16 h-16 text-[var(--color-info)] opacity-20 absolute" />
               <div className="text-[32px] font-display font-black text-[var(--color-info)] z-10 tracking-tighter drop-shadow-md">15:00</div>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-[var(--bg-elevated)]">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="text-[18px] font-bold text-[var(--text-primary)] font-display">Visual Defocus</h3>
                 <span className="badge badge--info uppercase tracking-widest text-[9px]">Recovery</span>
               </div>
               <p className="text-[13px] text-[var(--text-secondary)] flex-1 leading-relaxed font-body">Walk outside without devices. Promotes optic flow and down-regulates the amygdala.</p>
               <button onClick={() => startProtocol("Visual Defocus", 900)} className="mt-6 w-full py-2.5 bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-[11px] hover:bg-[var(--color-info)] hover:text-white hover:border-[var(--color-info)] transition-colors flex items-center justify-center gap-2">
                 <Play className="w-3.5 h-3.5 fill-current" /> Initialize
               </button>
            </div>
          </div>

        </div>
      </div>

      {/* ACTIVE PROTOCOL OVERLAY */}
      <AnimatePresence>
        {activeProtocol && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <button onClick={() => setActiveProtocol(null)} className="absolute top-8 right-8 p-4 text-white hover:text-[var(--color-danger)] transition-colors">
               <X className="w-8 h-8" />
            </button>
            
            <h2 className="text-[48px] font-display font-black text-white tracking-widest uppercase mb-4">{activeProtocol}</h2>
            <p className="text-[16px] text-gray-400 font-mono mb-16 uppercase tracking-widest">Protocol Engaged. Do not disrupt.</p>

            {/* Breathing / Focus Animation */}
            <div className="relative flex items-center justify-center w-64 h-64 mb-16">
               <motion.div 
                 animate={{ scale: [1, 1.5, 1] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                 className="absolute inset-0 rounded-full bg-[var(--accent-primary)] opacity-20"
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                 className="absolute inset-4 rounded-full bg-[var(--accent-primary)] opacity-40"
               />
               <div className="absolute inset-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center shadow-[0_0_50px_var(--accent-primary)]">
                  <span className="text-black font-display font-black text-[48px] tracking-tighter">{formatTime(timeLeft)}</span>
               </div>
            </div>

            <p className="text-white font-bold tracking-widest uppercase text-[14px]">Inhale ... Exhale</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
