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

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          onClick={toggleSidebar} 
          className="fixed top-3 left-4 z-50 p-3 bg-[var(--memphis-yellow)] border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black hover:translate-y-0.5 hover:shadow-sm transition-all flex items-center justify-center min-w-[48px] min-h-[48px]"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Backdrop */}
      {isMobile && isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-[100dvh] w-[280px] lg:w-[260px] bg-[var(--memphis-pink)] border-r-4 border-black flex flex-col z-40 shrink-0 overflow-hidden transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />

        {/* Logo Area */}
        <div className="p-6 pb-8 flex items-center gap-3 border-b-4 border-black bg-white relative z-10 min-h-[88px]">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
             <div className="w-4 h-4 bg-white border border-black transform rotate-45"></div>
          </div>
          <div>
            <h1 className="text-[18px] font-display font-black text-black leading-tight tracking-tighter uppercase">VibeShift AI</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-20 lg:pb-4">
          <div className="px-3 mb-4 mt-2 text-[10px] font-black tracking-[0.2em] uppercase text-black">Core Companion</div>
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Sparkles, label: "Sticky Board", href: "/dashboard/sticky-board" },
            { icon: Target, label: "Tasks & Goals", href: "/dashboard/tasks" },
            { icon: Flame, label: "Goal Matrix", href: "/dashboard/habits" },
            { icon: Sparkles, label: "Recommendations", href: "/dashboard/recommendations" },
            { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
            { icon: Timer, label: "Sessions", href: "/dashboard/sessions" },
            { icon: Library, label: "Break Library", href: "/dashboard/library" },
            { icon: TerminalSquare, label: "Telemetry", href: "/dashboard/telemetry" },
            { icon: Settings, label: "Settings", href: "/dashboard/settings" },
          ].map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={i} 
                href={item.href} 
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 lg:py-3 rounded-xl font-black text-[13px] uppercase tracking-wide transition-all border-2 min-h-[48px] touch-manipulation ${active ? 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 -translate-y-1' : 'text-white border-transparent hover:bg-white/20'}`}
              >
                <item.icon className="w-5 h-5 lg:w-4 lg:h-4 z-10 shrink-0" />
                <span className="z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t-4 border-black bg-[var(--memphis-yellow)] relative z-10">
          <div onClick={logout} className="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 group min-h-[56px] touch-manipulation">
            <div className="w-10 h-10 bg-[var(--memphis-blue)] flex items-center justify-center shrink-0 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
               {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-black text-black uppercase truncate flex items-center gap-1 tracking-tight">
                {user?.displayName?.split(" ")[0] || "Arjun"}
              </h3>
              <p className="text-[10px] font-bold text-black uppercase mt-0.5 tracking-wider flex items-center gap-1">Logout <ChevronDown className="w-3 h-3" /></p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
