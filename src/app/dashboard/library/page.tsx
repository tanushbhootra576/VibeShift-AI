"use client";

import { Library, Play, Activity, Flame, Dumbbell, X, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, getDocs, writeBatch, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';

type Protocol = {
  id: string;
  name: string;
  type: string;
  durationSeconds: number;
  description: string;
  iconName: string;
  color: string;
};

const iconMap: Record<string, any> = {
  Activity: Activity,
  Dumbbell: Dumbbell,
  Flame: Flame,
  Sparkles: Sparkles,
  BrainCircuit: BrainCircuit
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const protocolsRef = collection(db, "users", user.uid, "protocols");
    
    getDocs(protocolsRef).then(snapshot => {
      if (snapshot.empty) {
        const defaultProtocols: Protocol[] = [
          { id: "1", name: "NSDR Protocol", type: "Focus", durationSeconds: 300, description: "Non-Sleep Deep Rest. Scientifically proven to restore dopamine baseline faster than sleep.", iconName: "Activity", color: "var(--memphis-pink)" },
          { id: "2", name: "Kinetic Reset", type: "Physical", durationSeconds: 120, description: "High-intensity micro-workout. 30s jumping jacks, 30s squats, 60s stretching.", iconName: "Dumbbell", color: "var(--memphis-red)" },
          { id: "3", name: "Visual Defocus", type: "Recovery", durationSeconds: 900, description: "Walk outside without devices. Promotes optic flow and down-regulates the amygdala.", iconName: "Flame", color: "var(--memphis-blue)" },
        ];
        const batch = writeBatch(db);
        defaultProtocols.forEach(p => {
          const docRef = doc(db, "users", user.uid, "protocols", p.id);
          batch.set(docRef, p);
        });
        batch.commit();
      }
    });

    const unsub = onSnapshot(protocolsRef, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Protocol));
      setProtocols(fetched);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeProtocol && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeProtocol) {
      setActiveProtocol(null);
    }
    return () => clearInterval(interval);
  }, [activeProtocol, timeLeft]);

  const startProtocol = (name: string, seconds: number) => {
    setActiveProtocol(name);
    setTimeLeft(seconds);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-base)] items-center justify-center">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin text-[var(--memphis-pink)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-black relative font-body overflow-hidden">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-teal)] relative overflow-hidden gap-2 md:gap-0">
        <div className="absolute inset-0 pattern-stripes opacity-20 pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          <h2 className="text-[24px] md:text-[28px] font-display font-black text-black tracking-tight flex items-center gap-2 md:gap-3 uppercase">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-white border-4 border-black rounded-lg md:rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
               <Library className="w-5 h-5 md:w-6 md:h-6 text-black" />
             </div>
             Break Library
          </h2>
          <p className="text-[11px] md:text-[13px] font-mono font-bold text-black mt-2 uppercase tracking-widest bg-white border-2 border-black inline-block px-2 md:px-3 py-1 rounded">Cognitive Reset Protocols & Focus Optimization.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          
          {protocols.map((protocol) => {
            const Icon = iconMap[protocol.iconName] || Activity;
            const displayTime = formatTime(protocol.durationSeconds);
            
            return (
              <div key={protocol.id} className="bg-white border-4 border-black rounded-2xl md:rounded-3xl flex flex-col group overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style={{ boxShadow: `4px 4px 0px 0px ${protocol.color}` }}>
                <div className="h-32 md:h-40 border-b-4 border-black relative flex items-center justify-center overflow-hidden" style={{ backgroundColor: protocol.color }}>
                   <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none text-white"></div>
                   <Icon className="w-16 h-16 md:w-24 md:h-24 text-white opacity-40 absolute" />
                   <div className="text-[32px] md:text-[48px] font-display font-black text-white z-10 tracking-tighter drop-shadow-md bg-black px-3 md:px-4 py-1 md:py-2 border-2 md:border-4 border-white rounded-xl md:rounded-2xl transform -rotate-2">{displayTime}</div>
                </div>
                <div className="p-4 md:p-8 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                     <h3 className="text-[18px] md:text-[24px] font-black text-black font-display uppercase tracking-tight">{protocol.name}</h3>
                     <span className="bg-black text-white px-2 py-1 md:px-3 md:py-1 rounded-full uppercase tracking-widest text-[9px] md:text-[10px] font-black border-2 border-black shrink-0">{protocol.type}</span>
                   </div>
                   <p className="text-[13px] md:text-[14px] font-mono font-bold text-gray-700 flex-1 leading-relaxed">{protocol.description}</p>
                   <button onClick={() => startProtocol(protocol.name, protocol.durationSeconds)} className="memphis-btn mt-6 md:mt-8 w-full py-4 flex items-center justify-center gap-2 md:gap-3 text-[13px] md:text-[14px]" style={{ backgroundColor: protocol.color, color: 'white', textShadow: '1px 1px 0 #000' }}>
                     <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Initialize Protocol
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE PROTOCOL OVERLAY */}
      <AnimatePresence mode="wait">
        {activeProtocol && (
          <div className="fixed inset-0 z-50 bg-[var(--memphis-mint)] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none text-black"></div>
            
            <button onClick={() => setActiveProtocol(null)} className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-white border-4 border-black rounded-full flex items-center justify-center text-black hover:bg-[var(--memphis-red)] hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
               <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            
            <div className="bg-white border-4 md:border-8 border-black rounded-2xl md:rounded-3xl p-6 md:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full mx-4 relative z-10 flex flex-col items-center">
              <h2 className="text-[32px] md:text-[56px] font-display font-black text-black tracking-tight uppercase mb-3 md:mb-4 leading-none">{activeProtocol}</h2>
              <p className="text-[10px] md:text-[16px] text-white bg-black border-2 md:border-4 border-black font-mono font-black mb-8 md:mb-12 uppercase tracking-widest inline-block px-3 py-1 md:px-6 md:py-2 shadow-sm transform -rotate-1 whitespace-nowrap">Protocol Engaged. Do not disrupt.</p>

              {/* Breathing / Focus Animation */}
              <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 md:mb-12">
                 <div className="absolute inset-0 rounded-full border-4 md:border-8 border-[var(--memphis-pink)] animate-ping opacity-50" />
                 <div className="absolute inset-4 rounded-full border-4 md:border-8 border-[var(--memphis-yellow)] animate-pulse" />
                 <div className="absolute inset-8 rounded-full bg-white border-4 md:border-8 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10">
                    <span className="text-black font-display font-black text-[40px] md:text-[56px] tracking-tighter leading-none mt-1 md:mt-2">{formatTime(timeLeft)}</span>
                 </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-black font-black tracking-widest uppercase text-[14px] md:text-[18px]">
                <span className="bg-[var(--memphis-teal)] px-3 md:px-4 py-2 border-2 md:border-4 border-black rounded-lg md:rounded-xl">Inhale</span>
                <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
                <span className="bg-[var(--memphis-yellow)] px-3 md:px-4 py-2 border-2 md:border-4 border-black rounded-lg md:rounded-xl">Exhale</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
