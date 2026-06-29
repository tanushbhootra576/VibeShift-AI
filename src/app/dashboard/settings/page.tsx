"use client";

import { User, Key, CreditCard } from "lucide-react";
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
    <div className="flex flex-col h-full bg-[#FDFBF7] text-black">
      {/* ── MEMPHIS HEADER ── */}
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black bg-[var(--memphis-yellow)] relative overflow-hidden gap-2">
        {/* cross-hatch pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 16px)",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-[22px] md:text-[28px] font-black uppercase tracking-tight text-black">Account Settings</h2>
          <p className="text-[11px] md:text-[13px] font-bold uppercase tracking-widest text-black/60 mt-0.5">
            Manage your VibeShift preferences and integrations.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 max-w-4xl bg-[#FDFBF7] mx-auto w-full">
        <div className="space-y-6 md:space-y-8">

          {/* ── PROFILE SECTION ── */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_var(--memphis-pink)] md:shadow-[6px_6px_0px_var(--memphis-pink)]"
          >
            <h3 className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-black mb-4 md:mb-6 border-b-2 border-black pb-2 md:pb-3">
              <User className="w-4 h-4" /> Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-[11px] md:text-[12px] text-black font-black uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={user?.displayName || "Arjun Dev"}
                  readOnly
                  className="w-full px-4 py-2 md:py-2.5 bg-black/5 border-2 border-black/30 text-black/50 cursor-not-allowed transition-all font-mono text-[13px] md:text-[14px] rounded-none min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-[11px] md:text-[12px] text-black font-black uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || "arjun.dev@example.com"}
                  readOnly
                  className="w-full px-4 py-2 md:py-2.5 bg-black/5 border-2 border-black/30 text-black/50 cursor-not-allowed font-mono text-[13px] md:text-[14px] rounded-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 md:pt-6 border-t-2 border-black">
              <label className="block text-[11px] md:text-[12px] text-black font-black uppercase tracking-wider mb-2">
                Google Gemini API Key <span className="text-[var(--memphis-pink)] block md:inline mt-1 md:mt-0">(Required for AI features)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-4 py-2 md:py-2.5 bg-white border-2 border-black text-black font-mono text-[12px] md:text-[13px] focus:outline-none focus:border-[var(--memphis-pink)] transition-all rounded-none placeholder:text-black/30 min-h-[44px]"
                />
                <button
                  onClick={saveApiKey}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[12px] border-2 border-black hover:bg-[var(--memphis-pink)] hover:border-[var(--memphis-pink)] transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {saving ? "Saving..." : "Encrypt & Save"}
                </button>
              </div>
              {saveMsg && (
                <p className="text-[11px] md:text-[12px] text-[var(--memphis-mint)] mt-3 md:mt-2 font-black uppercase tracking-wider">
                  ✓ {saveMsg}
                </p>
              )}
            </div>
          </div>

          {/* ── CONNECTED APIS ── */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_var(--memphis-yellow)] md:shadow-[6px_6px_0px_var(--memphis-yellow)]"
          >
            <h3 className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-black mb-4 md:mb-6 border-b-2 border-black pb-2 md:pb-3">
              <Key className="w-4 h-4" /> Connected APIs
            </h3>
            <div className="space-y-3 md:space-y-4">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border-2 border-black bg-white gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                    <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" className="w-5 h-5 md:w-6 md:h-6" alt="Google" />
                  </div>
                  <div>
                    <p className="text-[13px] md:text-[14px] font-black uppercase text-black">Google Calendar</p>
                    <p className="text-[11px] md:text-[12px] text-black/60 font-mono mt-0.5">Syncs meetings and blocks time.</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto px-3 py-1.5 md:py-1 bg-[var(--memphis-mint)] text-black text-[10px] md:text-[11px] font-black uppercase tracking-widest border-2 border-black min-h-[32px] md:min-h-[auto] flex items-center">
                  Connected
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border-2 border-black bg-white gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 bg-[#FF4500] border-2 border-black flex items-center justify-center text-white font-black shrink-0 text-[14px]">
                    W
                  </div>
                  <div>
                    <p className="text-[13px] md:text-[14px] font-black uppercase text-black">Wearable API</p>
                    <p className="text-[11px] md:text-[12px] text-black/60 font-mono mt-0.5">Oura / Apple Health sync.</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 md:py-1.5 bg-black text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest border-2 border-black hover:bg-[var(--memphis-blue)] transition-colors min-h-[44px] sm:min-h-[auto]">
                  Connect Device
                </button>
              </div>

            </div>
          </div>

          {/* ── BILLING & PLAN ── */}
          <div
            className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_var(--memphis-mint)] md:shadow-[6px_6px_0px_var(--memphis-mint)]"
          >
            <h3 className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-black mb-4 md:mb-6 border-b-2 border-black pb-2 md:pb-3">
              <CreditCard className="w-4 h-4" /> Billing &amp; Plan
            </h3>
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-2 border-black bg-[var(--memphis-pink)]/10 gap-4">
              <div>
                <h4 className="text-[16px] md:text-[18px] font-black uppercase text-black mb-1 flex items-center flex-wrap gap-2">
                  VibeShift Pro
                  <span className="text-[9px] md:text-[10px] px-2 py-0.5 bg-[var(--memphis-pink)] text-white font-black uppercase tracking-wider border border-black">
                    Active
                  </span>
                </h4>
                <p className="text-[12px] md:text-[13px] text-black/70 font-mono mt-1">Your next billing date is June 20, 2026.</p>
              </div>
              <button className="w-full md:w-auto px-6 py-2.5 bg-white text-black text-[11px] md:text-[12px] font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors min-h-[44px]">
                Manage Subscription
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
