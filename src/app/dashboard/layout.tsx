"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { TaskEngine } from "@/components/TaskEngine";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    if (typeof window !== 'undefined') window.location.href = '/auth';
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center bg-[var(--bg-base)]"><div className="w-8 h-8 rounded-none border-2 border-[var(--accent-primary)] border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-body overflow-hidden selection:bg-[var(--accent-primary-glow)]">
      <TaskEngine />
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--bg-base)] w-full lg:w-[calc(100%-260px)]">
        {children}
      </main>
    </div>
  );
}
