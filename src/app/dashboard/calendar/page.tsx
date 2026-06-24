"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video, Plus, CheckCircle2, LayoutGrid, List, CalendarDays, ServerCrash, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_EVENTS = [
  { id: 1, title: "Daily Standup", time: "10:00 AM", hour: 10, duration: 30, type: "meeting" },
  { id: 2, title: "Deep Work: Core Engine", time: "11:00 AM", hour: 11, duration: 120, type: "focus" },
  { id: 3, title: "Lunch & Kinetic Reset", time: "1:00 PM", hour: 13, duration: 60, type: "break" },
  { id: 4, title: "Stakeholder Demo", time: "3:00 PM", hour: 15, duration: 45, type: "meeting" },
  { id: 5, title: "UI Polish", time: "4:00 PM", hour: 16, duration: 90, type: "focus" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 24)); // Starts at June 24, 2026
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if we just returned from OAuth success
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("sync") === "success" || urlParams.get("sync") === "mock_success") {
        setIsGoogleConnected(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const connectGoogleCalendar = () => {
    setIsSyncing(true);
    // Redirect to the backend OAuth route
    window.location.href = "/api/calendar/connect";
  };

  const changeDate = (offset: number) => {
    if (view === "month") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    } else if (view === "week") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (offset * 7)));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + offset));
    }
  };

  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 5, 24)); // Mock "today" for demo is June 24, 2026
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Calendar Math for Month
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

  // Math for Week
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getDayStatus = (dayNum: number, month: number) => {
    if (month !== 5) return "free"; // Only mock data for June
    if (dayNum === 24) return "today";
    if (dayNum === 25 || dayNum === 28) return "busy";
    if (dayNum === 26) return "focus";
    return "free";
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent relative z-10 flex-wrap gap-4">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <CalendarIcon className="w-6 h-6 text-[var(--accent-primary)]" /> Time Canvas
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">AI-Optimized Schedule & Calendar Sync.</p>
        </div>
        
        <div className="flex items-center gap-6">
           {isGoogleConnected ? (
             <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-[var(--color-success)] bg-[rgba(0,200,83,0.1)]">
               <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-success)]">G-Cal Synced</span>
             </div>
           ) : (
             <button onClick={connectGoogleCalendar} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white font-bold uppercase tracking-wider text-[11px] transition-colors shadow-[2px_2px_0px_0px_#000] disabled:opacity-50">
               {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ServerCrash className="w-4 h-4" />}
               {isSyncing ? "Connecting..." : "Connect G-Cal"}
             </button>
           )}

           <button onClick={jumpToToday} className="px-4 py-2 border-2 border-black bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)] hover:text-black hover:border-[var(--accent-primary)] font-bold uppercase tracking-wider text-[11px] transition-colors shadow-[2px_2px_0px_0px_#000]">
             Today
           </button>

           {/* View Options */}
           <div className="flex bg-[var(--bg-surface)] border border-[var(--glass-border)] p-1">
             <button onClick={() => setView("month")} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${view === "month" ? "bg-[var(--accent-primary)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> Month</button>
             <button onClick={() => setView("week")} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${view === "week" ? "bg-[var(--accent-primary)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><CalendarDays className="w-3.5 h-3.5 inline mr-1" /> Week</button>
             <button onClick={() => setView("day")} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${view === "day" ? "bg-[var(--accent-primary)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><List className="w-3.5 h-3.5 inline mr-1" /> Day</button>
           </div>

           {/* Navigation */}
           <div className="flex items-center gap-4">
              <button onClick={() => changeDate(-1)} className="p-2 border border-[var(--glass-border)] hover:bg-[var(--accent-primary-glow)] hover:text-[var(--accent-primary)] transition-colors rounded-none"><ChevronLeft className="w-5 h-5" /></button>
              <span className="font-display font-bold text-[18px] uppercase tracking-widest text-[var(--text-primary)] w-[240px] text-center">
                {view === "day" ? currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 
                 view === "week" ? `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                 `${currentMonthName} ${currentYear}`}
              </span>
              <button onClick={() => changeDate(1)} className="p-2 border border-[var(--glass-border)] hover:bg-[var(--accent-primary-glow)] hover:text-[var(--accent-primary)] transition-colors rounded-none"><ChevronRight className="w-5 h-5" /></button>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full min-h-[600px] max-w-[1600px] mx-auto">
          
          {/* Calendar Area */}
          <div className="xl:col-span-3 glass-card bg-[var(--bg-elevated)] flex flex-col h-full shadow-lg overflow-hidden">
             
             {/* MONTH VIEW */}
             {view === "month" && (
               <>
                 <div className="grid grid-cols-7 border-b border-[var(--glass-border)] text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] bg-[var(--bg-surface)]">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                     <div key={day} className={`py-4 border-r border-[var(--glass-border)] last:border-r-0 ${i === 0 || i === 6 ? 'text-[var(--color-danger)] opacity-70' : ''}`}>{day}</div>
                   ))}
                 </div>
                 <div className="grid grid-cols-7 flex-1">
                   {Array.from({ length: totalCells }).map((_, i) => {
                     const dayNum = i - firstDayOfMonth + 1;
                     const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
                     const status = getDayStatus(dayNum, currentDate.getMonth());
                     
                     return (
                       <div key={i} className={`border-r border-b border-[var(--glass-border)] p-3 transition-all duration-300 relative group cursor-pointer overflow-hidden
                         ${!isValidDay ? 'opacity-20 bg-black' : 'hover:bg-[#111]'} 
                         ${status === 'today' ? 'bg-[var(--accent-primary-glow)] border-[rgba(6,182,212,0.3)] shadow-inner' : ''}
                       `}>
                         {isValidDay && <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--accent-primary)] pointer-events-none transition-colors duration-300"></div>}
                         <div className="flex justify-between items-start relative z-10">
                           <span className={`text-[14px] font-mono font-bold transition-colors duration-300 ${!isValidDay ? 'text-[var(--text-tertiary)]' : status === 'today' ? 'bg-[var(--accent-primary)] text-black w-7 h-7 flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_#000]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{isValidDay ? dayNum : ''}</span>
                         </div>
                         {isValidDay && (
                           <div className="mt-4 flex flex-col gap-1.5 relative z-10">
                             {status === 'today' && (
                               <>
                                 <div className="w-full text-[9px] font-mono font-bold bg-[var(--accent-primary)] text-black px-1.5 py-0.5 truncate shadow-sm">11a Deep Work</div>
                                 <div className="w-full text-[9px] font-mono font-bold bg-[var(--color-info)] text-white px-1.5 py-0.5 truncate shadow-sm">3p Stakeholder</div>
                               </>
                             )}
                           </div>
                         )}
                       </div>
                     )
                   })}
                 </div>
               </>
             )}

             {/* WEEK VIEW */}
             {view === "week" && (
                <div className="flex flex-col h-full bg-[var(--bg-surface)]">
                  <div className="grid grid-cols-8 border-b border-[var(--glass-border)] bg-[var(--bg-elevated)]">
                    <div className="border-r border-[var(--glass-border)] p-4 text-center">
                       <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">GMT+5:30</span>
                    </div>
                    {weekDays.map((d, i) => (
                      <div key={i} className={`p-4 border-r border-[var(--glass-border)] text-center last:border-r-0 ${d.getDate() === 24 && d.getMonth() === 5 ? 'bg-[var(--accent-primary-glow)] border-b-2 border-b-[var(--accent-primary)]' : ''}`}>
                         <div className={`text-[11px] uppercase font-bold tracking-widest ${i === 0 || i === 6 ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                         <div className={`text-[20px] font-mono font-black mt-1 ${d.getDate() === 24 && d.getMonth() === 5 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>{d.getDate()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="grid grid-cols-8 absolute inset-0">
                       <div className="border-r border-[var(--glass-border)] flex flex-col opacity-50">
                          {Array.from({length: 12}).map((_, i) => (
                             <div key={i} className="flex-1 border-b border-[var(--glass-border)] flex items-start justify-center pt-2">
                               <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{i + 8}:00</span>
                             </div>
                          ))}
                       </div>
                       {weekDays.map((d, col) => (
                         <div key={col} className="border-r border-[var(--glass-border)] last:border-r-0 flex flex-col relative group">
                            {Array.from({length: 12}).map((_, i) => (
                               <div key={i} className="flex-1 border-b border-[var(--glass-border)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer border-dashed opacity-30 group-hover:opacity-100"></div>
                            ))}
                            
                            {/* MOCK EVENTS FOR "TODAY" (June 24) */}
                            {d.getDate() === 24 && d.getMonth() === 5 && MOCK_EVENTS.map(ev => {
                              const top = ((ev.hour - 8) / 12) * 100;
                              const height = (ev.duration / 60) * (100 / 12);
                              return (
                                <div key={ev.id} className={`absolute left-1 right-1 border p-2 overflow-hidden shadow-md hover:z-10 transition-transform hover:scale-105 cursor-pointer ${
                                  ev.type === 'focus' ? 'bg-[var(--accent-primary-glow)] border-[var(--accent-primary)]' : 
                                  ev.type === 'meeting' ? 'bg-[rgba(59,130,246,0.15)] border-[var(--color-info)]' : 
                                  'bg-[rgba(245,158,11,0.15)] border-[var(--color-warning)]'
                                }`} style={{ top: `${top}%`, height: `${height}%` }}>
                                  <div className={`text-[10px] font-bold truncate ${ev.type === 'focus' ? 'text-[var(--accent-primary)]' : ev.type === 'meeting' ? 'text-[var(--color-info)]' : 'text-[var(--color-warning)]'}`}>{ev.title}</div>
                                  <div className="text-[9px] font-mono text-[var(--text-primary)] mt-0.5">{ev.time}</div>
                                </div>
                              )
                            })}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
             )}

             {/* DAY VIEW */}
             {view === "day" && (
                <div className="flex flex-col h-full bg-[var(--bg-surface)]">
                  <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--bg-elevated)] flex justify-between items-end">
                     <div>
                       <h2 className="text-[32px] font-display font-black text-[var(--text-primary)] tracking-tight">
                         {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                       </h2>
                       <p className="text-[14px] font-mono text-[var(--accent-primary)] font-bold">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                     </div>
                     <span className="badge badge--success uppercase tracking-widest text-[10px]">Active</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
                    <div className="absolute left-[80px] top-6 bottom-6 w-px bg-[var(--glass-border)]"></div>
                    <div className="space-y-0 relative">
                       {Array.from({length: 12}).map((_, i) => {
                         const hour = i + 8;
                         const ampm = hour >= 12 ? 'PM' : 'AM';
                         const h12 = hour > 12 ? hour - 12 : hour;
                         const evs = (currentDate.getDate() === 24 && currentDate.getMonth() === 5) ? MOCK_EVENTS.filter(e => e.hour === hour) : [];
                         
                         return (
                           <div key={i} className="flex min-h-[80px] group relative">
                              <div className="w-[80px] shrink-0 pr-4 text-right pt-2 relative z-10">
                                 <span className="text-[12px] font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">{h12} {ampm}</span>
                              </div>
                              <div className="flex-1 pl-8 pb-4 relative z-10 border-b border-[var(--glass-border)] border-dashed opacity-50 group-hover:opacity-100 transition-opacity">
                                 {evs.length === 0 ? (
                                   <div className="h-full w-full flex items-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 bg-[var(--bg-elevated)] px-3 py-1"><Plus className="w-3 h-3"/> Add Block</button>
                                   </div>
                                 ) : (
                                   <div className="space-y-3">
                                      {evs.map(ev => (
                                        <div key={ev.id} className={`p-4 border-l-4 bg-[var(--bg-elevated)] shadow-md hover:-translate-y-1 transition-transform cursor-pointer ${
                                           ev.type === 'focus' ? 'border-l-[var(--accent-primary)]' : 
                                           ev.type === 'meeting' ? 'border-l-[var(--color-info)]' : 'border-l-[var(--color-warning)]'
                                        }`}>
                                          <div className="flex justify-between items-start">
                                            <h4 className="text-[14px] font-bold text-[var(--text-primary)]">{ev.title}</h4>
                                            <span className="text-[11px] font-mono bg-black px-2 py-1 text-[var(--text-secondary)]">{ev.duration}m</span>
                                          </div>
                                          <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase mt-2 tracking-widest">{ev.type}</p>
                                        </div>
                                      ))}
                                   </div>
                                 )}
                              </div>
                           </div>
                         )
                       })}
                    </div>
                  </div>
                </div>
             )}

          </div>

          {/* Daily Schedule Pane */}
          <div className="glass-card bg-[var(--bg-elevated)] p-0 flex flex-col overflow-hidden shadow-lg border border-[var(--glass-border)] h-full">
             <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--bg-surface)]">
               <h3 className="card-eyebrow mb-0 text-[var(--accent-primary)] flex justify-between items-center">
                 <span>Agenda</span>
                 <span className="badge badge--cyan">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-[var(--bg-surface)]">
               {currentDate.getDate() === 24 && currentDate.getMonth() === 5 ? (
                 MOCK_EVENTS.map((event, i) => (
                   <div 
                     key={event.id} 
                     className={`p-4 border border-[var(--glass-border)] bg-[var(--bg-elevated)] hover:bg-black transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                       event.type === 'focus' ? 'hover:border-[var(--accent-primary)]' : 
                       event.type === 'meeting' ? 'hover:border-[var(--color-info)]' : 
                       'hover:border-[var(--color-warning)]'
                     }`}
                   >
                     <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${event.type === 'focus' ? 'bg-[var(--accent-primary)]' : event.type === 'meeting' ? 'bg-[var(--color-info)]' : 'bg-[var(--color-warning)]'}`}></div>
                     <div className="flex justify-between items-start mb-3 ml-2">
                       <h4 className="text-[13px] font-bold text-[var(--text-primary)] group-hover:text-white transition-colors">{event.title}</h4>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.1em] font-bold ml-2">
                       <span className="font-mono text-white">{event.time}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {event.duration}m</span>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex items-center justify-center text-center p-8">
                    <p className="text-[12px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">No events synchronized.</p>
                 </div>
               )}
             </div>
             
             <div className="p-6 border-t border-[var(--glass-border)] bg-[var(--bg-surface)]">
               <button className="w-full btn-primary justify-center py-3.5 text-[14px]">
                  Auto-Schedule
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
