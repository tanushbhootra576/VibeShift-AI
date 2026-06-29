"use client";

import { Shield, Mail, Zap, ArrowRight, ShieldAlert, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";


export default function ShieldPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [tone, setTone] = useState("Professional");
  const [copied, setCopied] = useState(false);

  const triggerShield = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let content = "";
      if (tone === "Professional") {
        content = "Hi Team,\n\nQuick update: Due to unexpected complexity with the authentication module, I am adjusting my timeline to prioritize the core engine stability. I will be shifting the UI polish meeting to tomorrow.\n\nProjected delivery is now 4:00 PM. I'll push the latest stable commit shortly.\n\nBest,\nAutonomous Agent (on behalf of User)";
      } else if (tone === "Apologetic") {
        content = "Hi everyone,\n\nI sincerely apologize, but I am currently running behind schedule due to some heavy blockers in the backend code. I need to push our deadline by a few hours to ensure quality.\n\nThank you for understanding!\n\nBest,\nAutonomous Agent (on behalf of User)";
      } else {
        content = "Team,\n\nI am currently in a deep focus block and have muted notifications to ensure the core engine is delivered flawlessly. The deadline has been autonomously shifted to 4:00 PM to accommodate this execution phase.\n\nDo not interrupt.\n\n- VibeShift System";
      }
      setDraft(content);
      setIsGenerating(false);
      setCopied(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent gap-4">
        <div>
          <h2 className="text-[22px] md:text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <Shield className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" /> Stakeholder Shield
          </h2>
          <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] mt-1 font-body">Autonomous Deadline Negotiation and Drift Management.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          
          <div className="memphis-card p-5 md:p-8 border border-[var(--memphis-yellow)] bg-[rgba(245,158,11,0.05)] relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-1.5 md:p-2 bg-[var(--memphis-yellow)] text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-b border-l border-[var(--memphis-yellow)] shadow-sm">Active Protection</div>
             <h3 className="text-[20px] md:text-[24px] font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2 mt-4 md:mt-0">
                <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-yellow)]" /> Deadline Drift Detected
             </h3>
             <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] max-w-2xl font-body leading-relaxed mb-6">
               Your execution velocity for "Project Core Engine" has dropped below the threshold. VibeShift can automatically negotiate a 4-hour extension with your stakeholders to preserve your focus.
             </p>

             <div className="mb-6">
               <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 block">Negotiation Tone</label>
               <div className="flex flex-wrap gap-2 md:gap-3">
                 {["Professional", "Apologetic", "Assertive"].map(t => (
                   <button 
                     key={t}
                     onClick={() => setTone(t)}
                     className={`min-h-[44px] px-4 py-2 text-[11px] md:text-[12px] font-bold uppercase tracking-wider border transition-colors flex items-center justify-center ${tone === t ? 'bg-[var(--memphis-pink)] text-black border-[var(--memphis-pink)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--memphis-pink)] hover:text-[var(--text-primary)]'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </div>
             
             <button onClick={triggerShield} disabled={isGenerating} className="min-h-[44px] w-full md:w-auto mt-2 px-6 py-3 bg-[var(--memphis-yellow)] text-black font-bold uppercase tracking-wider text-[12px] md:text-[13px] hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1">
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
               Generate Negotiation Draft
             </button>
          </div>

          {draft && (
            <div className="memphis-card bg-[var(--bg-elevated)] p-5 md:p-8 relative">
               <div className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-[var(--bg-surface)] border-b border-l border-[var(--glass-border)] flex items-center justify-center">
                 <Mail className="w-4 h-4 md:w-5 md:h-5 text-[var(--memphis-pink)]" />
               </div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-3">
                  <h4 className="card-eyebrow text-[var(--memphis-pink)] mb-0 text-[10px] md:text-[12px]">Draft Ready for Review</h4>
                  <button onClick={handleCopy} className="min-h-[44px] text-[11px] md:text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-[var(--memphis-mint)]" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
               </div>
               
               <textarea 
                 value={draft}
                 onChange={(e) => setDraft(e.target.value)}
                 className="w-full h-48 md:h-56 bg-[var(--bg-surface)] border border-[var(--glass-border)] p-4 md:p-5 font-mono text-[12px] md:text-[13px] text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--border-active)] transition-colors rounded-none shadow-inner"
               />
               <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                 <button onClick={() => setDraft(null)} className="min-h-[44px] w-full sm:w-auto px-6 py-2 bg-transparent text-[var(--text-secondary)] border border-[var(--glass-border)] font-bold uppercase text-[11px] md:text-[12px] tracking-wider hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center">Discard</button>
                 <button className="min-h-[44px] w-full sm:w-auto px-6 py-2 bg-[var(--memphis-mint)] text-white font-bold uppercase text-[11px] md:text-[12px] tracking-wider hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1">
                   Approve & Send <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
