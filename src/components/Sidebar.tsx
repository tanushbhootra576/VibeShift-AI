"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Timer, BarChart2, Library, SlidersHorizontal, 
  TerminalSquare, Settings, ChevronDown, User as UserIcon, Flame, Target,
  Menu, X, Calendar, Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsOpen(true);
      else setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarVariants: any = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          onClick={toggleSidebar} 
          className="fixed top-4 left-4 z-50 p-2 bg-[var(--accent-primary)] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        className="fixed lg:static w-[260px] h-full bg-[var(--bg-surface)] border-r-4 border-black flex flex-col z-40 shrink-0"
      >
        {/* Logo Area */}
        <div className="p-6 pb-8 flex items-center gap-3 border-b-4 border-black bg-[var(--bg-elevated)]">
          <div className="w-10 h-10 bg-[var(--accent-primary)] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
             <div className="w-4 h-4 bg-white border border-black transform rotate-45"></div>
          </div>
          <div>
            <h1 className="text-[18px] font-display font-black text-[var(--text-primary)] leading-tight tracking-tighter uppercase">VibeShift AI</h1>
            <p className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase font-bold mt-0.5">SYS.OS // v0.9.1</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-4 mt-2 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-tertiary)]">Core Companion</div>
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
            { icon: Target, label: "Tasks & Goals", href: "/dashboard/tasks" },
            { icon: Flame, label: "Goal Matrix", href: "/dashboard/habits" },
            { icon: Sparkles, label: "Recommendations", href: "/dashboard/recommendations" },
          ].map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={i} 
                href={item.href} 
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-none font-bold text-[13px] uppercase tracking-wide transition-all border-2 ${active ? 'bg-[var(--accent-primary)] text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'text-[var(--text-secondary)] border-transparent hover:border-black hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'}`}
              >
                <item.icon className="w-4 h-4 z-10" />
                <span className="z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Block */}
        <div className="p-5 border-t-4 border-black bg-[#0a0a0a]">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#10b981] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-pulse"></span>
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Net: Stable</span>
              </div>
              <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider">DDV: OK</span>
           </div>
           
           {/* Brutalist Progress Bar */}
           <div className="w-full h-3 bg-black border border-[#333] relative overflow-hidden mb-1">
             <div className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] w-[45%] border-r border-black"></div>
           </div>
           <div className="flex justify-between text-[9px] font-mono text-[var(--text-tertiary)] uppercase font-bold">
             <span>CPU Load</span>
             <span>45%</span>
           </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t-4 border-black bg-[var(--accent-primary)]">
          <div onClick={logout} className="flex items-center gap-3 p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none group">
            <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-black text-black uppercase truncate flex items-center gap-1 tracking-tight">
                {user?.displayName?.split(" ")[0] || "Arjun"} <span className="text-[10px] bg-black text-white px-1 py-0.5 ml-1">PRO</span>
              </h3>
              <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5 tracking-wider flex items-center gap-1">Logout <ChevronDown className="w-3 h-3" /></p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
