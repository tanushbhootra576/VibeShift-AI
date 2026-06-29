"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Send, X, Bot, Paperclip } from "lucide-react";

interface GhostDraft {
  id?: string;
  subject: string;
  body: string;
  target_recipient: string;
  attached_file_name?: string | null;
  confidence_score: number;
}

export function GhostDraftsWidget() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<GhostDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/v1/drafts/pending", {
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();
      if (data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (e) {
      console.error("Failed to fetch drafts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const handleSend = async (draft: GhostDraft) => {
    if (!user) return;
    try {
      await fetch(`/api/v1/drafts/${draft.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, edited_body: draft.body, edited_subject: draft.subject })
      });
      setDrafts(drafts.filter(d => d.id !== draft.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (draftId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/v1/drafts/${draftId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid })
      });
      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="memphis-card flex flex-col bg-[var(--memphis-yellow)] rounded-2xl border border-gray-100 h-full overflow-hidden w-full p-4 sm:p-5">
      <div className="card-eyebrow flex flex-wrap items-center justify-between gap-3 mb-3 border-b-2 border-black pb-3">
         <span className="flex items-center gap-2 font-display font-black text-sm sm:text-base"><Bot className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> GHOST DRAFTS</span>
         <span className="badge bg-white text-black border-black shadow-sm text-[9px] sm:text-[10px] py-1 px-2">{drafts.length} PENDING</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-1 h-full w-full">
        {loading ? (
           <div className="flex items-center justify-center h-full p-6 text-[12px] font-mono text-black/60 animate-pulse text-center">Syncing AI Drafts...</div>
        ) : drafts.length === 0 ? (
           <div className="flex items-center justify-center h-full p-6 text-[12px] font-mono text-black/60 text-center">No pending drafts. You are all caught up.</div>
        ) : (
           <div className="space-y-4 pr-1 sm:pr-2 pb-2">
             {drafts.map((draft, i) => (
               <div key={draft.id || i} className="bg-white p-4 rounded-xl border border-black shadow-sm group w-full">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
                   <p className="text-[10px] sm:text-[11px] font-mono font-bold text-gray-500 tracking-widest uppercase break-all leading-tight">To: {draft.target_recipient}</p>
                   <span className="self-start sm:self-auto text-[9px] sm:text-[10px] font-mono bg-[var(--memphis-mint)] px-2 py-1 rounded-full border border-black text-black whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                     {Math.round(draft.confidence_score * 100)}% Match
                   </span>
                 </div>
                 <h4 className="text-[14px] sm:text-[15px] font-display font-black leading-tight mb-2 line-clamp-2 sm:line-clamp-none break-words">{draft.subject}</h4>
                 <p className="text-[12px] sm:text-[13px] font-mono text-gray-700 line-clamp-3 sm:line-clamp-4 mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                   {draft.body}
                 </p>
                 {draft.attached_file_name && (
                   <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded mb-4 truncate border border-blue-200 w-full">
                     <Paperclip className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{draft.attached_file_name}</span>
                   </div>
                 )}
                 <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                   <button onClick={() => handleSend(draft)} className="flex-1 w-full min-h-[48px] flex items-center justify-center gap-2 bg-black text-white font-bold font-mono text-[11px] uppercase tracking-widest py-3 px-4 rounded-lg border-2 border-transparent hover:bg-[var(--memphis-pink)] transition-colors active:scale-[0.98]">
                     <Send className="w-4 h-4 flex-shrink-0" /> Approve
                   </button>
                   <button onClick={() => draft.id && handleReject(draft.id)} className="w-full sm:w-[56px] min-h-[48px] flex items-center justify-center gap-2 bg-transparent text-black font-bold font-mono py-3 px-4 rounded-lg border-2 border-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors active:scale-[0.98]">
                     <X className="w-5 h-5 flex-shrink-0" />
                     <span className="sm:hidden text-[11px] uppercase tracking-widest ml-1">Reject</span>
                   </button>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
