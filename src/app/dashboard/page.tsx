"use client";

import { Suspense } from "react";
import CommandCenterDashboard from "@/components/CommandCenterDashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center"><div className="w-8 h-8 animate-spin border-4 border-black border-t-[var(--memphis-pink)] rounded-full"></div></div>}>
      <CommandCenterDashboard />
    </Suspense>
  );
}
