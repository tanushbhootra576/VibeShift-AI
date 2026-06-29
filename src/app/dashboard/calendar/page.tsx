"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Video, Plus, CheckCircle2, LayoutGrid, List, CalendarDays, ServerCrash, RefreshCw, BarChart2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useAuth } from "@/context/AuthContext";
import { fetchCalendarEvents } from "@/lib/calendar";

export default function CalendarPage() {
  const { user } = useAuth();
  const tasks = useTaskStore(state => state.tasks);
  

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid) {
      
      fetchCalendarEvents(user.uid).then(events => setCalendarEvents(events));

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
    setCurrentDate(new Date());
  };

  const allTimelineItems = [
    ...calendarEvents.map(e => {
      const startDate = e.start?.dateTime ? new Date(e.start.dateTime) : new Date(e.start?.date);
      const endDate = e.end?.dateTime ? new Date(e.end.dateTime) : new Date(e.end?.date);
      return {
        id: e.id,
        title: e.summary,
        date: startDate,
        hour: startDate.getHours(),
        minute: startDate.getMinutes(),
        duration: Math.round((endDate.getTime() - startDate.getTime()) / 60000) || 60,
        type: 'meeting',
        time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }),
    ...tasks.filter(t => t.status === 'pending' && t.deadline).map(t => {
      const deadlineDate = new Date((t.deadline as any).seconds ? (t.deadline as any).seconds * 1000 : (t.deadline as any));
      return {
        id: t.id,
        title: t.title,
        date: deadlineDate,
        hour: deadlineDate.getHours(),
        minute: deadlineDate.getMinutes(),
        duration: 30, // Default 30min for a deadline visual block
        type: 'deadline',
        time: deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    })
  ];

  const getEventsForDay = (dateToCheck: Date) => {
    return allTimelineItems.filter(e => 
      e.date.getDate() === dateToCheck.getDate() &&
      e.date.getMonth() === dateToCheck.getMonth() &&
      e.date.getFullYear() === dateToCheck.getFullYear()
    );
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
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] relative">
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between shrink-0 border-b border-[var(--border-subtle)] bg-transparent relative z-10 flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] md:text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2 md:gap-3">
             <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" /> Time Canvas
          </h2>
          <p className="text-[11px] md:text-[14px] text-[var(--text-secondary)] mt-1 font-body">AI-Optimized Schedule & Calendar Sync.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full 2xl:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
           {isGoogleConnected ? (
             <div className="flex items-center gap-2 px-3 py-2 border-2 border-[var(--memphis-mint)] bg-[rgba(0,200,83,0.1)] shrink-0 w-full md:w-auto justify-center">
               <CheckCircle2 className="w-4 h-4 text-[var(--memphis-mint)]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--memphis-mint)]">G-Cal Synced</span>
             </div>
           ) : (
             <button onClick={connectGoogleCalendar} disabled={isSyncing} className="flex shrink-0 items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-2xl border border-gray-100 bg-white hover:bg-black hover:text-white font-bold uppercase tracking-wider text-[11px] transition-colors shadow-sm disabled:opacity-50 w-full md:w-auto">
               {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ServerCrash className="w-4 h-4" />}
               {isSyncing ? "Connecting..." : "Connect G-Cal"}
             </button>
           )}

           <button onClick={jumpToToday} className="shrink-0 px-4 py-3 md:py-2 rounded-2xl border border-gray-100 bg-[var(--bg-elevated)] hover:bg-[var(--memphis-pink)] hover:text-black hover:border-[var(--memphis-pink)] font-bold uppercase tracking-wider text-[11px] transition-colors shadow-sm w-full md:w-auto text-center">
             Today
           </button>

           {/* View Options */}
           <div className="flex shrink-0 bg-[var(--bg-surface)] border border-[var(--glass-border)] p-1 w-full md:w-auto overflow-x-auto">
             <button onClick={() => setView("month")} className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${view === "month" ? "bg-[var(--memphis-pink)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> Month</button>
             <button onClick={() => setView("week")} className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${view === "week" ? "bg-[var(--memphis-pink)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><CalendarDays className="w-3.5 h-3.5 inline mr-1" /> Week</button>
             <button onClick={() => setView("day")} className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${view === "day" ? "bg-[var(--memphis-pink)] text-black shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}><List className="w-3.5 h-3.5 inline mr-1" /> Day</button>
           </div>

           {/* Navigation */}
           <div className="flex shrink-0 items-center justify-between md:justify-start gap-2 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
              <button onClick={() => changeDate(-1)} className="p-3 md:p-2 border border-[var(--glass-border)] hover:bg-[var(--accent-primary-glow)] hover:text-[var(--memphis-pink)] transition-colors rounded-none"><ChevronLeft className="w-5 h-5" /></button>
              <span className="font-display font-bold text-[13px] md:text-[18px] uppercase tracking-widest text-[var(--text-primary)] min-w-[150px] md:w-[240px] text-center">
                {view === "day" ? currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 
                 view === "week" ? `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                 `${currentMonthName} ${currentYear}`}
              </span>
              <button onClick={() => changeDate(1)} className="p-3 md:p-2 border border-[var(--glass-border)] hover:bg-[var(--accent-primary-glow)] hover:text-[var(--memphis-pink)] transition-colors rounded-none"><ChevronRight className="w-5 h-5" /></button>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8 h-full min-h-[600px] max-w-[1600px] mx-auto">
          
          {/* Calendar Area */}
          <div className="xl:col-span-3 memphis-card bg-[var(--bg-elevated)] flex flex-col h-full shadow-lg overflow-hidden min-h-[400px]">
             
             {/* MONTH VIEW */}
             {view === "month" && (
               <div className="flex flex-col h-full w-full overflow-x-auto">
                 <div className="min-w-[600px] md:min-w-0 flex-1 flex flex-col">
                   <div className="grid grid-cols-7 border-b border-[var(--glass-border)] text-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-[var(--text-secondary)] bg-[var(--bg-surface)]">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                       <div key={day} className={`py-3 md:py-4 border-r border-[var(--glass-border)] last:border-r-0 ${i === 0 || i === 6 ? 'text-[var(--memphis-red)] opacity-70' : ''}`}>{day}</div>
                     ))}
                   </div>
                   <div className="grid grid-cols-7 flex-1">
                     {Array.from({ length: totalCells }).map((_, i) => {
                       const dayNum = i - firstDayOfMonth + 1;
                       const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
                       const status = getDayStatus(dayNum, currentDate.getMonth());
                       
                       return (
                         <div key={i} className={`border-r border-b border-[var(--glass-border)] p-2 md:p-3 transition-all duration-300 relative group cursor-pointer overflow-hidden min-h-[60px] md:min-h-0
                           ${!isValidDay ? 'opacity-20 bg-black' : 'hover:bg-[#111]'} 
                           ${status === 'today' ? 'bg-[var(--accent-primary-glow)] border-[rgba(6,182,212,0.3)] shadow-inner' : ''}
                         `}>
                           {isValidDay && <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--memphis-pink)] pointer-events-none transition-colors duration-300"></div>}
                           <div className="flex justify-between items-start relative z-10">
                             <span className={`text-[12px] md:text-[14px] font-mono font-bold transition-colors duration-300 ${!isValidDay ? 'text-[var(--text-tertiary)]' : status === 'today' ? 'bg-[var(--memphis-pink)] text-black w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-none shadow-sm' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{isValidDay ? dayNum : ''}</span>
                           </div>
                           {isValidDay && (
                             <div className="mt-2 md:mt-4 flex flex-col gap-1 md:gap-1.5 relative z-10">
                               {status === 'today' && (
                                 <>
                                   <div className="w-full text-[8px] md:text-[9px] font-mono font-bold bg-[var(--memphis-pink)] text-black px-1.5 py-0.5 truncate shadow-sm">11a Deep Work</div>
                                   <div className="w-full text-[8px] md:text-[9px] font-mono font-bold bg-[var(--memphis-blue)] text-white px-1.5 py-0.5 truncate shadow-sm">3p Stakeholder</div>
                                 </>
                               )}
                             </div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                 </div>
               </div>
             )}

             {/* WEEK VIEW */}
             {view === "week" && (
                <div className="flex flex-col h-full bg-[var(--bg-surface)] overflow-x-auto">
                  <div className="min-w-[700px] flex-1 flex flex-col">
                    <div className="grid grid-cols-8 border-b border-[var(--glass-border)] bg-[var(--bg-elevated)]">
                      <div className="border-r border-[var(--glass-border)] p-2 md:p-4 text-center flex items-center justify-center">
                         <span className="text-[9px] md:text-[10px] uppercase font-bold text-[var(--text-tertiary)]">GMT+5:30</span>
                      </div>
                      {weekDays.map((d, i) => (
                        <div key={i} className={`p-2 md:p-4 border-r border-[var(--glass-border)] text-center last:border-r-0 flex flex-col justify-center ${d.getDate() === 24 && d.getMonth() === 5 ? 'bg-[var(--accent-primary-glow)] border-b-2 border-b-[var(--memphis-pink)]' : ''}`}>
                           <div className={`text-[9px] md:text-[11px] uppercase font-bold tracking-widest ${i === 0 || i === 6 ? 'text-[var(--memphis-red)]' : 'text-[var(--text-secondary)]'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                           <div className={`text-[16px] md:text-[20px] font-mono font-black mt-1 ${d.getDate() === 24 && d.getMonth() === 5 ? 'text-[var(--memphis-pink)]' : 'text-[var(--text-primary)]'}`}>{d.getDate()}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                      <div className="grid grid-cols-8 absolute inset-0">
                         <div className="border-r border-[var(--glass-border)] flex flex-col opacity-50">
                            {Array.from({length: 12}).map((_, i) => (
                               <div key={i} className="flex-1 border-b border-[var(--glass-border)] flex items-start justify-center pt-2 min-h-[40px] md:min-h-[50px]">
                                 <span className="text-[9px] md:text-[10px] font-mono text-[var(--text-tertiary)]">{i + 8}:00</span>
                               </div>
                            ))}
                         </div>
                         {weekDays.map((d, col) => (
                           <div key={col} className="border-r border-[var(--glass-border)] last:border-r-0 flex flex-col relative group">
                              {Array.from({length: 12}).map((_, i) => (
                                 <div key={i} className="flex-1 border-b border-[var(--glass-border)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer border-dashed opacity-30 group-hover:opacity-100 min-h-[40px] md:min-h-[50px]"></div>
                              ))}
                              
                              {/* RENDER EVENTS FOR THIS DAY */}
                              {getEventsForDay(d).map(ev => {
                                const top = ((ev.hour - 8 + (ev.minute / 60)) / 12) * 100;
                                const height = (ev.duration / 60) * (100 / 12);
                                return (
                                  <div key={ev.id} className={`absolute left-1 right-1 border p-1 md:p-2 overflow-hidden shadow-md hover:z-10 transition-transform hover:scale-105 cursor-pointer ${
                                    ev.type === 'focus' ? 'bg-[var(--accent-primary-glow)] border-[var(--memphis-pink)]' : 
                                    ev.type === 'meeting' ? 'bg-[rgba(59,130,246,0.15)] border-[var(--memphis-blue)]' : 
                                    'bg-[rgba(245,158,11,0.15)] border-[var(--memphis-yellow)]'
                                  }`} style={{ top: `${top}%`, height: `${height}%` }}>
                                    <div className={`text-[9px] md:text-[10px] font-bold truncate ${ev.type === 'focus' ? 'text-[var(--memphis-pink)]' : ev.type === 'meeting' ? 'text-[var(--memphis-blue)]' : 'text-[var(--memphis-yellow)]'}`}>{ev.title}</div>
                                    <div className="hidden md:block text-[9px] font-mono text-[var(--text-primary)] mt-0.5">{ev.time}</div>
                                  </div>
                                )
                              })}
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
             )}

             {/* DAY VIEW */}
             {view === "day" && (
                <div className="flex flex-col h-full bg-[var(--bg-surface)]">
                  <div className="p-4 md:p-6 border-b border-[var(--glass-border)] bg-[var(--bg-elevated)] flex justify-between items-end">
                     <div>
                       <h2 className="text-[24px] md:text-[32px] font-display font-black text-[var(--text-primary)] tracking-tight">
                         {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                       </h2>
                       <p className="text-[12px] md:text-[14px] font-mono text-[var(--memphis-pink)] font-bold">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                     </div>
                     <span className="badge badge--success uppercase tracking-widest text-[10px] whitespace-nowrap hidden md:inline-block">Active</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-6">
                    <div className="absolute left-[60px] md:left-[80px] top-4 md:top-6 bottom-6 w-px bg-[var(--glass-border)]"></div>
                    <div className="space-y-0 relative">
                       {Array.from({length: 12}).map((_, i) => {
                         const hour = i + 8;
                         const ampm = hour >= 12 ? 'PM' : 'AM';
                         const h12 = hour > 12 ? hour - 12 : hour;
                         const evs = getEventsForDay(currentDate).filter(e => e.hour === hour);
                         
                         return (
                           <div key={i} className="flex min-h-[60px] md:min-h-[80px] group relative">
                              <div className="w-[50px] md:w-[80px] shrink-0 pr-3 md:pr-4 text-right pt-2 relative z-10">
                                 <span className="text-[10px] md:text-[12px] font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--memphis-pink)] transition-colors">{h12} {ampm}</span>
                              </div>
                              <div className="flex-1 pl-4 md:pl-8 pb-3 md:pb-4 relative z-10 border-b border-[var(--glass-border)] border-dashed opacity-50 group-hover:opacity-100 transition-opacity">
                                 {evs.length === 0 ? (
                                   <div className="h-full w-full flex items-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="text-[10px] md:text-[11px] font-bold uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 bg-[var(--bg-elevated)] px-3 py-1.5 md:py-1"><Plus className="w-3 h-3"/> Add Block</button>
                                   </div>
                                 ) : (
                                   <div className="space-y-3">
                                      {evs.map(ev => (
                                        <div key={ev.id} className={`p-3 md:p-4 border-l-4 bg-[var(--bg-elevated)] shadow-md hover:-translate-y-1 transition-transform cursor-pointer ${
                                           ev.type === 'focus' ? 'border-l-[var(--memphis-pink)]' : 
                                           ev.type === 'meeting' ? 'border-l-[var(--memphis-blue)]' : 'border-l-[var(--memphis-yellow)]'
                                        }`}>
                                          <div className="flex justify-between items-start">
                                            <h4 className="text-[12px] md:text-[14px] font-bold text-[var(--text-primary)]">{ev.title}</h4>
                                            <span className="text-[10px] md:text-[11px] font-mono bg-black px-2 py-1 text-[var(--text-secondary)] shrink-0">{ev.duration}m</span>
                                          </div>
                                          <p className="text-[10px] md:text-[11px] font-bold text-[var(--text-tertiary)] uppercase mt-2 tracking-widest">{ev.type}</p>
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
          <div className="xl:col-span-1 memphis-card bg-[var(--bg-elevated)] p-0 flex flex-col overflow-hidden shadow-lg border border-[var(--glass-border)] min-h-[400px] h-full">
             <div className="p-4 md:p-6 border-b border-[var(--glass-border)] bg-[var(--bg-surface)]">
               <h3 className="card-eyebrow mb-0 text-[var(--memphis-pink)] flex justify-between items-center text-[14px] md:text-[16px]">
                 <span>Agenda</span>
                 <span className="badge badge--cyan">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 bg-[var(--bg-surface)]">
               
               {/* Predictive Workload Forecasting */}
               <div className="mb-4 md:mb-6 p-3 md:p-4 border border-[var(--glass-border)] bg-[var(--bg-elevated)] group">
                 <h4 className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2 md:mb-3 flex items-center gap-2">
                   <BarChart2 className="w-3.5 h-3.5" /> Predictive Workload Forecast
                 </h4>
                 <div className="flex items-end gap-1 h-10 md:h-12">
                   {[40, 70, 100, 30, 80, 50, 20].map((h, i) => (
                     <div key={i} className={`flex-1 ${h > 80 ? 'bg-[var(--memphis-red)]' : 'bg-[var(--memphis-pink)]'} transition-all opacity-80 group-hover:opacity-100`} style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
                 <p className="text-[8px] md:text-[9px] font-mono text-[var(--text-tertiary)] mt-2">Peak cognitive load expected on Wednesday.</p>
               </div>

               {getEventsForDay(currentDate).length > 0 ? (
                 getEventsForDay(currentDate).map((event: any) => (
                   <div 
                     key={event.id} 
                     className={`p-3 md:p-4 border border-[var(--glass-border)] bg-[var(--bg-elevated)] hover:bg-black transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                       event.type === 'focus' ? 'hover:border-[var(--memphis-pink)]' : 
                       event.type === 'meeting' ? 'hover:border-[var(--memphis-blue)]' : 
                       'hover:border-[var(--memphis-yellow)]'
                     }`}
                   >
                     <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${event.type === 'focus' ? 'bg-[var(--memphis-pink)]' : event.type === 'meeting' ? 'bg-[var(--memphis-blue)]' : 'bg-[var(--memphis-yellow)]'}`}></div>
                     <div className="flex justify-between items-start mb-2 md:mb-3 ml-2">
                       <h4 className="text-[12px] md:text-[13px] font-bold text-[var(--text-primary)] group-hover:text-white transition-colors">{event.title}</h4>
                     </div>
                     <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.1em] font-bold ml-2 flex-wrap">
                       <span className="font-mono text-white bg-black px-1 py-0.5 md:bg-transparent md:px-0">{event.time}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {event.duration}m</span>
                     </div>
                     {event.type === 'meeting' && (
                       <button className="ml-2 mt-2 md:mt-3 px-2 md:px-3 py-2 md:py-1.5 border border-[var(--glass-border)] bg-[var(--memphis-blue)] text-white rounded-xl text-[8px] md:text-[9px] font-mono uppercase tracking-widest hover:bg-[var(--memphis-blue)] hover:border-[var(--memphis-blue)] transition-colors flex items-center justify-center gap-1.5 w-full md:w-auto">
                         <FileText className="w-3 h-3" /> Generate AI Prep Brief
                       </button>
                     )}
                   </div>
                 ))
               ) : (
                 <div className="h-full flex items-center justify-center text-center p-6 md:p-8">
                    <p className="text-[11px] md:text-[12px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">No events synchronized.</p>
                 </div>
               )}
             </div>
             
             <div className="p-4 md:p-6 border-t border-[var(--glass-border)] bg-[var(--bg-surface)] mt-auto">
               <button className="w-full memphis-btn justify-center py-3 md:py-3.5 text-[13px] md:text-[14px]">
                  Auto-Schedule
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
