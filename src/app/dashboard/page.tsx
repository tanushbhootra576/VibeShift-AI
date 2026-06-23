"use client";

import { useState, useEffect } from "react";
import { 
  Activity, BrainCircuit, Target, Sparkles,
  Calendar, Clock as ClockIcon, Bell, Pause, Play, TerminalSquare,
  RefreshCcw, AlertTriangle, ShieldAlert, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCalendarEvents } from "@/lib/calendar";

type LogEvent = {
  time: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  bg: string;
};

const MotionDiv = motion.div;

export default function DashboardPage() {
  const { user } = useAuth();
  const { timeLeft, isActive, toggleTimer, formatTime } = useTimer();
  
  const [sessionGoal] = useState(90 * 60);
  const [heartRate, setHeartRate] = useState(78);
  const [vibeScore, setVibeScore] = useState(85);
  const [now, setNow] = useState(new Date());
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Phase 3: Predictive Intelligence (Deadline Drift)
  const [driftScore, setDriftScore] = useState(0.12);
  const [interventionStage, setInterventionStage] = useState<"NONE" | "CRITICAL" | "RECOVERING" | "RESOLVED">("NONE");

  // Sparkline data
  const [hrData, setHrData] = useState(Array(20).fill(70).map(v => v + Math.random()*20));
  const [fsData, setFsData] = useState(Array(20).fill(80).map(v => v + Math.random()*15));

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchCalendarEvents(user.uid).then(events => setCalendarEvents(events));
    }
  }, [user]);

  // Telemetry Engine & Drift Simulation
  useEffect(() => {
    const sim = setInterval(() => {
      setHeartRate(prev => {
        const next = prev + (Math.floor(Math.random() * 5) - 2);
        setHrData(d => [...d.slice(1), next]);
        return next;
      });
      setVibeScore(prev => {
        const targetVibe = driftScore > 0.5 ? 31 : driftScore > 0.25 ? 51 : 92;
        const next = prev > targetVibe ? prev - 2 : prev < targetVibe ? prev + 2 : prev;
        setFsData(d => [...d.slice(1), next]);
        return next;
      });

      if (interventionStage === "NONE") {
        setDriftScore(prev => {
          const next = prev + 0.05;
          if (next >= 0.55) {
            setInterventionStage("CRITICAL");
          }
          return next;
        });
      }
    }, 2000);
    return () => clearInterval(sim);
  }, [interventionStage, driftScore]);

  // AI Recovery Plan Simulation
  useEffect(() => {
    if (interventionStage === "RECOVERING") {
      const timer2 = setTimeout(() => {
        setInterventionStage("RESOLVED");
        setDriftScore(0.08);
        
        const t = new Date();
        const format = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        setLogs(prev => [
          { time: format(t), title: "Auto-Negotiated Timeline", desc: "Shifted 1 meeting, created Focus Block", icon: Sparkles, color: "text-[var(--warning)]", bg: "rgba(245, 158, 11, 0.15)" },
          { time: format(t), title: "Stakeholder Shield Activated", desc: "Drafted project update email", icon: ShieldAlert, color: "text-[var(--info)]", bg: "rgba(59, 130, 246, 0.15)" },
          ...prev
        ]);
        
        setCalendarEvents(prev => [
          { start: { dateTime: new Date().toISOString() }, summary: "Deep Focus: Hackathon Launch", location: "VibeShift AI" },
          ...prev
        ]);
      }, 2000);
      return () => clearTimeout(timer2);
    }
  }, [interventionStage]);

  useEffect(() => {
    const t = new Date();
    const format = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setLogs([
      { time: format(t), title: "Analyzed focus patterns", desc: "Optimal flow state detected", icon: BrainCircuit, color: "text-[var(--accent-primary)]", bg: "rgba(99, 102, 241, 0.15)" },
      { time: format(new Date(t.getTime() - 60000)), title: "Evaluated break options", desc: "Selected physical reset", icon: Activity, color: "text-[var(--accent-hover)]", bg: "rgba(124, 127, 245, 0.15)" },
      { time: format(new Date(t.getTime() - 120000)), title: "Session tracking active", desc: "Focus session in progress", icon: Target, color: "text-[var(--success)]", bg: "rgba(16, 185, 129, 0.15)" }
    ]);
  }, []);

  const progressPercent = Math.min(100, ((90*60 - timeLeft) / sessionGoal) * 100); 
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStrNow = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const renderSparkline = (data: number[], color: string, maxVal: number) => {
    const pts = data.map((v, i) => `${(i/(data.length-1))*100},${100 - (v/maxVal)*100}`).join(" ");
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} className="transition-all duration-1000 ease-linear" />
      </svg>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const driftColor = driftScore < 0.25 ? "var(--color-success)" : driftScore < 0.50 ? "var(--color-warning)" : "var(--color-danger)";
  const driftStatus = driftScore < 0.25 ? "Stable" : driftScore < 0.50 ? "Elevated Risk" : "Critical Warning";

  const vibeIntensity = Math.min(1, vibeScore / 100);
  const glowOpacity = vibeScore > 80 ? 0.8 : vibeScore > 50 ? 0.4 : 0.1;
  const vibeStatusText = vibeScore >= 90 ? "Flow State" : vibeScore >= 70 ? "Productive" : vibeScore >= 50 ? "Fragmented" : vibeScore >= 30 ? "Burnout Risk" : "Chaos Mode";
  const vibeColor = vibeScore >= 90 ? "var(--accent-primary)" : vibeScore >= 70 ? "var(--color-success)" : vibeScore >= 50 ? "var(--color-warning)" : "var(--color-danger)";

  const formattedTimeLeft = formatTime(timeLeft).split(':');

  return (
    <>
      {/* Vibe Score Global Glow */}
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0" style={{ opacity: glowOpacity }}>
         <div className="absolute -top-40 -left-40 w-96 h-96 rounded-none " style={{ background: 'var(--accent-primary-glow)' }}></div>
         <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-none " style={{ background: 'var(--accent-live-glow)' }}></div>
      </div>

      <header className="px-8 py-6 flex items-center justify-between shrink-0 bg-transparent z-20 relative border-b border-[var(--border-subtle)]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            Good evening, {user?.displayName?.split(" ")[0] || "Arjun"}. <span className="text-2xl">👋</span>
          </h2>
          <p className="text-[14px] font-body text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            Your AI agent is optimizing your next break. <span className={`status-dot ${driftScore > 0.5 ? 'status-dot--active bg-[var(--color-danger)]' : 'status-dot--live'}`}></span>
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-semibold px-4 py-2 rounded-none border border-[var(--glass-border)] bg-[var(--bg-surface)] shadow-sm">
            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {dateStr}</span>
            <span className="w-px h-3 bg-[var(--glass-border)]"></span>
            <span className="flex items-center gap-2"><ClockIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {timeStrNow}</span>
          </div>
          <button onClick={() => setFocusMode(!focusMode)} className={`flex items-center gap-2 px-5 py-2 rounded-none border shadow-sm transition-all text-[13px] font-medium ${focusMode ? 'bg-[var(--accent-primary-glow)] border-[var(--border-active)] text-[var(--text-accent)]' : 'bg-[var(--bg-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'}`}>
            <Target className="w-4 h-4" /> Focus Mode 
            {focusMode && <span className="w-1.5 h-1.5 rounded-none bg-[var(--color-success)] ml-1"></span>}
          </button>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 relative z-20">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-3 gap-4 auto-rows-max">
          
          {/* Main Timer Bento (Col 1) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col justify-center">
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-none blur-3xl pointer-events-none transition-opacity duration-1000" style={{ opacity: vibeIntensity, background: 'var(--accent-primary-glow)' }}></div>
            
            <div className="card-eyebrow justify-between relative z-10">
              <span className="flex items-center gap-2">Deep Work Session</span>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${isActive ? 'status-dot--active' : ''}`}></span> 
                <span style={{ color: isActive ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{isActive ? "In Progress" : "Paused"}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center py-6 relative z-10">
              <div className="text-[56px] font-mono text-[var(--text-primary)] tracking-[-0.02em] leading-none flex gap-2 drop-shadow-sm transition-colors duration-1000">
                <div className="flex flex-col items-center">
                  <span>{formattedTimeLeft[0]}</span>
                  <span className="timer-label">MIN</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{formattedTimeLeft[1]}</span>
                  <span className="timer-label">SEC</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <span className="badge badge--info"><Activity className="w-3 h-3" /> Deep Work</span>
                <span className="badge badge--cyan">High Focus</span>
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <div className="session-progress-bar">
                 <div className="session-progress-bar__fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={toggleTimer} className="btn-primary w-full">
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {isActive ? "Pause Session" : "Start Focus"}
                </button>
              </div>
            </div>
          </MotionDiv>

          {/* Phase 3: Live Agent Analysis / Telemetry (Col 2) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col">
            <div className="card-eyebrow justify-between relative z-10">
              <span><BrainCircuit className="w-3 h-3 inline mr-1" /> Live Agent Analysis</span>
              <span className="badge badge--cyan">LIVE</span>
            </div>
            
            <div className="flex flex-col items-center py-4 relative z-10 flex-1 justify-center border-b border-[var(--glass-border)] mb-4">
              <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-2">Execution Velocity Risk</span>
              <div className="text-[56px] font-mono tracking-tighter transition-colors duration-1000" style={{ color: driftColor }}>
                {driftScore.toFixed(2)}
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mt-2 font-mono">
                 V_d = W / T - R
              </p>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[var(--text-secondary)]">Vibe Score Status</span>
                <span style={{ color: vibeColor, fontWeight: 500 }}>{vibeStatusText}</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-[var(--text-secondary)]">Drift Status</span>
                <span style={{ color: driftColor, fontWeight: 500 }}>{driftStatus}</span>
              </div>
            </div>
          </MotionDiv>

          {/* Session Progress Donut (Col 3) */}
          <MotionDiv variants={itemVariants} className="glass-card">
            <div className="card-eyebrow justify-between">
              <span><Target className="w-3 h-3 inline mr-1" /> Session Progress</span>
            </div>
            
            <div className="flex gap-6 items-center mt-4">
              <div className="relative shrink-0 w-[120px] h-[120px]">
                <svg viewBox="0 0 120 120" width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#progress-gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - (progressPercent/100))} className="transition-all duration-1000 ease-linear" />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--accent-primary)"/>
                      <stop offset="100%" stopColor="var(--accent-live)"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display font-bold text-[22px] text-[var(--text-primary)]">{Math.round(progressPercent)}%</span>
                  <span className="font-body text-[10px] text-[var(--text-secondary)]">Daily Goal</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                 <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--text-secondary)]">Focus Time</span>
                    <span className="text-[12px] font-mono text-[var(--text-primary)]">3h 12m</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--text-secondary)]">Break Time</span>
                    <span className="text-[12px] font-mono text-[var(--text-primary)]">45m</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--text-secondary)]">Sessions</span>
                    <span className="text-[12px] font-mono text-[var(--text-primary)]">4/6</span>
                 </div>
              </div>
            </div>
          </MotionDiv>

          {/* AI Rec (Col 1, Bottom) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col">
            <div className="card-eyebrow justify-between mb-4">
               <span>AI Recommendation</span>
            </div>
            <h2 className="font-display text-[22px] font-bold text-[var(--accent-live)] mb-2">Energize & Move</h2>
            <div className="flex gap-2 mb-3">
               <span className="badge badge--cyan">Optimal Choice</span>
               <span className="badge badge--success">Physical Reset</span>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">Your heart rate and focus variability suggest physical movement will restore execution velocity best.</p>
            
            <button className="btn-ghost mt-auto text-[13px]">View Recommendation</button>
          </MotionDiv>

          {/* Biometrics (Col 2, Bottom) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col col-span-1">
             <div className="card-eyebrow justify-between mb-2">
               <span>Biometric Signals</span>
               <span className="badge badge--cyan">LIVE</span>
             </div>
             
             <div className="flex flex-col flex-1 mt-2">
               {/* HR Row */}
               <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 py-2.5 border-b border-[var(--glass-border)]">
                 <div className="w-10 h-10 rounded-none bg-[rgba(239,68,68,0.15)] text-[var(--color-danger)] flex items-center justify-center"><Activity className="w-5 h-5"/></div>
                 <div>
                    <span className="font-display text-[24px] font-bold text-[var(--text-primary)]">{heartRate}</span>
                    <span className="text-[12px] text-[var(--text-secondary)] ml-1">BPM</span>
                 </div>
                 <div className="w-[80px] h-[24px]">{renderSparkline(hrData, "var(--color-danger)", 120)}</div>
               </div>
               
               {/* Focus Score Row */}
               <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 py-2.5 border-b border-[var(--glass-border)]">
                 <div className="w-10 h-10 rounded-none bg-[rgba(99,102,241,0.15)] text-[var(--accent-primary)] flex items-center justify-center"><BrainCircuit className="w-5 h-5"/></div>
                 <div>
                    <span className="font-display text-[24px] font-bold text-[var(--text-primary)]">{vibeScore}</span>
                    <span className="text-[12px] text-[var(--text-secondary)] ml-1">Score</span>
                 </div>
                 <div className="w-[80px] h-[24px]">{renderSparkline(fsData, "var(--accent-primary)", 100)}</div>
               </div>
               
               {/* Stress Row */}
               <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 py-2.5">
                 <div className="w-10 h-10 rounded-none bg-[rgba(16,185,129,0.15)] text-[var(--color-success)] flex items-center justify-center"><Zap className="w-5 h-5"/></div>
                 <div>
                    <span className="font-display text-[24px] font-bold text-[var(--text-primary)]">Low</span>
                    <span className="text-[12px] text-[var(--text-secondary)] ml-1">Stress</span>
                 </div>
                 <div className="w-[80px] h-[24px]">{renderSparkline([20,25,22,20,18,15,18,20], "var(--color-success)", 50)}</div>
               </div>
             </div>
          </MotionDiv>

          {/* Agent Activity Log (Col 3, Bottom) */}
          <MotionDiv variants={itemVariants} className="glass-card flex flex-col col-span-1">
            <div className="card-eyebrow justify-between mb-4">
              <span><TerminalSquare className="w-3 h-3 inline mr-1" /> Agent Activity Log</span>
              <a href="#" className="text-[var(--accent-primary)] hover:underline text-[10px] normal-case">View All</a>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <div className="space-y-2">
                {logs.slice(0,4).map((log, i) => (
                  <div key={i} className="grid grid-cols-[48px_24px_1fr_20px] items-start gap-2 py-2">
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)] pt-0.5 text-right">{log.time.split(' ')[0]}</span>
                    <div className="w-6 h-6 rounded-none flex items-center justify-center shadow-sm" style={{ backgroundColor: log.bg }}>
                      <log.icon className="w-3 h-3" style={{ color: log.color ? 'inherit' : undefined }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--accent-primary)] truncate">{log.title}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">{log.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>

        </motion.div>

        {/* CDR and Interventions */}
        <AnimatePresence>
          {interventionStage !== "NONE" && interventionStage !== "RESOLVED" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop- flex items-center justify-center p-8"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[var(--bg-surface)] max-w-[440px] w-full rounded-none shadow-none overflow-hidden flex flex-col border border-[var(--border-active)] p-10 relative"
              >
                {interventionStage === "CRITICAL" ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-none bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center mx-auto mb-6 relative">
                        <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" />
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[var(--color-danger)] opacity-75"></span>
                          <span className="relative inline-flex rounded-none h-3 w-3 bg-[var(--color-danger)]"></span>
                        </span>
                      </div>
                      <h2 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-2">EXECUTION VELOCITY CRITICAL</h2>
                      <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                        Deadline drift exceeded 0.50. Autonomous schedule recovery is recommended.
                      </p>
                    </div>

                    <div className="text-left bg-[var(--bg-elevated)] rounded-none p-6 border border-[var(--glass-border)] mb-8 relative">
                      <div className="absolute top-0 left-0 w-1 bg-[var(--accent-primary)] h-full rounded-none-l-[var(--radius-md)]"></div>
                      <h4 className="card-eyebrow mb-4"><Sparkles className="w-3 h-3 text-[var(--accent-primary)]"/> Future Timeline Simulator</h4>
                      
                      <div className="mb-5">
                        <div className="flex justify-between text-[12px] font-medium text-[var(--text-primary)] mb-2">
                          <span>Current Path</span>
                          <span className="text-[var(--color-danger)] font-mono">42% Success Prob.</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--glass-bg)] rounded-none overflow-hidden">
                          <div className="h-full bg-[var(--color-danger)]" style={{width: '42%'}}></div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-[12px] font-medium text-[var(--text-primary)] mb-2">
                          <span>Recommended Path <span className="badge badge--info ml-2 py-0">AI Adjusted</span></span>
                          <span className="text-[var(--color-success)] font-mono">83% Success Prob.</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--glass-bg)] rounded-none overflow-hidden">
                          <div className="h-full bg-[var(--color-success)]" style={{width: '83%'}}></div>
                        </div>
                      </div>

                      <p className="agent-thoughts">
                        I can increase your success probability to 83% by auto-negotiating your timeline and shifting non-essential meetings.
                      </p>
                      
                      <button 
                        onClick={() => setInterventionStage("RECOVERING")}
                        className="btn-primary w-full mt-4 py-3"
                      >
                        <Sparkles className="w-4 h-4" /> Apply Recovery Plan
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-none bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center mx-auto mb-6">
                      <RefreshCcw className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
                    </div>
                    <h2 className="text-[20px] font-display font-bold text-[var(--text-primary)] mb-2">Applying Recovery Plan...</h2>
                    <p className="text-[14px] text-[var(--text-secondary)] mb-1">Rescheduling calendar events...</p>
                    <p className="text-[14px] text-[var(--text-secondary)]">Drafting stakeholder extension request...</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
           {interventionStage === "RESOLVED" && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="fixed bottom-6 right-6 bg-[var(--bg-surface)] border border-[var(--border-active)] shadow-none rounded-none p-6 w-[400px] z-[2000]"
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                     <ShieldAlert className="w-5 h-5 text-[var(--accent-primary)]" />
                     <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Stakeholder Shield</h4>
                   </div>
                   <button onClick={() => setInterventionStage("NONE")} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><AlertTriangle className="w-4 h-4 opacity-0"/></button>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] mb-4 leading-relaxed">Velocity was critical. I've prepared a progress report and extension request based on your current work.</p>
                <div className="bg-[var(--bg-elevated)] p-3 rounded-none border border-[var(--glass-border)] mb-4 text-[12px] font-mono text-[var(--text-secondary)] leading-relaxed italic">
                  "Hi Team, quick update on the Hackathon build. We are currently at 83% projected completion, but I am shifting 1 meeting to ensure..."
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setInterventionStage("NONE")} className="flex-1 py-2 rounded-none bg-[rgba(99,102,241,0.15)] text-[var(--accent-primary)] text-[13px] font-medium hover:bg-[rgba(99,102,241,0.25)] transition-colors">Review Draft</button>
                  <button onClick={() => setInterventionStage("NONE")} className="py-2 px-4 rounded-none border border-[var(--glass-border)] text-[var(--text-secondary)] text-[13px] font-medium hover:bg-[var(--bg-elevated)] transition-colors">Dismiss</button>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </>
  );
}
