"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { TaskEngine } from "@/components/TaskEngine";
import { SanctuaryProvider, useSanctuary } from "@/context/SanctuaryContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sanctuaryMode } = useSanctuary();
  const isSprint = sanctuaryMode === "sprint";

  return (
    <div className="flex h-[100dvh] w-full bg-[var(--bg-base)] text-black font-body overflow-hidden">
      <TaskEngine />
      {/* Sidebar hidden in Sprint mode */}
      {!isSprint && <Sidebar />}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--bg-base)] w-full transition-all duration-300 ${!isSprint ? 'lg:w-[calc(100%-260px)]' : ''}`}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
  }

  if (loading || !user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-4 border-black border-t-[var(--memphis-pink)] animate-spin" />
      </div>
    );
  }

  return (
    <SanctuaryProvider>
      <DashboardShell>{children}</DashboardShell>
    </SanctuaryProvider>
  );
}
