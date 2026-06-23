"use client";

import { TerminalSquare, Filter, Download, ArrowRight, BrainCircuit, Activity, Clock } from "lucide-react";

export default function LogsPage() {
  const logs = [
    { time: "7:42:18 PM", action: "COGNITIVE_LOAD_SPIKE", details: "Detected sustained high frequency keyboard input combined with elevated HR (82 BPM). Initiating break protocol evaluation.", agent: "VibeShift-Core-v2" },
    { time: "7:41:05 PM", action: "API_CALL", details: "Fetched Google Calendar schedule. Found open 15-minute window before next meeting.", agent: "Calendar-Integration" },
    { time: "7:35:12 PM", action: "SESSION_CALIBRATION", details: "User ignored previous break prompt. Adjusting threshold tolerance by +15% for current cycle.", agent: "Behavioral-Model" },
    { time: "7:19:00 PM", action: "SESSION_START", details: "Deep work mode activated. Suppressed 4 incoming non-critical notifications.", agent: "VibeShift-Core-v2" },
    { time: "6:45:30 PM", action: "TASK_ATOMICIZATION", details: "Broke down 'Q2 Planning Deck' into 4 sub-tasks based on historical velocity (18 mins per slide).", agent: "Gemini-Planner" },
    { time: "6:15:00 PM", action: "SLIP_CALIBRATION", details: "Meeting ran 15 minutes late. Automatically shifted afternoon focus blocks down by 15 mins. No conflicts detected.", agent: "Calendar-Integration" }
  ];

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">Full Agent Logs</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Audit every decision your AI operations partner makes.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-ghost">
            <Filter className="w-4 h-4" /> Filter Events
          </button>
          <button className="btn-primary bg-[var(--accent-live)] hover:bg-[var(--accent-live)] shadow-none text-[#080810]">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="glass-card p-0 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--glass-border)] text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)]">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-3">System Action</div>
            <div className="col-span-5">Audit Details</div>
            <div className="col-span-2 text-right">Sub-Agent</div>
          </div>
          
          <div className="divide-y divide-[var(--glass-border)] font-mono text-[13px]">
            {logs.map((log, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="col-span-2 text-[var(--text-tertiary)] text-[12px]">
                  {log.time}
                </div>
                <div className="col-span-3">
                  <span className={`badge ${
                    log.action.includes('SPIKE') || log.action.includes('SLIP') ? 'badge--warning' : 
                    log.action.includes('START') ? 'badge--success' : 
                    'badge--info'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <div className="col-span-5 text-[var(--text-secondary)] text-[12px] leading-relaxed font-body">
                  {log.details}
                </div>
                <div className="col-span-2 text-right text-[12px] text-[var(--text-tertiary)]">
                  {log.agent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
