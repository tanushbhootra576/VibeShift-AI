"use client";

import { Library, Play, Dumbbell, Coffee, BookOpen, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

const iconMap: any = { Coffee, Dumbbell, BookOpen };

type BreakAct = { id: string; title: string; category: string; duration: string; iconName: string; color: string; bg: string; };

export default function LibraryPage() {
  const { user } = useAuth();
  const [breaks, setBreaks] = useState<BreakAct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBreak, setActiveBreak] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getDocs(collection(db, "users", user.uid, "library")).then(snapshot => {
        if (snapshot.empty) {
          const mockBreaks = [
            { title: "Box Breathing", category: "Mental Reset", duration: "5 min", iconName: "Coffee", color: "text-[var(--color-warning)]", bg: "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]" },
            { title: "Desk Stretches", category: "Physical Reset", duration: "10 min", iconName: "Dumbbell", color: "text-[var(--color-success)]", bg: "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]" },
            { title: "Non-Sleep Deep Rest", category: "Deep Recovery", duration: "20 min", iconName: "BookOpen", color: "text-[var(--accent-primary)]", bg: "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.2)]" },
          ];
          const batch = writeBatch(db);
          const breaksData: BreakAct[] = [];
          mockBreaks.forEach((b) => {
            const docRef = doc(collection(db, "users", user.uid, "library"));
            batch.set(docRef, b);
            breaksData.push({ id: docRef.id, ...b });
          });
          batch.commit();
          setBreaks(breaksData);
        } else {
          setBreaks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BreakAct)));
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const startActivity = (id: string) => {
    setActiveBreak(id);
    setTimeout(() => setActiveBreak(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight">Break Library</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Explore scientifically backed breaks and reset activities.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {isLoading && <div className="text-center py-12 text-[var(--text-secondary)]"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent-primary)]" /> Loading library...</div>}
        
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {breaks.map((b) => {
              const IconComp = iconMap[b.iconName] || Play;
              return (
                <div key={b.id} onClick={() => startActivity(b.id)} className={`glass-card cursor-pointer flex flex-col h-48 relative overflow-hidden group ${activeBreak === b.id ? 'border-[var(--color-success)] bg-[rgba(16,185,129,0.05)]' : 'hover:border-[var(--border-active)]'}`}>
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-none  opacity-20 group-hover:opacity-40 transition-opacity ${b.bg.split(' ')[0]}`}></div>
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center border mb-4 ${b.bg} ${b.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight">{b.title}</h3>
                  <p className="text-[12px] font-body text-[var(--text-secondary)] mt-1 font-medium tracking-wide uppercase">{b.category} • {b.duration}</p>
                  
                  <div className="mt-auto">
                    <button className={`flex items-center gap-2 text-[13px] font-medium transition-all transform ${activeBreak === b.id ? 'text-[var(--color-success)] translate-y-0 opacity-100' : 'text-[var(--text-primary)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}>
                      {activeBreak === b.id ? <><Check className="w-3.5 h-3.5" /> Activity Started</> : <><Play className="w-3.5 h-3.5" /> Start Activity</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
