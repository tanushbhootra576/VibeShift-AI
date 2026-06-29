"use client";

import { BrainCircuit, Sparkles, Target, Activity, Clock, Zap, ArrowRight, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, getDocs, writeBatch, deleteDoc, addDoc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

type Recommendation = {
  id: string;
  type: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  shadowColor: string;
  action: string;
  status: string;
};

const iconMap: Record<string, any> = {
  Clock: Clock,
  Target: Target,
  Activity: Activity,
  Zap: Zap,
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const recsRef = collection(db, "users", user.uid, "recommendations");
    
    getDocs(recsRef).then(snapshot => {
      if (snapshot.empty) {
        const defaultRecs: Recommendation[] = [
          { id: "1", type: "SCHEDULE_OPTIMIZATION", title: "Reserve 3-Hour Deep Work Block", description: "You have a continuous 3-hour block available tomorrow morning. Based on your historical velocity, mornings are your peak execution window. Should I reserve this for 'Finalize Project Presentation'?", iconName: "Clock", color: "var(--memphis-pink)", shadowColor: "#FF2D78", action: "Reserve Block", status: "ACTIVE" },
          { id: "2", type: "TASK_SHIFT", title: "Tackle Quick Wins Now", description: "It's 2:00 PM. Based on your biometric data, your execution velocity drops 15% post-lunch. I recommend clearing 'Respond to Client Emails' now before starting your next heavy cognitive load task.", iconName: "Target", color: "var(--memphis-yellow)", shadowColor: "#F5A623", action: "Start Task", status: "ACTIVE" },
          { id: "3", type: "RECOVERY_NUDGE", title: "Kinetic Reset Required", description: "You've been in a continuous flow state for 110 minutes. Your focus variability suggests cognitive fatigue is imminent. Take a 15-minute physical reset to preserve overall daily velocity.", iconName: "Activity", color: "var(--memphis-blue)", shadowColor: "#2563EB", action: "Start Break", status: "ACTIVE" },
          { id: "4", type: "HABIT_INSIGHT", title: "Caffeine Tapering Advised", description: "Analysis of your sleep latency over the past 7 days shows a correlation with late-afternoon coffee. Try swapping your 4:00 PM espresso for hydration to improve tomorrow's baseline energy.", iconName: "Zap", color: "var(--memphis-mint)", shadowColor: "#10B981", action: "Log Water", status: "ACTIVE" }
        ];
        
        const batch = writeBatch(db);
        defaultRecs.forEach(rec => {
          const docRef = doc(db, "users", user.uid, "recommendations", rec.id);
          batch.set(docRef, rec);
        });
        batch.commit();
      }
    });

    const unsub = onSnapshot(recsRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recommendation));
      setRecommendations(fetched);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  const dismissRecommendation = async (id: string) => {
    if (!user) return;
    // Optimistic
    setRecommendations(prev => prev.filter(r => r.id !== id));
    await deleteDoc(doc(db, "users", user.uid, "recommendations", id));
  };

  const executeRecommendation = async (id: string) => {
    if (!user) return;
    
    const rec = recommendations.find(r => r.id === id);
    if (!rec) return;

    // Cross-Route Telemetry Sync
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    await addDoc(collection(db, "users", user.uid, "sessions"), {
      date: dateStr,
      time: timeStr,
      duration: "AI Action",
      score: 95, // AI Insights are high value
      type: "AI Insight Execution",
      task: rec.title,
      status: "Completed",
      timestamp: now.getTime()
    });

    const analyticsRef = doc(db, "users", user.uid, "analytics", "overview");
    const docSnap = await getDoc(analyticsRef);
    if (docSnap.exists()) {
      let current = docSnap.data().cognitiveLoad || [0,0,0,0,0,0,0,0,0,0];
      if (JSON.stringify(current) === JSON.stringify([40, 60, 45, 80, 50, 70, 90, 85, 60, 40])) {
         current = [0,0,0,0,0,0,0,0,0,0];
      }
      const updated = [...current.slice(1), 85]; 
      await updateDoc(analyticsRef, { cognitiveLoad: updated });
    }

    const telRef = doc(db, "users", user.uid, "telemetry", "live");
    await setDoc(telRef, {
       logs: arrayUnion(`AI Protocol Executed: ${rec.title}`),
    }, { merge: true });

    await dismissRecommendation(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#FDFBF7] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--memphis-pink)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] text-black font-body relative">
      {/* ── MEMPHIS HEADER ── */}
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-teal)] relative overflow-hidden z-10 gap-4">
        {/* dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-[22px] md:text-[28px] font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            AI Insights &amp; Recommendations
          </h2>
          <p className="text-[11px] md:text-[13px] font-black uppercase tracking-widest text-black/60 mt-0.5 font-mono">
            Predictive Analytics Engine: Online
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <span className="px-4 py-2 bg-black text-white text-[12px] font-black uppercase tracking-widest border-2 border-black w-full md:w-auto text-center min-h-[44px] flex items-center justify-center">
            {recommendations.length} Active Insights
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-20 bg-[#FDFBF7]">

        {/* ── INTRO BOX ── */}
        <div
          className="mb-6 md:mb-8 bg-white border-4 border-black p-4 md:p-6"
          style={{ boxShadow: "6px 6px 0px #000" }}
        >
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-black border-2 border-black flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" />
            </div>
            <div>
              <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-wider mb-1 text-black">
                Pattern Analysis Complete
              </h3>
              <p className="text-[12px] md:text-[13px] font-mono text-black/70 leading-relaxed ai-streaming">
                VibeShift continuously monitors your task execution, calendar density, and focus blocks to provide proactive recommendations designed to maximize your daily output and prevent cognitive burnout.
              </p>
            </div>
          </div>
        </div>

        {/* ── RECOMMENDATIONS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {recommendations.map((rec) => {
            const Icon = iconMap[rec.iconName] || BrainCircuit;
            return (
            <div
              key={rec.id}
              className="bg-white border-4 border-black flex flex-col p-4 md:p-6 hover:-translate-y-1 hover:-translate-x-1 transition-transform group"
              style={{
                borderTopColor: rec.color,
                borderTopWidth: "8px",
                boxShadow: `6px 6px 0px ${rec.shadowColor}`,
              }}
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 border-2 border-black flex items-center justify-center shrink-0"
                    style={{ backgroundColor: rec.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span
                      className="text-[9px] font-mono font-black uppercase tracking-widest block"
                      style={{ color: rec.color }}
                    >
                      {rec.type}
                    </span>
                    <h4 className="text-[14px] md:text-[15px] font-black uppercase leading-tight text-black mt-1">
                      {rec.title}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => dismissRecommendation(rec.id)}
                  className="text-black/40 hover:text-black transition-colors border-2 border-transparent hover:border-black p-2 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  aria-label="Dismiss recommendation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[12px] md:text-[13px] font-mono text-black/70 leading-relaxed mb-6 flex-1">
                {rec.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={() => executeRecommendation(rec.id)}
                  className="flex-1 bg-black text-white font-black font-mono text-[11px] uppercase tracking-widest min-h-[44px] py-3 border-2 border-black hover:bg-[var(--memphis-pink)] hover:border-[var(--memphis-pink)] transition-colors flex items-center justify-center gap-2"
                >
                  {rec.action} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dismissRecommendation(rec.id)}
                  className="sm:px-6 bg-white text-black font-black font-mono text-[11px] uppercase tracking-widest min-h-[44px] py-3 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
            );
          })}
          {recommendations.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-16 md:py-20 border-4 border-dashed border-black bg-white">
              <Sparkles className="w-8 h-8 text-black/30 mx-auto mb-4" />
              <p className="text-[13px] md:text-[14px] font-black font-mono uppercase tracking-widest text-black/50 px-4">
                All insights resolved. Output optimal.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
