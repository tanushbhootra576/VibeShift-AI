"use client";

import { Terminal, Cpu, Database, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

const MOCK_LOGS = [
  { time: "22:15:04", module: "SYS", level: "INFO", text: "VibeShift Core Engine initialized." },
  { time: "22:15:12", module: "VISION", level: "INFO", text: "Tesseract.js OCR engine spun up. Buffer ready." },
  { time: "22:17:33", module: "AGENT", level: "WARN", text: "Drift velocity exceeded safe threshold. Pre-computing interventions." },
  { time: "22:18:01", module: "SHIELD", level: "INFO", text: "Drafting stakeholder delay email for 'Pitch Deck'." },
  { time: "22:20:45", module: "GEMINI", level: "ERROR", text: "Rate limit triggered (429). Shifting to fallback execution." },
  { time: "22:20:46", module: "SYS", level: "INFO", text: "Fallback execution successful. Resuming normal operations." },
  { time: "22:25:00", module: "CALENDAR", level: "INFO", text: "Rescheduled 1 meeting. Cleared 45 mins of deep work capacity." },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<{time:string, module:string, level:string, text:string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < MOCK_LOGS.length) {
        setLogs(prev => [...prev, MOCK_LOGS[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] relative">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent gap-4">
        <div>
          <h2 className="text-[22px] md:text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2 md:gap-3">
             <Terminal className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" /> System Logs
          </h2>
          <p className="text-[12px] md:text-[14px] text-[var(--text-secondary)] mt-1 font-body">Live agent telemetry and execution history.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 text-[11px] md:text-[12px] font-bold uppercase text-[var(--text-secondary)] w-full md:w-auto">
           <div className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--glass-border)] flex items-center gap-2 flex-1 md:flex-none justify-center min-h-[44px]"><Cpu className="w-4 h-4 text-[var(--memphis-pink)]"/> 14% Load</div>
           <div className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--glass-border)] flex items-center gap-2 flex-1 md:flex-none justify-center min-h-[44px]"><Database className="w-4 h-4 text-[var(--memphis-teal)]"/> 24ms Ping</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="memphis-card p-4 md:p-6 min-h-full font-mono text-[12px] md:text-[13px] bg-[var(--bg-elevated)] shadow-inner overflow-x-auto">
          <div className="min-w-[600px]">
            {logs.map((log, i) => {
              if (!log) return null;
              return (
                <div 
                  key={i} 
                  className="mb-2 flex gap-4 border-b border-[var(--glass-border)] pb-2 hover:bg-[var(--bg-surface)] transition-colors cursor-crosshair min-h-[44px] items-center"
                >
                  <span className="text-[var(--text-tertiary)] shrink-0 w-20">[{log.time}]</span>
                  <span className={`shrink-0 w-16 font-bold ${log.level === 'ERROR' ? 'text-[var(--memphis-red)]' : log.level === 'WARN' ? 'text-[var(--memphis-yellow)]' : 'text-[var(--memphis-pink)]'}`}>
                     {log.level}
                  </span>
                  <span className="shrink-0 w-20 text-[var(--text-secondary)]">[{log.module}]</span>
                  <span className="text-[var(--text-primary)]">{log.text}</span>
                </div>
              );
            })}
            {isStreaming && (
              <div className="flex items-center gap-2 text-[var(--text-tertiary)] mt-4 animate-pulse min-h-[44px]">
                <RefreshCcw className="w-4 h-4 animate-spin" /> Awaiting new telemetry...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
