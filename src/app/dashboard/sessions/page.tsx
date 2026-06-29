"use client";

import { Activity, BrainCircuit, Calendar, Clock, Filter, Search, Target, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Session = { id: string; date: string; time: string; duration: string; score: number; type: string; task: string; status: string; };

export default function SessionsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = collection(db, "users", user.uid, "sessions");
      const unsub = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setSessions([]);
        } else {
          const fetchedSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
          const mockTasks = ["Q2 Planning Deck", "Market Analysis", "Email Inbox Zero", "Financial Model Draft", "Weekly Sprint Review"];
          const realSessions = fetchedSessions.filter(s => !mockTasks.includes(s.task)).sort((a, b) => {
            // Sort by timestamp if available, else fallback
            const timeA = (a as any).timestamp || 0;
            const timeB = (b as any).timestamp || 0;
            return timeB - timeA;
          });
          setSessions(realSessions);
        }
        setIsLoading(false);
      });
      return () => unsub();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const filtered = sessions.filter(s => s.task.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));

  // Stats derivation
  const totalCompleted = sessions.filter(s => s.status === "Completed").length;
  const avgScore = totalCompleted > 0 ? Math.round(sessions.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted) : 0;

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] text-black">
      {/* ── MEMPHIS HEADER ── */}
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-blue)] relative overflow-hidden gap-4">
        {/* zigzag pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 12px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-[22px] md:text-[28px] font-black uppercase tracking-tight text-white">Sessions History</h2>
          <p className="text-[11px] md:text-[13px] font-bold uppercase tracking-widest text-white/70 mt-0.5">
            Review your past deep work cycles and agent analytics.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 min-h-[44px] bg-white border-2 border-black text-[13px] text-black focus:outline-none w-full sm:w-64 font-mono placeholder:text-black/40"
            />
          </div>
          <button className="memphis-btn bg-white text-black border-2 border-black font-black uppercase tracking-widest flex items-center justify-center gap-2 px-4 py-2 min-h-[44px]">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#FDFBF7]">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">

          {/* Stat 1 – Total Focus Time */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 flex items-center gap-4"
            style={{ boxShadow: "6px 6px 0px var(--memphis-pink)" }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--memphis-pink)] border-2 border-black flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-black/60 uppercase mb-1">Total Focus Time</p>
              <h3 className="text-[20px] md:text-[24px] font-black text-black">32h 45m</h3>
            </div>
          </div>

          {/* Stat 2 – Avg Focus Score */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 flex items-center gap-4"
            style={{ boxShadow: "6px 6px 0px var(--memphis-yellow)" }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--memphis-yellow)] border-2 border-black flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-black/60 uppercase mb-1">Avg Focus Score</p>
              <h3 className="text-[20px] md:text-[24px] font-black text-black">
                {avgScore}<span className="text-[12px] md:text-[14px] text-[var(--memphis-yellow)] ml-1 font-mono">/100</span>
              </h3>
            </div>
          </div>

          {/* Stat 3 – Completed Sessions */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 flex items-center gap-4"
            style={{ boxShadow: "6px 6px 0px var(--memphis-mint)" }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--memphis-mint)] border-2 border-black flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-black/60 uppercase mb-1">Completed Sessions</p>
              <h3 className="text-[20px] md:text-[24px] font-black text-black">{totalCompleted}</h3>
            </div>
          </div>

        </div>

        {/* SESSIONS TABLE */}
        <div
          className="bg-white border-4 border-black overflow-x-auto"
          style={{ boxShadow: "6px 6px 0px #000" }}
        >
          <div className="min-w-[800px]">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em]">
              <div className="col-span-4">Task / Session</div>
              <div className="col-span-3">Date &amp; Time</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Focus Score</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <div className="divide-y-2 divide-black">
              {isLoading && (
                <div className="text-center py-12 text-black/60">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--memphis-pink)]" />
                  <p className="text-[13px] font-black uppercase tracking-widest">Loading sessions...</p>
                </div>
              )}

              {!isLoading && filtered.map((session) => (
                <div
                  key={session.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 md:py-5 items-center hover:bg-[var(--memphis-yellow)]/10 transition-colors group cursor-pointer min-h-[60px]"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${session.type === "Deep Work" ? "bg-[var(--memphis-pink)]" : "bg-[var(--memphis-teal)]"}`}
                    >
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] md:text-[14px] font-black text-black group-hover:text-[var(--memphis-pink)] transition-colors uppercase line-clamp-1">
                        {session.task}
                      </p>
                      <p className="text-[11px] md:text-[12px] text-black/60 font-mono mt-0.5">{session.type}</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-col justify-center">
                    <p className="text-[12px] md:text-[13px] text-black font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-black/40 shrink-0" /> {session.date}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-black/60 font-mono mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" /> {session.time}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="px-2 py-1 md:px-2.5 md:py-1 bg-black text-white text-[11px] md:text-[12px] font-mono font-bold border-2 border-black min-h-[28px] flex items-center">
                      {session.duration}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-full h-2 bg-black/10 border border-black overflow-hidden max-w-[60px]">
                      <div className="h-full bg-[var(--memphis-yellow)]" style={{ width: `${session.score}%` }} />
                    </div>
                    <span className="text-[11px] md:text-[12px] font-mono font-black text-black">{session.score}</span>
                  </div>

                  <div className="col-span-1 text-right flex justify-end">
                    <span className="px-2 py-1 bg-[var(--memphis-mint)] text-black text-[9px] md:text-[10px] font-black uppercase tracking-wider border-2 border-black text-center">
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}

              {!isLoading && filtered.length === 0 && (
                <div className="py-12 text-center text-black/50 text-[12px] md:text-[13px] font-black uppercase tracking-widest px-4">
                  No sessions found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
