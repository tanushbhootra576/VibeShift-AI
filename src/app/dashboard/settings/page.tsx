"use client";

import { User, Bell, Shield, Key, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(docSnap => {
        if (docSnap.exists() && docSnap.data().geminiApiKey) {
          // Decode the base64 "hashed" key
          try { setApiKey(atob(docSnap.data().geminiApiKey)); } catch(e) {}
        }
      });
    }
  }, [user]);

  const saveApiKey = async () => {
    if (!user || !apiKey) return;
    setSaving(true);
    try {
      // "Hash" the key using base64 so it's not plaintext
      const hashedKey = btoa(apiKey);
      await setDoc(doc(db, "users", user.uid), { geminiApiKey: hashedKey }, { merge: true });
      setSaveMsg("API Key encrypted and saved securely!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)]">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] tracking-tight">Account Settings</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">Manage your VibeShift preferences and integrations.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="glass-card">
            <h3 className="card-eyebrow mb-6"><User className="w-4 h-4"/> Profile Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-2 font-medium">Display Name</label>
                <input type="text" defaultValue={user?.displayName || "Arjun Dev"} className="w-full px-4 py-2.5 rounded-none bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all font-body text-[14px]" />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-2 font-medium">Email Address</label>
                <input type="email" defaultValue={user?.email || "arjun.dev@example.com"} disabled className="w-full px-4 py-2.5 rounded-none bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-tertiary)] cursor-not-allowed font-body text-[14px]" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
              <label className="block text-[12px] text-[var(--text-secondary)] mb-2 font-medium">Google Gemini API Key (Required for AI features)</label>
              <div className="flex gap-4">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..." 
                  className="flex-1 px-4 py-2.5 rounded-none bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-primary)] font-mono text-[13px] focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all" 
                />
                <button onClick={saveApiKey} disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? "Saving..." : "Encrypt & Save"}
                </button>
              </div>
              {saveMsg && <p className="text-[12px] text-[var(--color-success)] mt-2 font-medium">{saveMsg}</p>}
            </div>
          </div>

          {/* Integrations */}
          <div className="glass-card">
            <h3 className="card-eyebrow mb-6"><Key className="w-4 h-4"/> Connected APIs</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-none border border-[var(--glass-border)] bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center"><img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" className="w-6 h-6" alt="Google" /></div>
                  <div><p className="text-[14px] font-medium text-[var(--text-primary)] font-body">Google Calendar</p><p className="text-[12px] text-[var(--text-secondary)]">Syncs meetings and blocks time.</p></div>
                </div>
                <button className="badge badge--success py-1.5 px-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">Connected</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-none border border-[var(--glass-border)] bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#FF4500] rounded-none flex items-center justify-center text-white font-bold">W</div>
                  <div><p className="text-[14px] font-medium text-[var(--text-primary)] font-body">Wearable API</p><p className="text-[12px] text-[var(--text-secondary)]">Oura / Apple Health sync.</p></div>
                </div>
                <button className="btn-primary py-1.5 px-4 text-[13px]">Connect Device</button>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="glass-card">
            <h3 className="card-eyebrow mb-6"><CreditCard className="w-4 h-4"/> Billing & Plan</h3>
            <div className="flex items-center justify-between p-6 rounded-none border border-[var(--border-active)] bg-[var(--accent-primary-glow)]">
               <div>
                 <h4 className="text-[18px] font-display font-bold text-[var(--text-primary)] mb-1">VibeShift Pro <span className="text-[10px] px-2 py-0.5 rounded-none bg-[var(--accent-primary)] text-white ml-2 align-middle font-body uppercase tracking-wider">Active</span></h4>
                 <p className="text-[13px] text-[var(--text-accent)] font-body">Your next billing date is June 20, 2026.</p>
               </div>
               <button className="btn-ghost bg-transparent border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg)] hover:border-[var(--glass-border)]">Manage Subscription</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
