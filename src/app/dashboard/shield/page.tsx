"use client";

import { Shield, Mail, Zap, ArrowRight, ShieldAlert, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <Shield className="w-6 h-6 text-[var(--accent-primary)]" /> Stakeholder Shield
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Autonomous Deadline Negotiation and Drift Management.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="glass-card p-8 border border-[var(--color-warning)] bg-[rgba(245,158,11,0.05)] relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-2 bg-[var(--color-warning)] text-black text-[10px] font-bold uppercase tracking-widest border-b border-l border-[var(--color-warning)] shadow-[-2px_2px_0px_rgba(245,158,11,0.2)]">Active Protection</div>
             <h3 className="text-[24px] font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-[var(--color-warning)]" /> Deadline Drift Detected
             </h3>
             <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl font-body leading-relaxed mb-6">
               Your execution velocity for "Project Core Engine" has dropped below the threshold. VibeShift can automatically negotiate a 4-hour extension with your stakeholders to preserve your focus.
             </p>

             <div className="mb-6">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">Negotiation Tone</label>
               <div className="flex gap-2">
                 {["Professional", "Apologetic", "Assertive"].map(t => (
                   <button 
                     key={t}
                     onClick={() => setTone(t)}
                     className={`px-4 py-2 text-[12px] font-bold uppercase tracking-wider border transition-colors ${tone === t ? 'bg-[var(--accent-primary)] text-black border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </div>
             
             <button onClick={triggerShield} disabled={isGenerating} className="mt-2 px-6 py-3 bg-[var(--color-warning)] text-black font-bold uppercase tracking-wider text-[13px] hover:brightness-110 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1">
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
               Generate Negotiation Draft
             </button>
          </div>

          {draft && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card bg-[var(--bg-elevated)] p-8 relative">
               <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--bg-surface)] border-b border-l border-[var(--glass-border)] flex items-center justify-center">
                 <Mail className="w-5 h-5 text-[var(--accent-primary)]" />
               </div>
               <div className="flex justify-between items-end mb-6">
                  <h4 className="card-eyebrow text-[var(--accent-primary)] mb-0">Draft Ready for Review</h4>
                  <button onClick={handleCopy} className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
               </div>
               
               <textarea 
                 value={draft}
                 onChange={(e) => setDraft(e.target.value)}
                 className="w-full h-48 bg-[var(--bg-surface)] border border-[var(--glass-border)] p-5 font-mono text-[13px] text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--border-active)] transition-colors rounded-none shadow-inner"
               />
               <div className="mt-6 flex justify-end gap-4">
                 <button onClick={() => setDraft(null)} className="px-6 py-2 bg-transparent text-[var(--text-secondary)] border border-[var(--glass-border)] font-bold uppercase text-[12px] tracking-wider hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors">Discard</button>
                 <button className="px-6 py-2 bg-[var(--color-success)] text-white font-bold uppercase text-[12px] tracking-wider hover:brightness-110 transition-colors flex items-center gap-2 shadow-[3px_3px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1">
                   Approve & Send <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
