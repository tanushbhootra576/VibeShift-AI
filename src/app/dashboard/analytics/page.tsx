"use client";

import { Activity, BrainCircuit, LineChart as LineChartIcon, Zap, Leaf, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cogLoad, setCogLoad] = useState<number[]>([40, 60, 45, 80, 50, 70, 90, 85, 60, 40]);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "analytics", "overview");
      getDoc(docRef).then(docSnap => {
        if (!docSnap.exists()) {
          const defaultData = { cognitiveLoad: [40, 60, 45, 80, 50, 70, 90, 85, 60, 40] };
          setDoc(docRef, defaultData);
          setCogLoad(defaultData.cognitiveLoad);
        } else {
          setCogLoad(docSnap.data().cognitiveLoad || [40, 60, 45, 80, 50, 70, 90, 85, 60, 40]);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight">Advanced Analytics</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Deep dive into your biometric and focus trends.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1 glass-card">
            <h3 className="card-eyebrow mb-6"><BrainCircuit className="w-4 h-4 text-[var(--accent-primary)]"/> Cognitive Load Over Time</h3>
            <div className="h-48 w-full flex items-end gap-2">
              {cogLoad.map((h, i) => (
                <div key={i} className="flex-1 bg-[var(--accent-primary-glow)] rounded-none-t-[var(--radius-sm)] hover:bg-[var(--accent-primary)] transition-colors relative group">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--glass-border)] px-2 py-1 rounded-none text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-primary)]">{h}%</div>
                  <div className="w-full bg-[var(--accent-primary)] rounded-none-t-[var(--radius-sm)]" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[12px] text-[var(--text-secondary)] font-mono">
              <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 glass-card">
            <h3 className="card-eyebrow mb-6"><Activity className="w-4 h-4 text-[var(--color-danger)]"/> Heart Rate Variability (HRV)</h3>
            <div className="h-48 w-full flex items-center">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <polyline fill="none" stroke="var(--color-danger)" strokeWidth="2" points="0,40 10,35 20,45 30,20 40,30 50,10 60,25 70,15 80,30 90,10 100,20" />
                <polygon fill="url(#redGrad)" points="0,50 0,40 10,35 20,45 30,20 40,30 50,10 60,25 70,15 80,30 90,10 100,20 100,50" className="opacity-20" />
                <defs>
                  <linearGradient id="redGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-danger)" />
                    <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div className="col-span-2 glass-card">
            <h3 className="card-eyebrow mb-4">AI Recovery Recommendations</h3>
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 rounded-none bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                 <Leaf className="w-6 h-6 text-[var(--color-success)] mb-2" />
                 <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">More Nature Exposure</h4>
                 <p className="text-[12px] text-[var(--text-secondary)]">Your stress levels drop by 22% on days you log an outdoor walk.</p>
               </div>
               <div className="p-4 rounded-none bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.1)]">
                 <Zap className="w-6 h-6 text-[var(--accent-live)] mb-2" />
                 <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Optimal Focus Window</h4>
                 <p className="text-[12px] text-[var(--text-secondary)]">You are 40% more productive between 9:00 AM and 11:30 AM.</p>
               </div>
               <div className="p-4 rounded-none bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)]">
                 <LineChartIcon className="w-6 h-6 text-[var(--color-warning)] mb-2" />
                 <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Caffeine Tapering</h4>
                 <p className="text-[12px] text-[var(--text-secondary)]">HRV drops when caffeine is consumed after 2 PM. Try tapering.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
