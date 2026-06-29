"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FocusSanctuaryDashboard, TelemetryTrigger } from "@/components/FocusSanctuaryDashboard";

export default function SanctuaryPage() {
  const { user } = useAuth();
  const [telemetryTrigger, setTelemetryTrigger] = useState<TelemetryTrigger>({ burnoutSignaled: false, deepWorkActive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Fetch the cognitive profile config from the routing engine
    fetch(`/api/v1/sanctuary/current-profile?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.recommended_mode) {
           const mode = data.data.recommended_mode;
           setTelemetryTrigger({
             burnoutSignaled: mode === 'RECOVERY_MODE',
             deepWorkActive: mode === 'SPRINT_MODE'
           });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-mono text-xs md:text-sm tracking-widest uppercase p-4 text-center">Initializing Sanctuary OS...</div>;
  }

  return <FocusSanctuaryDashboard telemetryTrigger={telemetryTrigger} />;
}
