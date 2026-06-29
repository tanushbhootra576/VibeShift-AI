"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Zap, Brain, Shield, Upload, X, CheckCircle2,
  Circle, Clock, AlertTriangle, Phone, ChevronRight, Wind,
  Calendar, Inbox, Activity, Moon, Play, Pause, Eye, EyeOff,
  FileText, Flame, Target, BrainCircuit, Sparkles, Volume2,
  ArrowRight, TriangleAlert
} from "lucide-react";
import { useSanctuary } from "@/context/SanctuaryContext";

// Dynamic data will be fetched from Firestore

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ViewMode = "temporal" | "ingestion" | "sanctuary" | "escalator";
type SanctuaryMode = "zen" | "sprint" | "recovery";
type EscalatorLevel = 0 | 1 | 2 | 3;

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

// 1. Temporal Gravity Task Node
function TaskNode({ task, showShadow }: { task: any; showShadow: boolean }) {
  const urgentPulse = task.urgency > 7;
  const colorMap: Record<string, string> = {
    red: "border-l-[var(--memphis-red)]",
    amber: "border-l-[var(--memphis-yellow)]",
    cyan: "border-l-[var(--memphis-teal)]",
    pink: "border-l-[var(--memphis-pink)]",
  };
  const dotColorMap: Record<string, string> = {
    red: "bg-[var(--memphis-red)]",
    amber: "bg-[var(--memphis-yellow)]",
    cyan: "bg-[var(--memphis-teal)]",
    pink: "bg-[var(--memphis-pink)]",
  };

  return (
    <div className="relative">
      {urgentPulse && (
        <>
          <div className="absolute -inset-2 rounded-2xl border-4 border-[var(--memphis-red)] opacity-50 animate-ping" />
          <div className="absolute -inset-1 rounded-2xl border-4 border-[var(--memphis-yellow)] opacity-50 animate-pulse" />
        </>
      )}
      <div className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white border-4 border-black border-l-[8px] sm:border-l-[12px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer group touch-manipulation min-h-[72px] ${colorMap[task.color]}`}>
        {/* Mass Indicator - visual weight */}
        <div
          className={`shrink-0 rounded-full ${dotColorMap[task.color]} flex items-center justify-center border-2 border-black hidden sm:flex`}
          style={{ width: Math.max(32, task.urgency * 4), height: Math.max(32, task.urgency * 4) }}
        >
          <span className="text-[12px] font-black text-black">{Math.round(task.urgency)}</span>
        </div>
        <div
          className={`shrink-0 rounded-full ${dotColorMap[task.color]} flex sm:hidden items-center justify-center border-2 border-black`}
          style={{ width: 32, height: 32 }}
        >
          <span className="text-[10px] font-black text-black">{Math.round(task.urgency)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[14px] sm:text-[16px] font-black font-display uppercase tracking-tight text-black truncate">{task.title}</p>
          <p className="text-[11px] sm:text-[12px] font-mono font-bold text-gray-600 mt-0.5 truncate">{task.deadline} · {task.minutes}min</p>
        </div>
        <span className={`badge ${task.color === 'red' ? 'badge--danger' : task.color === 'amber' ? 'badge--warning' : 'badge--info'} border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] sm:text-[12px] px-2 py-1`}>
          {task.tag}
        </span>
      </div>
    </div>
  );
}

// 2. Temporal View
function TemporalView({ showShadow, setShowShadow, tasks, calendar, shadowEvents }: { showShadow: boolean; setShowShadow: (v: boolean) => void; tasks: any[]; calendar: any[]; shadowEvents: any[] }) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 h-full">
      {/* Left: Task Nodes (mass-weighted) */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] md:text-[24px] font-display font-black text-black uppercase tracking-tight">Temporal Gravity Canvas</h2>
            <p className="text-[12px] md:text-[13px] font-mono font-bold text-gray-600 mt-1">Node size = urgency mass. Pulsing = critical threshold.</p>
          </div>
          {/* Future Self Toggle */}
          <label className="relative flex sm:inline-flex items-center justify-between sm:justify-start cursor-pointer gap-3 bg-white border-4 border-black px-4 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto min-h-[48px] touch-manipulation">
            <span className="text-[12px] md:text-[13px] font-black uppercase tracking-widest text-black">Show Future Self</span>
            <div className="relative shrink-0 flex items-center">
              <input type="checkbox" className="sr-only peer" checked={showShadow} onChange={() => setShowShadow(!showShadow)} />
              <div className="w-12 h-6 bg-gray-200 border-2 border-black rounded-full peer peer-checked:bg-[var(--memphis-yellow)] transition-colors" />
              <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${showShadow ? 'translate-x-6' : ''}`} />
            </div>
            {showShadow && <Eye className="w-5 h-5 text-[var(--memphis-pink)] animate-pulse hidden sm:block" />}
          </label>
        </div>

        <div className="space-y-3 sm:space-y-4 pb-4">
          {tasks.map(t => <TaskNode key={t.id} task={t} showShadow={showShadow} />)}
        </div>
      </div>

      {/* Right: Calendar + Shadow Overlay */}
      <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 pb-10 xl:pb-0">
        <p className="text-[12px] md:text-[13px] font-black uppercase tracking-widest text-black bg-[var(--memphis-yellow)] border-4 border-black p-3 text-center rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Timeline · Today</p>
        <div className="relative space-y-3 flex-1 min-h-[300px]">
          {/* Base layer */}
          {calendar.map(ev => {
            const evColorMap: Record<string, string> = {
              pink: "border-l-[var(--memphis-pink)]",
              cyan: "border-l-[var(--memphis-teal)]",
              emerald: "border-l-[var(--memphis-mint)]",
              blue: "border-l-[var(--memphis-blue)]",
              yellow: "border-l-[var(--memphis-yellow)]"
            };
            return (
              <div
                key={ev.id}
                className={`p-3 sm:p-4 rounded-2xl bg-white border-4 border-black border-l-[8px] sm:border-l-[12px] text-[13px] sm:text-[14px] font-black font-display uppercase tracking-tight text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${evColorMap[ev.color]}`}
              >
                <span className="text-[11px] sm:text-[12px] font-mono font-bold text-gray-500 block mb-1">{ev.time}</span>
                {ev.title}
              </div>
            );
          })}

          {/* Shadow overlay */}
          <AnimatePresence>
            {showShadow && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 -mx-2 -my-2 rounded-3xl bg-[var(--memphis-yellow)]/20 border-4 border-dashed border-black backdrop-blur-sm p-4 space-y-3 flex flex-col justify-end pointer-events-none"
              >
                <div className="absolute top-4 right-4 bg-[var(--memphis-red)] border-2 border-black text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest shadow-sm">
                  PROJECTED FUTURE
                </div>
                {shadowEvents.map(ev => (
                  <motion.div
                    key={ev.id}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-3 sm:p-4 rounded-2xl border-4 border-black text-[12px] sm:text-[13px] font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      ev.severity === 'encroached'
                        ? 'bg-[var(--memphis-red)] text-white'
                        : 'bg-[var(--memphis-yellow)]'
                    }`}
                  >
                    <span className="text-[11px] sm:text-[12px] font-mono font-bold opacity-90 block mb-1">{ev.time}</span>
                    <span className="font-black text-[13px] sm:text-[15px]">{ev.title}</span>
                    {ev.reason && <p className="text-[10px] sm:text-[11px] mt-2 opacity-100 font-mono font-bold bg-white text-black p-2 border-2 border-black rounded-lg">⚠ {ev.reason}</p>}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 3. Zero-Input Ingestion Portal
function IngestionView({ milestones }: { milestones: any[] }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleDrop = useCallback(() => {
    setIsDragOver(false);
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); }, 2200);
  }, []);

  const reset = () => { setDone(false); setProcessing(false); };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full max-w-4xl mx-auto w-full">
      <div className="text-center mb-2 sm:mb-4">
        <h2 className="text-[24px] sm:text-[32px] font-black text-black font-display uppercase tracking-tight">Zero-Input Ingestion Portal</h2>
        <p className="text-[12px] sm:text-[14px] font-mono font-bold text-gray-600 mt-2">Drop any file. The AI extracts tasks, deadlines, and milestones automatically.</p>
      </div>

      <AnimatePresence mode="wait">
        {!processing && !done && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); handleDrop(); }}
            onClick={handleDrop}
            className={`flex-1 min-h-[300px] border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 sm:gap-6 cursor-pointer transition-all duration-300 p-6 touch-manipulation ${
              isDragOver
                ? 'border-[var(--memphis-mint)] bg-[var(--memphis-mint)]/10 scale-[1.02]'
                : 'border-black bg-white hover:border-[var(--memphis-pink)] hover:bg-gray-50'
            }`}
          >
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black flex items-center justify-center transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isDragOver ? 'bg-[var(--memphis-mint)]' : 'bg-[var(--memphis-yellow)]'}`}>
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
            </div>
            <div className="text-center">
              <p className="text-black font-black text-[18px] sm:text-[24px] uppercase tracking-tight">Drop Syllabus, Invoice, or Email Thread</p>
              <p className="text-gray-500 font-mono font-bold text-[12px] sm:text-[14px] mt-2">PDF · DOCX · PNG · EML supported</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
              {["PDF", "DOCX", "IMG", "EML"].map(f => (
                <span key={f} className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest bg-[var(--memphis-pink)] border-2 border-black text-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {processing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 rounded-3xl border-4 border-black bg-white p-6 sm:p-10 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[var(--memphis-blue)] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-[16px] sm:text-[20px] font-black uppercase text-black leading-tight">Gemini Vision Processing...</p>
                <p className="text-[11px] sm:text-[13px] font-mono font-bold text-gray-500 mt-1">Extracting tasks, deadlines, and weights</p>
              </div>
            </div>
            {[0.85, 0.6, 0.95, 0.4].map((w, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <div className="h-3 sm:h-4 rounded-full bg-[#f0ede8] border-2 border-black shimmer-block relative overflow-hidden" style={{ width: `${w * 100}%` }} />
                <div className="h-2 rounded-full bg-gray-200 border border-black shimmer-block relative overflow-hidden" style={{ width: `${w * 60}%` }} />
              </div>
            ))}
          </motion.div>
        )}

        {done && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-4 sm:gap-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 text-[var(--memphis-mint)]">
                <CheckCircle2 className="w-6 h-6 text-black" fill="currentColor" />
                <span className="text-[14px] sm:text-[16px] font-black uppercase text-black">4 milestones extracted</span>
              </div>
              <button onClick={reset} className="memphis-btn bg-white hover:bg-[var(--memphis-yellow)] text-xs py-3 px-4 shadow-sm text-black w-full sm:w-auto flex justify-center">
                <X className="w-4 h-4 mr-1" /> Reset
              </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 pb-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 sm:p-6 rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      {m.done
                        ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 text-[var(--memphis-mint)] shrink-0" fill="currentColor" />
                        : <Circle className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 text-black shrink-0 border-2 border-black rounded-full" />
                      }
                      <span className="text-[16px] sm:text-[18px] font-black uppercase text-black font-display tracking-tight leading-tight">{m.title}</span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-mono font-bold bg-[var(--memphis-yellow)] border-2 border-black px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">{m.deadline}</span>
                  </div>
                  <div className="w-full h-3 sm:h-4 bg-gray-100 rounded-full border-2 border-black overflow-hidden relative shadow-inner mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full border-r-2 border-black ${m.done ? 'bg-[var(--memphis-mint)]' : m.pct > 50 ? 'bg-[var(--memphis-teal)]' : 'bg-[var(--memphis-pink)]'}`}
                    />
                  </div>
                  <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-black text-right">{m.pct}% complete</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 4. Sanctuary View (Zen / Sprint / Recovery)
function SanctuaryView({ tasks, calendar }: { tasks: any[]; calendar: any[] }) {
  const [mode, setMode] = useState<SanctuaryMode>("zen");
  const [progress, setProgress] = useState(58);
  const [running, setRunning] = useState(false);
  const { setSanctuaryMode } = useSanctuary();

  const handleModeChange = (m: SanctuaryMode) => {
    setMode(m);
    setSanctuaryMode(m);
  };
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setProgress(p => Math.min(100, p + 0.5)), 500);
    return () => clearInterval(id);
  }, [running]);

  const modeConfig = {
    zen: { label: "Zen Mode", icon: Moon, desc: "Strategic planning. Full system view." },
    sprint: { label: "Sprint Mode", icon: Zap, desc: "Tunnel-vision execution. Max focus." },
    recovery: { label: "Recovery Mode", icon: Wind, desc: "Burnout prevention. Breathe first." },
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full max-w-5xl mx-auto w-full">
      {/* Mode switcher */}
      <div className="flex flex-row overflow-x-auto sm:flex-row gap-2 sm:gap-4 pb-2 sm:pb-0 scroll-smooth touch-pan-x hide-scrollbar shrink-0">
        {(["zen", "sprint", "recovery"] as SanctuaryMode[]).map(m => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const isActive = mode === m;
          
          let activeClasses = "";
          if (m === 'zen') activeClasses = "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]";
          if (m === 'sprint') activeClasses = "bg-[var(--memphis-teal)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]";
          if (m === 'recovery') activeClasses = "bg-[var(--memphis-mint)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]";

          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex flex-col items-center gap-2 py-3 sm:py-4 px-2 sm:px-3 rounded-2xl border-4 border-black text-[11px] sm:text-[13px] font-black uppercase tracking-widest transition-all min-h-[72px] sm:min-h-[88px] ${
                isActive ? activeClasses : 'bg-gray-100 text-gray-500 hover:bg-white hover:border-black hover:text-black'
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              {m}
            </button>
          );
        })}
      </div>

      {/* Mode Canvas */}
      <div className="flex-1 relative overflow-hidden rounded-3xl min-h-[400px]">
        <AnimatePresence mode="wait">

          {/* ZEN */}
          {mode === 'zen' && (
            <motion.div key="zen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto hide-scrollbar pb-10"
            >
              <div className="p-4 sm:p-6 rounded-3xl border-4 border-black bg-white flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-max">
                <p className="text-[12px] sm:text-[14px] font-black bg-[var(--memphis-yellow)] border-2 border-black inline-block px-3 py-1 rounded-full uppercase tracking-widest w-max mb-2">Calendar Timeline</p>
                {calendar.slice(0, 4).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 sm:gap-4 border-b-4 border-dashed border-gray-200 pb-3 last:border-0">
                    <span className="text-[12px] sm:text-[13px] font-mono font-bold text-gray-500 w-12 sm:w-14 shrink-0">{ev.time}</span>
                    <div className={`flex-1 h-10 sm:h-12 rounded-xl bg-white border-4 border-black flex items-center px-3 sm:px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      ev.color === 'pink' ? 'border-l-[8px] sm:border-l-[12px] border-l-[var(--memphis-pink)]' :
                      ev.color === 'cyan' ? 'border-l-[8px] sm:border-l-[12px] border-l-[var(--memphis-teal)]' :
                      'border-l-[8px] sm:border-l-[12px] border-l-black'
                    }`}>
                      <span className="text-[12px] sm:text-[13px] font-black uppercase text-black truncate">{ev.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 rounded-3xl border-4 border-black bg-[var(--memphis-pink)] flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden h-[400px] md:h-auto">
                <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none" />
                <p className="text-[12px] sm:text-[14px] font-black bg-white text-black border-2 border-black inline-block px-3 py-1 rounded-full uppercase tracking-widest w-max mb-2 relative z-10 shadow-sm shrink-0">Task Backlog</p>
                <div className="space-y-3 relative z-10 overflow-y-auto custom-scrollbar flex-1 pb-4">
                  {tasks.map(t => (
                    <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-4 h-4 rounded-full border-2 border-black shrink-0 ${t.color === 'red' ? 'bg-[var(--memphis-red)]' : t.color === 'amber' ? 'bg-[var(--memphis-yellow)]' : 'bg-[var(--memphis-teal)]'}`} />
                        <span className="text-[13px] sm:text-[14px] font-black uppercase truncate text-black">{t.title}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-gray-100 border-2 border-black px-2 py-1 rounded-lg shrink-0 self-start sm:self-auto">{t.deadline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SPRINT */}
          {mode === 'sprint' && (
            <motion.div key="sprint" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 sm:gap-8 bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 overflow-hidden"
            >
              <div className="absolute inset-0 pattern-stripes opacity-10 pointer-events-none" />
              <div className="bg-black text-white px-3 sm:px-4 py-2 border-4 border-[var(--memphis-teal)] rounded-2xl relative z-10 shadow-[4px_4px_0px_0px_var(--memphis-teal)]">
                <p className="text-[11px] sm:text-[13px] font-mono font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[var(--memphis-teal)] rounded-full animate-pulse inline-block" /> Critical Block Active
                </p>
              </div>
              
              <h2 className="text-[28px] sm:text-[40px] md:text-[56px] font-black text-black font-display tracking-tight text-center px-2 sm:px-4 uppercase leading-none relative z-10">
                Finalize Pitch Deck
              </h2>
              
              {/* Progress Ring */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 z-10 shrink-0">
                <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                  <circle
                    cx="60" cy="60" r="54"
                    stroke="var(--memphis-teal)" strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full border-[6px] sm:border-8 border-black shadow-inner m-5 sm:m-6">
                  <span className="text-[24px] sm:text-[32px] font-black text-black font-display">{Math.round(progress)}%</span>
                  <span className="text-[10px] sm:text-[12px] font-black text-gray-500 uppercase tracking-widest mt-0.5 sm:mt-1">Complete</span>
                </div>
              </div>
              <button
                onClick={() => setRunning(!running)}
                className="memphis-btn flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 justify-center text-[16px] sm:text-[18px] relative z-10 w-full sm:w-auto"
              >
                {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {running ? "Pause" : "Resume Focus"}
              </button>
            </motion.div>
          )}

          {/* RECOVERY */}
          {mode === 'recovery' && (
            <motion.div key="recovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
              <div className="max-w-xl w-full bg-[var(--memphis-mint)] border-4 sm:border-8 border-black rounded-3xl p-6 sm:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10 flex flex-col items-center max-h-full overflow-y-auto">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 sm:mb-8 text-[32px] sm:text-[40px] shrink-0">🌿</div>
                <h3 className="text-[24px] sm:text-[36px] font-black text-black font-display uppercase tracking-tight mb-3 sm:mb-4 leading-none">Time to step back</h3>
                <p className="text-black font-bold text-[14px] sm:text-[16px] mb-6 sm:mb-8 leading-relaxed font-mono">
                  Cognitive load detected. Your dense task queue has been hidden. Let's start small.
                </p>
                <div className="p-4 sm:p-6 bg-white border-4 border-black rounded-2xl mb-6 sm:mb-8 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-black text-[15px] sm:text-[18px] font-black font-display uppercase leading-relaxed">
                    "Take a breath. Let's do just 3 minutes of reviewing slides."
                  </p>
                </div>
                <button className="memphis-btn memphis-btn--yellow w-full py-4 sm:py-5 text-[16px] sm:text-[18px] justify-center mt-auto">
                  Begin Micro-Step
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 5. Escalator View
function EscalatorView() {
  const [level, setLevel] = useState<EscalatorLevel>(0);
  const [hijackActive, setHijackActive] = useState(false);
  const [callActive, setCallActive] = useState(false);

  const advance = () => {
    const next = Math.min(3, level + 1) as EscalatorLevel;
    setLevel(next);
    if (next === 2) setHijackActive(true);
    if (next === 3) { setHijackActive(false); setCallActive(true); }
  };
  const reset = () => { setLevel(0); setHijackActive(false); setCallActive(false); };

  const levelConfig = [
    { label: "Idle", color: "gray", desc: "No active escalation." },
    { label: "Nudge", color: "blue", desc: "Friendly reminder dispatched." },
    { label: "Hijack", color: "amber", desc: "Distraction override active." },
    { label: "AI Call", color: "red", desc: "Twilio voice call dispatched." },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full max-w-4xl mx-auto w-full">
      <div className="text-center mb-2 sm:mb-4">
        <h2 className="text-[24px] sm:text-[32px] font-black text-black tracking-tight font-display uppercase">Anti-Procrastination Escalator</h2>
        <p className="text-[12px] sm:text-[14px] font-mono font-bold text-gray-600 mt-2">Progressive accountability from gentle nudge to live AI phone call.</p>
      </div>

      {/* Level Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {levelConfig.map((cfg, i) => (
          <div key={i} className={`py-3 sm:py-4 px-2 sm:px-3 rounded-2xl border-4 text-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            level === i
              ? i === 0 ? 'border-black bg-white'
                : i === 1 ? 'border-black bg-[var(--memphis-blue)]'
                : i === 2 ? 'border-black bg-[var(--memphis-yellow)]'
                : 'border-black bg-[var(--memphis-red)] animate-pulse'
              : 'border-black bg-gray-100 opacity-50 grayscale'
          }`}>
            <p className={`text-[10px] sm:text-[12px] font-mono uppercase font-black tracking-widest ${level === i && i > 0 ? 'text-black' : 'text-gray-500'}`}>
              L{i}
            </p>
            <p className={`text-[13px] sm:text-[16px] font-black uppercase mt-1 ${level === i && i > 0 ? 'text-black' : 'text-gray-700'} truncate`}>{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* Level 1 Banner */}
      <AnimatePresence>
        {level >= 1 && (
          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
            className="p-4 sm:p-6 rounded-2xl border-4 border-black bg-[var(--memphis-teal)] flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-stripes opacity-20 pointer-events-none" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shrink-0 relative z-10 hidden md:flex">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-[16px] sm:text-[18px] font-black uppercase text-black leading-tight">Friendly Nudge Dispatched</p>
              <p className="text-[11px] sm:text-[13px] font-mono font-bold text-black bg-white px-2 py-1 sm:px-3 sm:py-1 border-2 border-black rounded-lg inline-block mt-2 shadow-sm whitespace-normal sm:whitespace-nowrap">Pitch Deck deadline approaching — 90 minutes remain.</p>
            </div>
            <span className="text-[10px] sm:text-[12px] font-black bg-white border-4 border-black text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative z-10 self-start md:self-auto w-max mt-2 md:mt-0">Level 1</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level 3 Call UI */}
      <AnimatePresence>
        {callActive && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="p-6 sm:p-8 rounded-3xl border-[6px] sm:border-8 border-black bg-[var(--memphis-red)] flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-squiggles opacity-30 pointer-events-none text-white" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-black flex items-center justify-center animate-pulse shrink-0 relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--memphis-red)]" fill="currentColor" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <p className="text-[20px] sm:text-[24px] font-black uppercase text-white tracking-tight leading-tight">AI Voice Call Active</p>
              <p className="text-[12px] sm:text-[14px] font-black font-mono text-black bg-white border-4 border-black px-3 sm:px-4 py-2 rounded-xl mt-3 inline-block shadow-sm">"Hi Alex, there are only 30 minutes left. Let's get moving."</p>
              <div className="flex justify-center md:justify-start gap-1.5 sm:gap-2 mt-4 sm:mt-6 h-8 items-end">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 sm:w-2 rounded-full bg-white border-2 border-black animate-pulse" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <div className="text-[12px] sm:text-[14px] font-black bg-black text-white px-3 sm:px-4 py-2 rounded-xl uppercase tracking-widest relative z-10 border-4 border-white transform rotate-3 mt-4 md:mt-0">Twilio</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto pt-6 pb-8">
        <button
          onClick={advance}
          disabled={level === 3}
          className="memphis-btn memphis-btn--pink flex-1 py-4 sm:py-5 justify-center text-[14px] sm:text-[16px] disabled:opacity-50 disabled:grayscale min-h-[56px]"
        >
          <TriangleAlert className="w-5 h-5" />
          {level === 0 ? "Simulate Ignored Task" : level === 1 ? "Escalate to Hijack" : level === 2 ? "Fire AI Voice Call" : "Max Level Reached"}
        </button>
        {level > 0 && (
          <button onClick={reset} className="w-full sm:w-auto px-6 py-4 sm:py-5 bg-white hover:bg-gray-100 text-black font-black uppercase text-[14px] rounded-2xl sm:rounded-full border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-2 min-h-[56px]">
            <X className="w-5 h-5 text-[var(--memphis-red)]" /> Reset
          </button>
        )}
      </div>

      {/* Full-screen Level 2 Hijack Overlay */}
      <AnimatePresence>
        {hijackActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[var(--bg-base)]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 pattern-zigzag opacity-10 pointer-events-none text-[var(--memphis-red)]" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-white border-[6px] sm:border-8 border-black rounded-3xl p-6 sm:p-10 text-center relative shadow-[16px_16px_0px_0px_var(--memphis-yellow)] sm:shadow-[24px_24px_0px_0px_var(--memphis-yellow)] max-h-[100dvh] overflow-y-auto"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--memphis-yellow)] border-4 border-black flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-black animate-pulse" />
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-black text-black mb-4 tracking-tight uppercase font-display leading-none">Hold on, Alex.</h2>
              <p className="text-black font-mono font-bold text-[14px] sm:text-[16px] leading-relaxed mb-8 sm:mb-10 border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left bg-gray-50">
                You have a <strong className="bg-[var(--memphis-yellow)] px-1 border-2 border-black rounded whitespace-nowrap inline-block mt-1">Pitch Deck</strong> due in <strong className="bg-[var(--memphis-red)] text-white px-1 border-2 border-black rounded whitespace-nowrap inline-block mt-1">90 minutes</strong>.<br /><br />
                Let's spend just 3 minutes setting up the template.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => setHijackActive(false)}
                  className="memphis-btn memphis-btn--pink w-full py-4 justify-center text-[16px] sm:text-[18px] min-h-[56px]"
                >
                  <Zap className="w-5 h-5" /> Start 3-Minute Sprint
                </button>
                <button
                  onClick={() => setHijackActive(false)}
                  className="w-full py-4 bg-white text-gray-500 hover:text-black hover:bg-gray-100 text-[11px] sm:text-[12px] font-black border-2 border-transparent hover:border-black rounded-xl uppercase tracking-widest transition-all min-h-[48px]"
                >
                  Ignore & Continue Procrastinating
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, getDocs, writeBatch, doc } from "firebase/firestore";

export default function CommandCenterDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = (searchParams.get("view") as ViewMode) || "temporal";
  const [showShadow, setShowShadow] = useState(false);
  const [now, setNow] = useState(new Date());

  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [shadowEvents, setShadowEvents] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveView = (view: ViewMode) => {
    router.push(`/dashboard?view=${view}`);
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const initData = async () => {
      const stateRef = doc(db, "users", user.uid, "commandCenter", "state");
      const snap = await getDocs(collection(db, "users", user.uid, "commandCenter"));
      
      if (snap.empty) {
        const batch = writeBatch(db);
        batch.set(doc(db, "users", user.uid, "commandCenter", "tasks"), {
          data: [
            { id: "t1", title: "Finalize Pitch Deck", minutes: 300, urgency: 9.8, deadline: "in 90 min", tag: "CRITICAL", color: "red" },
            { id: "t2", title: "Review API Pull Request", minutes: 90, urgency: 6.2, deadline: "in 4 hrs", tag: "BLOCKING", color: "amber" },
            { id: "t3", title: "Write Sprint Retrospective", minutes: 45, urgency: 3.1, deadline: "Tomorrow", tag: "LOW", color: "cyan" },
            { id: "t4", title: "Update Documentation", minutes: 60, urgency: 2.5, deadline: "Friday", tag: "BACKLOG", color: "pink" },
          ]
        });
        batch.set(doc(db, "users", user.uid, "commandCenter", "calendar"), {
          data: [
            { id: "c1", time: "10:00", title: "Daily Standup", type: "fixed", color: "pink" },
            { id: "c2", time: "11:00", title: "Pitch Deck Deep Work", type: "focus", color: "cyan", urgent: true },
            { id: "c3", time: "13:00", title: "Lunch Break", type: "personal", color: "emerald" },
            { id: "c4", time: "15:00", title: "Client Demo", type: "fixed", color: "blue" },
            { id: "c5", time: "Sat 09:00", title: "Saturday Sleep-In", type: "sacred", color: "yellow" },
          ]
        });
        batch.set(doc(db, "users", user.uid, "commandCenter", "shadowEvents"), {
          data: [
            { id: "s2", title: "API PR Review — PUSHED", time: "Sat 08:00", severity: "shifted" },
            { id: "s5", title: "Saturday Sleep-In — ENCROACHED", time: "Sat 09:30", severity: "encroached", reason: "Pitch Deck delay forces 3hr work spill into weekend." },
          ]
        });
        batch.set(doc(db, "users", user.uid, "commandCenter", "milestones"), {
          data: [
            { id: "m1", title: "Project Structure Setup", pct: 100, done: true, deadline: "Mon Jun 23" },
            { id: "m2", title: "Core Feature Implementation", pct: 75, done: false, deadline: "Wed Jun 25" },
            { id: "m3", title: "UI/UX Polish Pass", pct: 20, done: false, deadline: "Fri Jun 27" },
            { id: "m4", title: "Final Submission & Demo Video", pct: 0, done: false, deadline: "Sun Jun 29" },
          ]
        });
        await batch.commit();
      }
    };
    
    initData();

    const unsubTasks = onSnapshot(doc(db, "users", user.uid, "commandCenter", "tasks"), doc => setTasks(doc.data()?.data || []));
    const unsubCal = onSnapshot(doc(db, "users", user.uid, "commandCenter", "calendar"), doc => setCalendar(doc.data()?.data || []));
    const unsubShadow = onSnapshot(doc(db, "users", user.uid, "commandCenter", "shadowEvents"), doc => setShadowEvents(doc.data()?.data || []));
    const unsubMilestones = onSnapshot(doc(db, "users", user.uid, "commandCenter", "milestones"), doc => setMilestones(doc.data()?.data || []));

    setIsLoading(false);
    return () => {
      unsubTasks();
      unsubCal();
      unsubShadow();
      unsubMilestones();
    };
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const navItems: { id: ViewMode; label: string; icon: React.ElementType; accent: string }[] = [
    { id: "temporal", label: "Temporal Gravity", icon: Activity, accent: "teal" },
    { id: "ingestion", label: "Zero-Input Portal", icon: Upload, accent: "pink" },
    { id: "sanctuary", label: "Focus Sanctuary", icon: Brain, accent: "mint" },
    { id: "escalator", label: "Escalator", icon: Flame, accent: "yellow" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] text-black overflow-hidden font-body">

      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between pt-4 pb-2 pl-[72px] pr-4 md:px-8 border-b-4 border-black bg-white z-10 relative gap-3 md:gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0 scroll-smooth touch-pan-x">
          {/* View Switcher Tabs */}
          <div className="flex gap-2 shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-black uppercase tracking-widest transition-all rounded-xl min-h-[44px] touch-manipulation ${
                    active
                      ? `bg-[var(--memphis-${item.accent})] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]`
                      : 'bg-white text-gray-500 border-2 border-transparent hover:border-black hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0 overflow-x-auto hide-scrollbar pb-1 md:pb-0 w-full md:w-auto self-start md:self-auto">
          {/* Live clock */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[14px] font-mono font-black text-black bg-white border-2 border-black px-3 sm:px-4 py-2 rounded-xl shadow-sm shrink-0 min-h-[40px]">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--memphis-blue)]" />
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
          {/* System status */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black font-mono uppercase tracking-widest text-black bg-[var(--memphis-mint)] border-2 border-black px-3 py-2 rounded-xl shadow-sm shrink-0 min-h-[40px]">
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-black animate-pulse" />
            <span>Agent Active</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 30 }}
            className="h-full"
          >
            {activeView === "temporal" && <TemporalView showShadow={showShadow} setShowShadow={setShowShadow} tasks={tasks} calendar={calendar} shadowEvents={shadowEvents} />}
            {activeView === "ingestion" && <IngestionView milestones={milestones} />}
            {activeView === "sanctuary" && <SanctuaryView tasks={tasks} calendar={calendar} />}
            {activeView === "escalator" && <EscalatorView />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
