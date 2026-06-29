import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface BaseEvent {
  id: string;
  title: string;
  timeSlotString: string;
}

export interface ShadowEvent {
  original_event_id: string;
  title: string;
  shadowTimeSlotString: string;
  status_change: 'shifted' | 'encroached' | 'safe';
  visual_severity_weight: number;
  impact_explanation: string;
}

interface ShadowScheduleOverlayProps {
  normalSchedule: BaseEvent[];
  simulatedShadowSchedule: ShadowEvent[];
  onToggleSim?: (active: boolean) => void;
}

export const ShadowScheduleOverlay = ({ normalSchedule, simulatedShadowSchedule, onToggleSim }: ShadowScheduleOverlayProps) => {
  const [showFutureSelf, setShowFutureSelf] = useState(false);

  const handleToggle = () => {
    const newState = !showFutureSelf;
    setShowFutureSelf(newState);
    if (onToggleSim) onToggleSim(newState);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
      
      {/* Simulation Master Toggle Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 w-full">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold tracking-wide text-white">Temporal Projection Lens</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed pr-2">Reveal how today's delays rewrite your personal time and future schedule.</p>
        </div>
        <label className="relative flex items-center cursor-pointer min-h-[48px] group w-full sm:w-auto p-2 sm:p-0 -ml-2 sm:ml-0 rounded-lg hover:bg-slate-800/50 sm:hover:bg-transparent transition-colors">
          <div className="relative flex items-center flex-shrink-0">
            <input 
              type="checkbox" 
              checked={showFutureSelf} 
              onChange={handleToggle} 
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </div>
          <span className="ml-3 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors select-none">Show My Future Self</span>
        </label>
      </div>

      {/* Calendar Grid Viewport Wrapper */}
      <div className="relative grid grid-cols-1 gap-4 bg-slate-900/40 p-3 sm:p-5 rounded-xl min-h-[300px] w-full border border-slate-800/50">
        
        {/* Baseline Actual Schedule Layer */}
        <div className="space-y-3 sm:space-y-4 z-10 w-full flex-1">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 block mb-3 px-1">Active Baseline Timeline</span>
          {normalSchedule.map((event) => (
            <div key={event.id} className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all w-full shadow-sm">
              <div className="flex-1 pr-2">
                <h4 className="text-sm sm:text-base font-medium text-slate-200 line-clamp-2">{event.title}</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5">{event.timeSlotString}</p>
              </div>
              <span className="self-start sm:self-auto text-[10px] sm:text-xs text-slate-500 px-2.5 py-1 bg-slate-950 rounded border border-slate-800 whitespace-nowrap uppercase tracking-wider">Fixed Baseline</span>
            </div>
          ))}
          {normalSchedule.length === 0 && <p className="text-xs sm:text-sm text-slate-500 italic px-1 py-4 text-center">No baseline events scheduled today.</p>}
        </div>

        {/* Dynamic Shadow Layer - Renders explicitly on active state evaluation */}
        {showFutureSelf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-amber-950/20 backdrop-blur-[2px] p-3 sm:p-5 pointer-events-none z-20 border border-amber-500/20 rounded-xl flex flex-col justify-end space-y-3 sm:space-y-4"
          >
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-amber-500 text-black font-mono text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded shadow-lg animate-pulse uppercase max-w-[200px] sm:max-w-none text-center">
              Simulated Future Projection
            </div>

            {simulatedShadowSchedule.map((shadowEvent) => {
              const isEncroached = shadowEvent.status_change === 'encroached';
              return (
                <motion.div
                  key={`shadow-${shadowEvent.original_event_id}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`p-4 sm:p-5 rounded-xl border shadow-2xl transition-colors w-full ${
                    isEncroached 
                      ? 'bg-red-950/95 border-red-500/70 text-red-100' 
                      : 'bg-amber-950/95 border-amber-600/70 text-amber-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 sm:gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-bold tracking-tight line-clamp-2">{shadowEvent.title}</h4>
                      <p className="text-xs sm:text-sm opacity-90 mt-1.5">{shadowEvent.shadowTimeSlotString}</p>
                      <p className="text-[11px] sm:text-xs font-sans mt-3 opacity-100 italic font-medium bg-black/20 p-2 rounded">
                        ⚠️ {shadowEvent.impact_explanation}
                      </p>
                    </div>
                    <span className={`self-start sm:self-auto text-[10px] sm:text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded border whitespace-nowrap flex-shrink-0 ${
                      isEncroached ? 'bg-red-900 border-red-400 text-white' : 'bg-amber-900 border-amber-500 text-amber-50'
                    }`}>
                      {shadowEvent.status_change}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
