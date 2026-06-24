"use client";

import { useState, useEffect } from "react";
import { 
  Target, Sparkles, Calendar, Clock as ClockIcon, 
  TerminalSquare, CheckCircle2, ListTodo, BrainCircuit
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCalendarEvents } from "@/lib/calendar";

const MotionDiv = motion.div;

export default function DashboardPage() {
  const { user } = useAuth();
  const { timeLeft, isActive, toggleTimer, formatTime, setCustomTime } = useTimer();
  
  const [sessionGoal] = useState(90 * 60);
  const [now, setNow] = useState(new Date());
  const [focusMode, setFocusMode] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchCalendarEvents(user.uid).then(events => setCalendarEvents(events));
    }
  }, [user]);

  // Simulate AI Agent Logs for Scheduling
  useEffect(() => {
    const t = new Date();
    const format = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setAgentLogs([
      `[${format(t)}] AI Agent: Analyzed task backlog. Prioritized 3 critical path items.`,
      `[${format(new Date(t.getTime() - 120000))}] AI Agent: Synced with Google Calendar. Found 2-hour clear block.`,
      `[${format(new Date(t.getTime() - 300000))}] AI Agent: Rescheduled 1:00 PM sync to protect focus state.`
    ]);
  }, []);

  const progressPercent = Math.min(100, ((90*60 - timeLeft) / sessionGoal) * 100); 
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStrNow = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const formattedTimeLeft = formatTime(timeLeft).split(':');

  return (
    <>
      <header className="px-8 py-6 flex items-center justify-between shrink-0 bg-transparent z-20 relative border-b-4 border-black">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-[28px] font-display font-black text-[var(--text-primary)] flex items-center gap-2 tracking-tight uppercase">
            OPERATOR: {user?.displayName?.split(" ")[0] || "ADMIN"}
          </h2>
          <p className="text-[14px] font-mono text-[var(--text-tertiary)] mt-1 flex items-center gap-2 font-bold uppercase tracking-widest">
            AI Productivity Companion Active <span className={`status-dot status-dot--active`}></span>
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs text-[var(--text-primary)] font-bold px-4 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
            <span className="w-px h-3 bg-black"></span>
            <span className="flex items-center gap-2"><ClockIcon className="w-3.5 h-3.5" /> {timeStrNow}</span>
          </div>
          <button onClick={() => setFocusMode(!focusMode)} className={`flex items-center gap-2 px-5 py-2 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-[13px] font-bold uppercase ${focusMode ? 'bg-[var(--accent-primary)] border-black text-white' : 'bg-white border-black text-black hover:bg-gray-100'}`}>
            <Target className="w-4 h-4" /> Focus Mode 
            {focusMode && <span className="w-2 h-2 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ml-1"></span>}
          </button>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 relative z-20">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-3 gap-6 auto-rows-max">
          
          {/* Main Timer Bento (Col 1) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col justify-center">
            <div className="card-eyebrow justify-between relative z-10">
              <span className="flex items-center gap-2">Deep Work Engine</span>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${isActive ? 'status-dot--active' : ''}`}></span> 
                <span className="font-mono text-[10px]" style={{ color: isActive ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{isActive ? "ACTIVE" : "STANDBY"}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center py-6 relative z-10">
              <div className="text-[56px] font-mono font-black text-[var(--text-primary)] tracking-tighter leading-none flex gap-2">
                <div className="flex flex-col items-center">
                  <span>{formattedTimeLeft[0]}</span>
                  <span className="text-[10px] uppercase tracking-widest mt-1">MIN</span>
                </div>
                <span className="text-[var(--accent-primary)] animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span>{formattedTimeLeft[1]}</span>
                  <span className="text-[10px] uppercase tracking-widest mt-1">SEC</span>
                </div>
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <div className="w-full h-3 bg-black border border-[#333] relative overflow-hidden mb-6">
                 <div className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] border-r border-black" style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={toggleTimer} className="btn-primary w-full">
                  {isActive ? "PAUSE EXECUTION" : "START FOCUS"}
                </button>
              </div>
              <div className="flex justify-center gap-3 mt-4">
                <button onClick={() => setCustomTime(15)} className="badge badge--neutral hover:bg-black hover:text-white cursor-pointer transition-colors text-[11px]">15m</button>
                <button onClick={() => setCustomTime(25)} className="badge badge--neutral hover:bg-black hover:text-white cursor-pointer transition-colors text-[11px]">25m</button>
                <button onClick={() => setCustomTime(60)} className="badge badge--neutral hover:bg-black hover:text-white cursor-pointer transition-colors text-[11px]">60m</button>
              </div>
            </div>
          </MotionDiv>

          {/* AI Prioritized Tasks (Col 2) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col">
            <div className="card-eyebrow justify-between relative z-10">
              <span><ListTodo className="w-3 h-3 inline mr-1" /> AI Prioritized Tasks</span>
              <span className="badge badge--info">SORTED</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar mt-2 pr-2">
               <div className="space-y-3">
                 {[
                   { id: 1, title: "Finalize Project Presentation", tag: "High Impact" },
                   { id: 2, title: "Review PR #442", tag: "Blocking Team" },
                   { id: 3, title: "Respond to Client Emails", tag: "Quick Win" }
                 ].map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                       <button className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-gray-400 hover:text-black" /></button>
                       <div>
                          <p className="text-[13px] font-bold text-black font-display leading-tight">{task.title}</p>
                          <span className="inline-block mt-1 text-[9px] font-mono font-bold uppercase tracking-widest bg-[var(--accent-primary)] text-white px-1.5 py-0.5">{task.tag}</span>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </MotionDiv>

          {/* Mini Calendar View (Col 3) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col">
            <div className="card-eyebrow justify-between mb-4">
              <span><Calendar className="w-3 h-3 inline mr-1" /> Today's Schedule</span>
              <a href="/dashboard/calendar" className="text-[var(--accent-primary)] hover:underline text-[10px] normal-case">Full View</a>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-2">
              <div className="space-y-3">
                {[
                  { time: "10:00 AM", title: "Daily Standup", type: "meeting" },
                  { time: "11:00 AM", title: "Deep Work: Core Engine", type: "focus" },
                  { time: "1:00 PM", title: "Lunch & Kinetic Reset", type: "break" },
                  { time: "3:00 PM", title: "Project Demo", type: "meeting" },
                ].map((event, i) => (
                  <div key={i} className="flex gap-3 items-center p-3 border-2 border-black bg-white hover:bg-[#EEEEEE] transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center shrink-0 w-10 h-10 bg-black text-white">
                       <span className="text-[14px] font-display font-black leading-none">{event.time.split(':')[0]}</span>
                       <span className="text-[8px] font-mono font-bold leading-none mt-1">{event.time.split(' ')[1]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-black truncate font-display">{event.title}</p>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600 mt-1 flex items-center gap-1">
                         {event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>

          {/* Bottom Row */}
          <div className="col-span-3 grid grid-cols-3 gap-6">
            {/* AI Scheduling Assistance Log (Col 1 & 2) */}
            <MotionDiv variants={itemVariants} className="glass-card flex flex-col col-span-2">
            <div className="card-eyebrow justify-between mb-2">
               <span><BrainCircuit className="w-3 h-3 inline mr-1" /> AI Scheduling Assistance Log</span>
               <span className="badge badge--cyan">ACTIVE</span>
            </div>
            <div className="bg-black p-4 border-2 border-black h-32 overflow-y-auto custom-scrollbar">
               {agentLogs.map((log, i) => (
                 <p key={i} className="text-[12px] font-mono text-[var(--accent-primary)] mb-2">
                   {'>'} {log}
                 </p>
               ))}
               <p className="text-[12px] font-mono text-white ai-streaming mt-4">
                 {'>'} Monitoring incoming emails for urgent tasks
               </p>
            </div>
          </MotionDiv>

            {/* Personalized Recommendation (Col 3) */}
            <MotionDiv variants={itemVariants} className="glass-card flex flex-col bg-[var(--accent-primary)] border-4 border-black text-white">
              <div className="card-eyebrow justify-between mb-2 border-white text-white">
                 <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> AI Insight</span>
                 <span className="badge bg-black text-white border-white">ACTION</span>
              </div>
              <p className="text-[14px] font-bold font-display leading-tight mt-2">
                You have a continuous 3-hour block available tomorrow morning.
              </p>
              <p className="text-[12px] font-mono mt-2 mb-4 opacity-90">
                Should I reserve this as a Deep Work session for "Finalize Project Presentation"?
              </p>
              <div className="mt-auto flex gap-2">
                 <button className="flex-1 bg-white text-black font-bold font-mono text-[11px] uppercase tracking-widest py-2 border-2 border-black hover:translate-y-0.5 hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => alert('Scheduled 3hr Focus Block.')}>Reserve</button>
                 <button className="flex-1 bg-transparent text-white font-bold font-mono text-[11px] uppercase tracking-widest py-2 border-2 border-white hover:bg-black transition-colors" onClick={(e) => (e.currentTarget.parentElement?.parentElement as HTMLElement).style.display = 'none'}>Dismiss</button>
              </div>
            </MotionDiv>
          </div>

        </motion.div>
      </div>
    </>
  );
}
