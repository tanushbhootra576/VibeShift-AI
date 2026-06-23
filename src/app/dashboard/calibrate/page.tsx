"use client";

import { SlidersHorizontal, Battery, BrainCircuit, Moon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function CalibratePage() {
  const { user } = useAuth();
  const [tolerance, setTolerance] = useState(90);
  const [sensitivity, setSensitivity] = useState(3);
  const [interventionStyle, setInterventionStyle] = useState("Strict");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "settings", "calibration");
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tolerance) setTolerance(data.tolerance);
          if (data.sensitivity) setSensitivity(data.sensitivity);
          if (data.interventionStyle) setInterventionStyle(data.interventionStyle);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const saveConfig = async () => {
    if (!user) return;
    setIsSaving(true);
    const docRef = doc(db, "users", user.uid, "settings", "calibration");
    await setDoc(docRef, { tolerance, sensitivity, interventionStyle }, { merge: true });
    setSaveMessage("Configuration saved successfully!");
    setIsSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
        <p>Loading calibration settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight">Calibrate Agent</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Fine-tune VibeShift to match your personal energy cycles.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-[12px] text-[var(--color-success)] font-medium">{saveMessage}</span>}
          <button onClick={saveConfig} disabled={isSaving} className="btn-primary min-w-[150px] disabled:opacity-50 justify-center">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configuration"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-3xl">
        <div className="space-y-6">
          
          <div className="glass-card">
            <h3 className="card-eyebrow mb-6"><Battery className="w-4 h-4 text-[var(--color-success)]"/> Energy Cycle Calibration</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[14px] mb-2 font-medium"><label className="text-[var(--text-primary)]">Deep Work Tolerance</label><span className="text-[var(--accent-live)] font-mono">{tolerance} mins</span></div>
                <input type="range" min="30" max="180" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value))} className="w-full accent-[var(--accent-live)] h-1 bg-[var(--glass-bg)] rounded-none appearance-none cursor-pointer" />
                <p className="text-[12px] text-[var(--text-secondary)] mt-2">Maximum duration the agent will allow before forcing a hard break.</p>
              </div>
              
              <div>
                <div className="flex justify-between text-[14px] mb-2 font-medium"><label className="text-[var(--text-primary)]">Interruption Sensitivity</label><span className="text-[var(--accent-primary)] font-mono">{sensitivity === 3 ? "High" : sensitivity === 2 ? "Medium" : "Low"}</span></div>
                <input type="range" min="1" max="3" value={sensitivity} onChange={(e) => setSensitivity(parseInt(e.target.value))} className="w-full accent-[var(--accent-primary)] h-1 bg-[var(--glass-bg)] rounded-none appearance-none cursor-pointer" />
                <p className="text-[12px] text-[var(--text-secondary)] mt-2">How quickly the agent responds to biometric stress markers.</p>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="card-eyebrow mb-6"><BrainCircuit className="w-4 h-4 text-[var(--color-warning)]"/> Agent Intervention Style</h3>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setInterventionStyle("Strict")} className={`p-4 rounded-none border cursor-pointer transition-colors ${interventionStyle === "Strict" ? "border-[var(--border-active)] bg-[var(--accent-primary-glow)]" : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-elevated)]"}`}>
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Strict (Coach)</h4>
                <p className="text-[12px] text-[var(--text-secondary)]">Blocks screen, forcefully reschedules meetings if fatigued.</p>
              </div>
              <div onClick={() => setInterventionStyle("Gentle")} className={`p-4 rounded-none border cursor-pointer transition-colors ${interventionStyle === "Gentle" ? "border-[rgba(6,182,212,0.4)] bg-[var(--accent-live-glow)]" : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-elevated)]"}`}>
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Gentle (Partner)</h4>
                <p className="text-[12px] text-[var(--text-secondary)]">Suggests breaks gently, allows you to easily skip or snooze.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
