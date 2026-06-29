"use client";

import { Activity, BrainCircuit, LineChart as LineChartIcon, Zap, Leaf, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cogLoad, setCogLoad] = useState<number[]>([40, 60, 45, 80, 50, 70, 90, 85, 60, 40]);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "analytics", "overview");
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists()) {
          const defaultData = { cognitiveLoad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
          setDoc(docRef, defaultData);
          setCogLoad(defaultData.cognitiveLoad);
        } else {
          let loaded = docSnap.data().cognitiveLoad || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          // Filter out the previously seeded static data
          if (JSON.stringify(loaded) === JSON.stringify([40, 60, 45, 80, 50, 70, 90, 85, 60, 40])) {
            loaded = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          }
          setCogLoad(loaded);
        }
        setIsLoading(false);
      });
      return () => unsub();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#FDFBF7] text-black items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--memphis-pink)] animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-sm">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] text-black">
      {/* ── MEMPHIS HEADER ── */}
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-pink)] relative overflow-hidden gap-4">
        {/* dot-pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.12,
          }}
        />
        <div className="relative z-10">
          <h2 className="text-[22px] md:text-[28px] font-black uppercase tracking-tight text-black">
            Advanced Analytics
          </h2>
          <p className="text-[11px] md:text-[13px] font-bold uppercase tracking-widest text-black/70 mt-0.5">
            Deep dive into your biometric &amp; focus trends.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#FDFBF7]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── COGNITIVE LOAD CHART ── */}
          <div
            className="col-span-1 lg:col-span-1 bg-white border-4 border-black p-4 md:p-6"
            style={{ boxShadow: "6px 6px 0px #FF2D78" }}
          >
            <h3 className="flex items-center gap-2 text-[11px] md:text-[11px] font-black uppercase tracking-[0.15em] text-black mb-6 border-b-2 border-black pb-3">
              <BrainCircuit className="w-4 h-4 text-[var(--memphis-pink)]" />
              Cognitive Load Over Time
            </h3>
            <div className="h-48 w-full flex items-end gap-1 md:gap-2">
              {cogLoad.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border-2 border-black px-2 py-1 text-[10px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {h}%
                  </div>
                  <div
                    className="w-full bg-[var(--memphis-pink)] border-2 border-black hover:bg-[var(--memphis-yellow)] transition-colors min-h-[44px]"
                    style={{ height: `${Math.max(h, 20)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] md:text-[12px] text-black font-mono font-bold">
              <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
          </div>

          {/* ── HRV CHART ── */}
          <div
            className="col-span-1 lg:col-span-1 bg-white border-4 border-black p-4 md:p-6"
            style={{ boxShadow: "6px 6px 0px #F5A623" }}
          >
            <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-black mb-6 border-b-2 border-black pb-3">
              <Activity className="w-4 h-4 text-[var(--memphis-red)]" />
              Heart Rate Variability (HRV)
            </h3>
            <div className="h-48 w-full flex items-center overflow-hidden">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible preserve-3d">
                <polyline fill="none" stroke="var(--memphis-red)" strokeWidth="2" points="0,40 10,35 20,45 30,20 40,30 50,10 60,25 70,15 80,30 90,10 100,20" />
                <polygon fill="url(#redGrad)" points="0,50 0,40 10,35 20,45 30,20 40,30 50,10 60,25 70,15 80,30 90,10 100,20 100,50" className="opacity-20" />
                <defs>
                  <linearGradient id="redGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--memphis-red)" />
                    <stop offset="100%" stopColor="var(--memphis-red)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* ── AI RECOVERY RECOMMENDATIONS ── */}
          <div
            className="col-span-1 lg:col-span-2 bg-white border-4 border-black p-4 md:p-6"
            style={{ boxShadow: "6px 6px 0px #10B981" }}
          >
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-black mb-6 border-b-2 border-black pb-3">
              AI Recovery Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Nature */}
              <div
                className="p-4 bg-white border-4 border-black border-l-4"
                style={{ borderLeftColor: "var(--memphis-mint)", boxShadow: "4px 4px 0px var(--memphis-mint)" }}
              >
                <Leaf className="w-6 h-6 text-[var(--memphis-mint)] mb-3" />
                <h4 className="text-[13px] font-black uppercase text-black mb-1">More Nature Exposure</h4>
                <p className="text-[12px] text-black/70 font-mono">Your stress levels drop by 22% on days you log an outdoor walk.</p>
              </div>

              {/* Focus */}
              <div
                className="p-4 bg-white border-4 border-black"
                style={{ borderLeftColor: "var(--memphis-teal)", boxShadow: "4px 4px 0px var(--memphis-teal)" }}
              >
                <Zap className="w-6 h-6 text-[var(--memphis-teal)] mb-3" />
                <h4 className="text-[13px] font-black uppercase text-black mb-1">Optimal Focus Window</h4>
                <p className="text-[12px] text-black/70 font-mono">You are 40% more productive between 9:00 AM and 11:30 AM.</p>
              </div>

              {/* Caffeine */}
              <div
                className="p-4 bg-white border-4 border-black"
                style={{ borderLeftColor: "var(--memphis-yellow)", boxShadow: "4px 4px 0px var(--memphis-yellow)" }}
              >
                <LineChartIcon className="w-6 h-6 text-[var(--memphis-yellow)] mb-3" />
                <h4 className="text-[13px] font-black uppercase text-black mb-1">Caffeine Tapering</h4>
                <p className="text-[12px] text-black/70 font-mono">HRV drops when caffeine is consumed after 2 PM. Try tapering.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
