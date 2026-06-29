import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TelemetryTrigger {
  burnoutSignaled: boolean;
  deepWorkActive: boolean;
}

export const FocusSanctuaryDashboard = ({ telemetryTrigger }: { telemetryTrigger: TelemetryTrigger }) => {
  // States: 'ZEN' (Planning), 'SPRINT' (Focus), 'RECOVERY' (Burnout Care)
  const [uiMode, setUiMode] = useState<'ZEN' | 'SPRINT' | 'RECOVERY'>('ZEN');

  useEffect(() => {
    // Simulating conditional assignment from the State Router Endpoint
    if (telemetryTrigger.burnoutSignaled) setUiMode('RECOVERY');
    else if (telemetryTrigger.deepWorkActive) setUiMode('SPRINT');
    else setUiMode('ZEN');
  }, [telemetryTrigger]);

  // Style Profiles Map
  const modeThemes = {
    ZEN: { bg: 'bg-slate-900', text: 'font-sans text-slate-100', accent: 'border-slate-700' },
    SPRINT: { bg: 'bg-black', text: 'font-mono text-cyan-400', accent: 'border-cyan-500' },
    RECOVERY: { bg: 'bg-stone-50', text: 'font-light tracking-wide text-stone-800', accent: 'border-emerald-200' }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-1000 ${modeThemes[uiMode].bg} ${modeThemes[uiMode].text} p-4 md:p-8`}>
      
      {/* Header Panel - Contextually hidden during SPRINT execution loops */}
      <AnimatePresence>
        {uiMode !== 'SPRINT' && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12 border-b pb-4 border-opacity-20"
          >
            <h1 className="text-lg md:text-xl tracking-widest font-semibold">SANCTUARY OS</h1>
            <span className="text-[10px] md:text-xs px-3 py-1.5 rounded-full border opacity-60 min-h-[32px] flex items-center">System State: {uiMode}</span>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Structural Morph Workspace */}
      <main className="max-w-4xl mx-auto mt-6 md:mt-10">
        <AnimatePresence mode="wait">
          
          {/* 1. ZEN MODE LAYOUT (Standard Operations/Strategic Planning) */}
          {uiMode === 'ZEN' && (
            <motion.div key="zen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 p-4 md:p-6 rounded-xl border border-slate-800 bg-slate-950/40">
                <h3 className="text-base md:text-lg mb-4 text-slate-400">Strategic Runway</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">All standard multi-panel queues, logs, and calendar grids render here dynamically.</p>
              </div>
              <div className="p-4 md:p-6 rounded-xl border border-slate-800 bg-slate-950/40">
                <h3 className="text-base md:text-lg mb-2 text-slate-400">Context</h3>
                <span className="text-xs md:text-sm text-emerald-400 leading-relaxed block">System Ready for Deep Sprint Cycles</span>
              </div>
            </motion.div>
          )}

          {/* 2. SPRINT MODE LAYOUT (Zero Distractions / Single Progress Engine) */}
          {uiMode === 'SPRINT' && (
            <motion.div key="sprint" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="flex flex-col items-center justify-center py-10 md:py-20 px-4 text-center">
              <span className="text-[10px] md:text-xs tracking-widest text-cyan-500 uppercase mb-4">CRITICAL BLOCK IN PROGRESS</span>
              <h2 className="text-xl md:text-3xl font-bold mb-8 md:mb-10 tracking-tight text-white">Refactoring Core API Workers</h2>
              
              {/* Giant Progress Ring Visualizer */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="4" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#06b6d4" strokeWidth="4" fill="transparent" strokeDasharray="251.2" strokeDashoffset="75" className="transition-all duration-500" />
                </svg>
                <div className="absolute text-xl md:text-2xl font-bold text-white">42m Left</div>
              </div>
            </motion.div>
          )}

          {/* 3. RECOVERY MODE LAYOUT (Decompression Framework / Micro-Dose Action) */}
          {uiMode === 'RECOVERY' && (
            <motion.div key="recovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-xl mx-auto p-6 md:p-10 rounded-2xl bg-white shadow-sm border border-emerald-100 text-center">
              <span className="text-3xl">🌿</span>
              <h2 className="text-xl md:text-2xl font-normal text-stone-800 mt-4 mb-2 font-serif">Time to step back</h2>
              <p className="text-stone-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">Biometrics indicate elevated fatigue markers. We shuffled your dense queues to clear workspace overhead.</p>
              
              {/* Gentle Micro Action Interface */}
              <div className="p-4 md:p-6 rounded-xl bg-stone-50 border border-stone-200/60 inline-block w-full">
                <p className="text-stone-700 text-sm md:text-md font-medium mb-4">"Take a breath. Let's do just 3 minutes of reviewing slides."</p>
                <button className="w-full md:w-auto min-h-[44px] px-6 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center">
                  Begin Micro-Step
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};
