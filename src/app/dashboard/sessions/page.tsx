"use client";

import { Activity, BrainCircuit, Calendar, Clock, Filter, Search, Target, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

type Session = { id: string; date: string; time: string; duration: string; score: number; type: string; task: string; status: string; };

export default function SessionsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getDocs(collection(db, "users", user.uid, "sessions")).then(snapshot => {
        if (snapshot.empty) {
          const mockSessions = [
            { date: "Today", time: "2:00 PM - 3:30 PM", duration: "1h 30m", score: 88, type: "Deep Work", task: "Q2 Planning Deck", status: "Completed" },
            { date: "Today", time: "10:00 AM - 11:45 AM", duration: "1h 45m", score: 92, type: "Deep Work", task: "Market Analysis", status: "Completed" },
            { date: "Yesterday", time: "4:15 PM - 5:00 PM", duration: "45m", score: 75, type: "Admin", task: "Email Inbox Zero", status: "Completed" },
            { date: "Yesterday", time: "1:00 PM - 3:15 PM", duration: "2h 15m", score: 95, type: "Deep Work", task: "Financial Model Draft", status: "Completed" },
            { date: "May 18, 2025", time: "9:00 AM - 10:30 AM", duration: "1h 30m", score: 82, type: "Deep Work", task: "Weekly Sprint Review", status: "Completed" },
          ];
          const batch = writeBatch(db);
          const sessionsData: Session[] = [];
          mockSessions.forEach((s) => {
            const docRef = doc(collection(db, "users", user.uid, "sessions"));
            batch.set(docRef, s);
            sessionsData.push({ id: docRef.id, ...s });
          });
          batch.commit();
          setSessions(sessionsData);
        } else {
          const fetchedSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
          setSessions(fetchedSessions);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const filtered = sessions.filter(s => s.task.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));

  // Stats derivation
  const totalCompleted = sessions.filter(s => s.status === "Completed").length;
  const avgScore = totalCompleted > 0 ? Math.round(sessions.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted) : 0;

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight">Sessions History</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Review your past deep work cycles and agent analytics.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-none bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all w-64"
            />
          </div>
          <button className="btn-ghost">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="glass-card flex items-center gap-4 py-5">
            <div className="w-12 h-12 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--border-active)] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--text-secondary)] uppercase mb-1">Total Focus Time</p>
              <h3 className="text-[24px] font-display font-bold text-[var(--text-primary)]">32h 45m</h3>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 py-5">
            <div className="w-12 h-12 rounded-none bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--text-secondary)] uppercase mb-1">Avg Focus Score</p>
              <h3 className="text-[24px] font-display font-bold text-[var(--text-primary)]">{avgScore}<span className="text-[14px] text-[var(--color-warning)] ml-1 font-mono">/100</span></h3>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 py-5">
            <div className="w-12 h-12 rounded-none bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--text-secondary)] uppercase mb-1">Completed Sessions</p>
              <h3 className="text-[24px] font-display font-bold text-[var(--text-primary)]">{totalCompleted}</h3>
            </div>
          </div>
        </div>

        {/* SESSIONS LIST */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--glass-border)] text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)]">
            <div className="col-span-4">Task / Session</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2">Focus Score</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          
          <div className="divide-y divide-[var(--glass-border)]">
            {isLoading && <div className="text-center py-12 text-[var(--text-secondary)]"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent-primary)]" /> Loading sessions...</div>}
            {!isLoading && filtered.map((session) => (
              <div key={session.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer">
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 border ${session.type === 'Deep Work' ? 'bg-[var(--accent-primary-glow)] border-[var(--border-active)] text-[var(--accent-primary)]' : 'bg-[var(--accent-live-glow)] border-[rgba(6,182,212,0.4)] text-[var(--accent-live)]'}`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-live)] transition-colors font-body">{session.task}</p>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{session.type}</p>
                  </div>
                </div>
                
                <div className="col-span-3 flex flex-col justify-center">
                  <p className="text-[13px] text-[var(--text-primary)] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]"/> {session.date}</p>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {session.time}</p>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="px-2.5 py-1 rounded-none bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[12px] font-mono text-[var(--text-secondary)]">
                    {session.duration}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-full h-1.5 bg-[var(--glass-bg)] rounded-none overflow-hidden max-w-[60px]">
                    <div className="h-full bg-[var(--color-warning)] rounded-none" style={{ width: `${session.score}%` }}></div>
                  </div>
                  <span className="text-[12px] font-mono font-medium text-[var(--text-primary)]">{session.score}</span>
                </div>
                
                <div className="col-span-1 text-right flex justify-end">
                  <span className="badge badge--success">
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
            
            {!isLoading && filtered.length === 0 && (
              <div className="py-12 text-center text-[var(--text-secondary)] text-[13px]">
                No sessions found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
