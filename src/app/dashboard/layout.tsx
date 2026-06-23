"use client";

import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { 
  LayoutDashboard, Timer, BarChart2, Library, SlidersHorizontal, 
  TerminalSquare, Settings, ChevronDown, User as UserIcon, Flame, Target, Play, Pause, Activity
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const { timeLeft, isActive, mode, toggleTimer, formatTime } = useTimer();

  const [systemLoadPoints, setSystemLoadPoints] = useState([28, 35, 42, 38, 45, 50, 48, 40, 35, 28, 30, 28]);

  useEffect(() => {
    const int = setInterval(() => {
      setSystemLoadPoints(prev => {
        const newPts = [...prev.slice(1)];
        const last = newPts[newPts.length - 1];
        newPts.push(Math.min(100, Math.max(10, last + Math.floor(Math.random() * 21) - 10)));
        return newPts;
      });
    }, 3000);
    return () => clearInterval(int);
  }, []);

  if (!loading && !user) {
    if (typeof window !== 'undefined') window.location.href = '/auth';
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]"><div className="w-8 h-8 rounded-none border-2 border-[var(--accent-primary)] border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-body overflow-hidden selection:bg-[var(--accent-primary-glow)]">
      {/* SIDEBAR */}
      <aside className="w-[220px] h-full bg-[var(--bg-surface)] border-r-4 border-black flex flex-col z-20 shrink-0 relative transition-all duration-300">


        {/* Logo Area */}
        <div className="p-6 pb-8 flex items-center gap-3 border-b-4 border-black">
          <div className="w-8 h-8 bg-[var(--accent-primary)] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             <div className="w-3 h-3 bg-white border border-black transform rotate-45"></div>
          </div>
          <div>
            <h1 className="text-[16px] font-display font-semibold text-[var(--text-primary)] leading-tight tracking-tight">VibeShift AI</h1>
            <p className="text-[11px] font-body text-[var(--text-tertiary)]">AI Break Coach</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-3 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-secondary)]">Menu</div>
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Target, label: "Tasks & Goals", href: "/dashboard/tasks" },
            { icon: Timer, label: "Deep Sessions", href: "/dashboard/sessions" },
            { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
            { icon: Library, label: "Break Library", href: "/dashboard/library" },
          ].map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link key={i} href={item.href} className={`nav-item ${active ? 'nav-item--active' : ''}`}>
                <item.icon className="w-4 h-4 z-10" />
                <span className="z-10">{item.label}</span>
              </Link>
            );
          })}

          <div className="px-3 mt-8 mb-3 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-secondary)]">System</div>
          {[
            { icon: SlidersHorizontal, label: "Calibrate You", href: "/dashboard/calibrate" },
            { icon: TerminalSquare, label: "Agent Logs", href: "/dashboard/logs" },
            { icon: Settings, label: "Settings", href: "/dashboard/settings" },
          ].map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link key={i} href={item.href} className={`nav-item ${active ? 'nav-item--active' : ''}`}>
                <item.icon className="w-4 h-4 z-10" />
                <span className="z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Block */}
        <div className="px-6 py-4 border-t-4 border-black">
           <div className="flex items-center gap-2 mb-2">
              <span className="status-dot status-dot--active"></span>
              <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase">Online</span>
              <span className="text-[12px] font-bold text-[var(--text-primary)] ml-auto">SYS: 28%</span>
           </div>
           <div className="text-[12px] font-bold text-[var(--text-secondary)] mb-1 uppercase">Proc: 5/8</div>
           <div className="text-[12px] font-bold text-[var(--text-secondary)] uppercase">Mem: 4.2/16 GB</div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t-4 border-black bg-[var(--accent-primary)]">
          <div onClick={logout} className="flex items-center gap-3 p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none group">
            <div className="w-8 h-8 bg-white flex items-center justify-center shrink-0 border-r-2 border-black">
               {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-black" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] truncate flex items-center gap-1">
                {user?.displayName?.split(" ")[0] || "Arjun Dev"} <span className="text-[10px]">✓</span>
              </h3>
              <p className="text-[11px] font-medium text-[var(--text-secondary)]">Pro Plan <ChevronDown className="w-3 h-3 inline" /></p>
            </div>
          </div>
          <div className="mt-2 px-2 flex justify-between items-center text-[12px] font-medium text-[var(--text-secondary)]">
             <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[var(--color-warning)]" /> Streak: 7 days</span>
             <span>&gt;</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--bg-base)]">
        {children}
      </main>
    </div>
  );
}
