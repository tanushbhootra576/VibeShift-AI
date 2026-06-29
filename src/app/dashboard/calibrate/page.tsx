"use client";

import { BrainCircuit, Target, Sparkles, Calendar, Mic, Bell, Settings2, Activity } from "lucide-react";
import { useState } from "react";


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
      
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent relative z-10 gap-4 md:gap-0">
        <div>
          <h2 className="text-[22px] md:text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2 md:gap-3">
             <Settings2 className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" /> AI Preferences & Habits
          </h2>
          <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] mt-1 font-body">Personalize your AI scheduling assistance and track goals.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button className="memphis-btn w-full md:w-[200px] justify-center text-[13px] relative overflow-hidden group min-h-[44px]">
             <Sparkles className="w-4 h-4" /> Save Preferences
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Left Column: Feature Toggles */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 shrink-0">
          <div className="memphis-card bg-[var(--bg-elevated)] p-5 md:p-8 shadow-lg border border-[var(--glass-border)] h-full">
             <h3 className="card-eyebrow mb-6 md:mb-8 text-[var(--memphis-pink)] flex items-center gap-2 text-[10px] md:text-[12px]"><Sparkles className="w-4 h-4" /> VibeShift Intelligence Features</h3>
             
             <div className="space-y-4 md:space-y-6">
                
                {/* Feature 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--memphis-pink)] transition-colors gap-4 sm:gap-0">
                  <div className="flex items-start gap-3 md:gap-4">
                     <div className="w-10 h-10 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--memphis-pink)] flex items-center justify-center shrink-0">
                       <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-[var(--memphis-pink)]" />
                     </div>
                     <div>
                       <h4 className="text-[14px] md:text-[15px] font-bold text-[var(--text-primary)]">Autonomous Task Planning</h4>
                       <p className="text-[11px] md:text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">Allow AI to automatically break down large goals into actionable execution steps.</p>
                     </div>
                  </div>
                  <button onClick={() => setAutonomousPlanning(!autonomousPlanning)} className={`min-h-[44px] min-w-[64px] sm:min-w-[48px] sm:min-h-[24px] border-2 flex items-center px-1 sm:px-0.5 transition-colors self-start sm:self-auto ${autonomousPlanning ? 'border-[var(--memphis-pink)] bg-[var(--accent-primary-glow)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-5 h-5 sm:w-4 sm:h-4 ${autonomousPlanning ? 'bg-[var(--memphis-pink)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--memphis-pink)] transition-colors gap-4 sm:gap-0">
                  <div className="flex items-start gap-3 md:gap-4">
                     <div className="w-10 h-10 rounded-none bg-[rgba(16,185,129,0.1)] border border-[var(--memphis-mint)] flex items-center justify-center shrink-0">
                       <Bell className="w-4 h-4 md:w-5 md:h-5 text-[var(--memphis-mint)]" />
                     </div>
                     <div>
                       <h4 className="text-[14px] md:text-[15px] font-bold text-[var(--text-primary)]">Context-Aware Reminders</h4>
                       <p className="text-[11px] md:text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">Receive smart nudges based on your current location, time, and execution velocity.</p>
                     </div>
                  </div>
                  <button onClick={() => setContextReminders(!contextReminders)} className={`min-h-[44px] min-w-[64px] sm:min-w-[48px] sm:min-h-[24px] border-2 flex items-center px-1 sm:px-0.5 transition-colors self-start sm:self-auto ${contextReminders ? 'border-[var(--memphis-mint)] bg-[rgba(16,185,129,0.1)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-5 h-5 sm:w-4 sm:h-4 ${contextReminders ? 'bg-[var(--memphis-mint)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--memphis-pink)] transition-colors gap-4 sm:gap-0">
                  <div className="flex items-start gap-3 md:gap-4">
                     <div className="w-10 h-10 rounded-none bg-[rgba(245,158,11,0.1)] border border-[var(--memphis-yellow)] flex items-center justify-center shrink-0">
                       <Mic className="w-4 h-4 md:w-5 md:h-5 text-[var(--memphis-yellow)]" />
                     </div>
                     <div>
                       <h4 className="text-[14px] md:text-[15px] font-bold text-[var(--text-primary)]">Voice-Enabled Assistance</h4>
                       <p className="text-[11px] md:text-[12px] text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">Use voice commands to capture thoughts, log tasks, and reschedule meetings.</p>
                     </div>
                  </div>
                  <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`min-h-[44px] min-w-[64px] sm:min-w-[48px] sm:min-h-[24px] border-2 flex items-center px-1 sm:px-0.5 transition-colors self-start sm:self-auto ${voiceEnabled ? 'border-[var(--memphis-yellow)] bg-[rgba(245,158,11,0.1)] justify-end' : 'border-[#444] bg-transparent justify-start'}`}>
                     <div className={`w-5 h-5 sm:w-4 sm:h-4 ${voiceEnabled ? 'bg-[var(--memphis-yellow)]' : 'bg-[#444]'}`}></div>
                  </button>
                </div>

             </div>
          </div>
        </div>

        {/* Right Column: Goal & Habit Tracking Visual */}
        <div className="w-full lg:w-[450px] memphis-card bg-[var(--bg-surface)] shadow-lg flex flex-col items-center justify-center relative overflow-hidden border border-[var(--glass-border)] shrink-0 py-10 md:py-0 min-h-[400px]">
            
            <h3 className="absolute top-4 md:top-6 left-4 md:left-6 card-eyebrow text-[var(--memphis-pink)] text-[10px] md:text-[12px]"><Target className="w-4 h-4 inline mr-1 md:mr-2"/> Goal & Habit Tracking</h3>

            {/* Hexagonal Radar Visual */}
            <div className="relative w-[250px] md:w-[300px] h-[250px] md:h-[300px] flex items-center justify-center mt-8 md:mt-12 mb-20 md:mb-0">
               
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
                 <polygon 
                   points={getRadarPoints()} 
                   fill="rgba(6, 182, 212, 0.2)" 
                   stroke="var(--memphis-pink)" 
                   strokeWidth="2" 
                 />
               </svg>

               {/* Center Glow */}
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--memphis-pink)] opacity-10 absolute filter blur-xl animate-pulse"></div>

               {/* Labels */}
               <div className="absolute top-0 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--memphis-pink)] text-center w-full transform -translate-y-2 md:translate-y-0">Focus Blocks</div>
               <div className="absolute bottom-0 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] text-center w-full transform translate-y-2 md:translate-y-0">Consistency</div>
               <div className="absolute left-0 top-1/4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--memphis-red)] transform -translate-x-4 md:-translate-x-2">Task Execution</div>
               <div className="absolute right-0 top-1/4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--memphis-blue)] transform translate-x-4 md:translate-x-2">Adaptability</div>
               <div className="absolute left-0 bottom-1/4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] transform -translate-x-4 md:-translate-x-2">Rest & Breaks</div>
               <div className="absolute right-0 bottom-1/4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] transform translate-x-4 md:translate-x-2">Prioritization</div>

            </div>

            <div className="absolute bottom-4 md:bottom-6 w-full px-4 md:px-8">
               <div className="flex justify-between items-center bg-[var(--bg-elevated)] p-3 md:p-4 border border-[var(--glass-border)]">
                 <div>
                   <p className="text-[9px] md:text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Weekly Productivity</p>
                   <h3 className="text-[16px] md:text-[20px] font-display font-black text-white uppercase mt-1">Excellent</h3>
                 </div>
                 <Activity className="w-6 h-6 md:w-8 md:h-8 text-[var(--memphis-pink)]" />
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
