"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Loader2, Sparkles, Activity } from "lucide-react";

export function BufferInsightsWidget() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<{
    total_cascades_prevented: number;
    total_time_buffered: number;
    strategy_distribution: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadInsights = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/v1/buffers/insights", {
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (e) {
      console.error("Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [user]);

  const simulateCompletion = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      // Simulate completing a meeting 15 minutes late
      const now = new Date();
      const scheduledDuration = 30; // 30 min meeting
      const actualEnd = new Date(now.getTime() + 15 * 60000); // 15 mins late

      await fetch("/api/v1/telemetry/log-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          event_id: `evt_mock_${Date.now()}`,
          category: "meeting",
          start_time: now.toISOString(),
          actual_end_time: actualEnd.toISOString(),
          scheduled_duration: scheduledDuration
        })
      });
      
      // Then trigger analyze and inject to simulate the background job responding to the telemetry
      await fetch("/api/v1/buffers/analyze-and-inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          eventId: `evt_next_${Date.now()}`,
          eventTitle: "Mock Following Event",
          category: "meeting",
          scheduledDurationMinutes: 60,
          targetDateISO: now.toISOString()
        })
      });

      await loadInsights();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="memphis-card h-full w-full flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[var(--memphis-pink)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="memphis-card flex flex-col h-full w-full bg-[var(--memphis-yellow)] border-2 border-black relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>
      
      <div className="card-eyebrow flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10 border-b-2 border-black pb-3">
        <span className="text-black flex items-center text-xs sm:text-sm font-bold whitespace-nowrap"><Activity className="w-4 h-4 inline mr-1 flex-shrink-0 text-black" /> Dynamic Buffers</span>
        <span className="badge bg-white text-black border border-black uppercase tracking-widest font-black text-[9px] sm:text-[10px]">AI ACTIVE</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 py-4 w-full">
        <div className="text-[32px] sm:text-[40px] font-black font-mono text-black leading-none tracking-tighter flex items-baseline justify-center flex-wrap">
          {insights?.total_time_buffered || 0}
          <span className="text-[10px] sm:text-[12px] ml-1 uppercase tracking-widest">MINS</span>
        </div>
        <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-widest text-black/70 mt-2">Total Protected Time</p>
        
        <div className="flex flex-row items-center gap-3 mt-6 bg-white border-2 border-black rounded-xl px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] w-full max-w-[260px]">
           <ShieldAlert className="w-6 h-6 flex-shrink-0 text-[var(--memphis-red)]" />
           <div className="text-left leading-tight flex-1">
             <div className="text-[16px] sm:text-[18px] font-black text-black">{insights?.total_cascades_prevented || 0}</div>
             <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 leading-none">Cascades Prevented</div>
           </div>
        </div>
      </div>

      <button 
        onClick={simulateCompletion} 
        disabled={isSimulating}
        className="w-full mt-4 bg-white text-black font-black uppercase text-[10px] sm:text-[11px] tracking-widest py-3 px-4 min-h-[48px] border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 relative z-10 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />}
        <span className="truncate">Simulate Delay Telemetry</span>
      </button>
    </div>
  );
}
