"use client";

import { Activity, BrainCircuit, Sparkles, Network, Target, ListTodo, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, arrayUnion } from "firebase/firestore";

export default function TelemetryPage() {
  const { user } = useAuth();
  const [productivityData, setProductivityData] = useState<number[]>(Array(60).fill(70));
  const [stream, setStream] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "telemetry", "live");
    
    // Subscribe to telemetry document
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        // Initialize if doesn't exist
        setDoc(docRef, {
          productivityScore: Array(60).fill(70),
          logs: ["Initializing AI Engine...", "Syncing with Google Calendar."]
        });
      } else {
        const data = docSnap.data();
        if (data.productivityScore) setProductivityData(data.productivityScore);
        if (data.logs) setStream(data.logs.slice(0, 8)); // keep last 8 logs
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Simulate external background process feeding data (since we don't have a real background python worker running yet)
  // We write to Firestore, which then triggers the onSnapshot to keep it "dynamic" through the DB
  useEffect(() => {
    if (!user) return;
    
    const tasks = [
      "Prioritizing 'Core Engine' based on upcoming deadline.",
      "Analyzing available calendar blocks for Deep Work.",
      "Rescheduling 3:00 PM sync to protect focus state.",
      "Generating sub-tasks for 'Stakeholder Demo'.",
      "Calculating optimal break time based on fatigue.",
      "Suggesting 'Visual Defocus' protocol."
    ];

    const simInterval = setInterval(() => {
      const docRef = doc(db, "users", user.uid, "telemetry", "live");
      const nextScore = 60 + Math.random() * 40;
      
      const newScoreArr = [...productivityData.slice(1), nextScore];
      const newLog = tasks[Math.floor(Math.random() * tasks.length)];
      
      setDoc(docRef, {
        productivityScore: newScoreArr,
        logs: [newLog, ...stream].slice(0, 8)
      }, { merge: true });
    }, 4000);

    return () => clearInterval(simInterval);
  }, [user, productivityData, stream]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-base)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-black font-body">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-yellow)] z-10 relative overflow-hidden gap-4">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-[22px] md:text-[28px] font-display font-black text-black tracking-tight flex items-center gap-2 md:gap-3 uppercase">
             <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-black" /> Autonomous Engine Status
          </h2>
          <p className="text-[11px] md:text-[13px] font-mono font-bold text-black/70 mt-1 uppercase tracking-widest">Live monitoring of AI-powered scheduling and task optimization.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4 relative z-10 w-full md:w-auto">
           <div className="flex-1 sm:flex-none px-4 py-2 border-4 border-black bg-[var(--memphis-mint)] text-[11px] md:text-[12px] font-black uppercase tracking-widest text-black flex justify-center items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[44px]">
             <span className="w-3 h-3 rounded-full bg-white border-2 border-black animate-pulse"></span> Engine Active
           </div>
           <div className="flex-1 sm:flex-none px-4 py-2 border-4 border-black bg-white text-[11px] md:text-[12px] font-black uppercase tracking-widest text-black flex justify-center items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[44px]">
             23 Tasks Managed
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
          
          {/* Main Visualizer: Productivity Output */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
             {/* Productivity Graph */}
             <div className="bg-white p-4 md:p-8 border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden h-[250px] md:h-[340px] flex flex-col">
                <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                  <h3 className="text-[12px] md:text-[14px] font-black uppercase tracking-widest bg-black text-white px-3 md:px-4 py-2 rounded-full border-2 border-transparent flex items-center gap-2 m-0 w-max">
                    <Activity className="w-4 h-4 text-[var(--memphis-mint)]" /> Live Productivity Optimization
                  </h3>
                  <div className="text-[32px] md:text-[48px] font-display font-black text-black tracking-tighter leading-none bg-[var(--memphis-yellow)] px-3 py-1 md:px-4 md:py-2 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:rotate-2 w-max">
                    {Math.round(productivityData[productivityData.length - 1] || 70)} <span className="text-[12px] md:text-[14px] font-mono font-black text-black uppercase">Score</span>
                  </div>
                </div>

                <div className="flex-1 w-full flex items-end gap-[2px] md:gap-[4px] relative z-10 h-full border-b-4 border-black pb-2">
                  {productivityData.map((hr, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 border-2 border-black rounded-t-sm transition-all duration-100 min-h-[4px] ${
                        hr > 85 ? 'bg-[var(--memphis-mint)]' : hr > 70 ? 'bg-[var(--memphis-teal)]' : 'bg-[var(--memphis-pink)]'
                      }`}
                      style={{ height: `${Math.max(hr, 5)}%` }}
                    />
                  ))}
                </div>
                
                <div className="mt-3 md:mt-4 relative z-10 flex justify-between text-black font-mono text-[10px] md:text-[12px] uppercase tracking-widest font-black gap-2">
                  <span className="bg-white border-2 border-black px-2 py-1 rounded hidden sm:inline-block">Past Hour</span>
                  <div className="flex items-center justify-center gap-2 text-black bg-[var(--memphis-pink)] px-2 py-1 md:px-3 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto text-center truncate">
                     <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white shrink-0" /> <span className="truncate">AI Engine Resolving Conflicts</span>
                  </div>
                  <span className="bg-white border-2 border-black px-2 py-1 rounded hidden sm:inline-block">Now</span>
                </div>
             </div>

             {/* Intelligent Task Prioritization Matrix */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 flex-1">
                {/* Metric 1 */}
                <div className="bg-white border-4 border-black p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Target className="w-8 h-8 md:w-10 md:h-10 text-white bg-[var(--memphis-mint)] rounded-full p-1.5 md:p-2 border-2 border-black mb-2 md:mb-3" />
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-500">Goals Tracked</h4>
                  <span className="text-[28px] md:text-[36px] font-display font-black mt-1 text-black tracking-tighter">14</span>
                </div>
                {/* Metric 2 */}
                <div className="bg-white border-4 border-black p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white bg-[var(--memphis-blue)] rounded-full p-1.5 md:p-2 border-2 border-black mb-2 md:mb-3" />
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-500">Calendar Syncs</h4>
                  <span className="text-[28px] md:text-[36px] font-display font-black mt-1 text-black tracking-tighter">32</span>
                </div>
                {/* Metric 3 */}
                <div className="bg-white border-4 border-black p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <ListTodo className="w-8 h-8 md:w-10 md:h-10 text-black bg-[var(--memphis-yellow)] rounded-full p-1.5 md:p-2 border-2 border-black mb-2 md:mb-3" />
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-500">Tasks Prioritized</h4>
                  <span className="text-[28px] md:text-[36px] font-display font-black mt-1 text-black tracking-tighter">128</span>
                </div>
                {/* Metric 4 */}
                <div className="bg-white border-4 border-black p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white bg-[var(--memphis-pink)] rounded-full p-1.5 md:p-2 border-2 border-black mb-2 md:mb-3" />
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-500">Hours Saved</h4>
                  <span className="text-[28px] md:text-[36px] font-display font-black mt-1 text-black tracking-tighter">4.5</span>
                </div>
             </div>
          </div>

          {/* Right Column: AI Scheduling Assistance */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
             
             {/* AI Agent Execution Log */}
             <div className="bg-white border-4 border-black rounded-3xl p-4 md:p-6 flex flex-col overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px]">
                <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-tight text-black mb-4 md:mb-6 flex items-center gap-3 border-b-4 border-black pb-3 md:pb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--memphis-pink)] rounded-xl border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin-slow" />
                  </div>
                  Agent Execution Log
                </h3>

                <div className="flex-1 overflow-hidden flex flex-col justify-start relative">
                  {/* Fading gradient for text overflow */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                  
                  {stream.map((text, i) => (
                    <div 
                      key={`${i}-${text}`}
                      className="mb-3 md:mb-4 text-[12px] md:text-[13px] font-mono font-bold text-black p-3 md:p-4 border-4 border-black bg-gray-50 rounded-xl shadow-sm"
                    >
                       <span className="text-[var(--memphis-pink)] font-black uppercase tracking-widest mr-2 bg-black text-white px-2 py-1 rounded inline-block mb-1">VibeShift</span>
                       <br className="hidden md:block" />
                       {text}
                    </div>
                  ))}
                </div>
             </div>

             {/* Personal Recommendation */}
             <div className="bg-[var(--memphis-pink)] border-4 border-black rounded-3xl p-4 md:p-6 flex flex-col relative overflow-hidden group hover:bg-[var(--memphis-teal)] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 pattern-squiggles opacity-20 pointer-events-none text-white"></div>
                <h4 className="text-[10px] md:text-[12px] font-black text-black uppercase tracking-widest mb-3 md:mb-4 bg-white border-2 border-black inline-block px-2 py-1 md:px-3 md:py-1 rounded-full w-max relative z-10 shadow-sm">Active Recommendation</h4>
                
                <p className="text-[16px] md:text-[18px] font-display font-black text-black leading-tight mb-5 md:mb-6 relative z-10">You have a continuous 3-hour block available tomorrow morning. Should I reserve this for "Core Engine UI Polish"?</p>

                <div className="mt-auto flex flex-col sm:flex-row gap-3 md:gap-4 relative z-10">
                   <button className="flex-1 py-3 bg-white text-black border-4 border-black rounded-xl font-black uppercase tracking-wider text-[11px] md:text-[12px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[44px]">Schedule It</button>
                   <button className="flex-1 py-3 bg-black border-4 border-black text-white rounded-xl font-black uppercase tracking-wider text-[11px] md:text-[12px] hover:bg-gray-800 transition-colors min-h-[44px]">Dismiss</button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
