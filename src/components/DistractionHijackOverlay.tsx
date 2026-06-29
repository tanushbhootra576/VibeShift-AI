import React from 'react';
import { motion } from 'framer-motion';

interface HijackData {
  headline?: string;
  subheading?: string;
  cta_text?: string;
}

interface DistractionHijackOverlayProps {
  isActive: boolean;
  hijackData: HijackData;
  onAccept: () => void;
  onBypass: () => void;
}

export const DistractionHijackOverlay = ({ isActive, hijackData, onAccept, onBypass }: DistractionHijackOverlayProps) => {
  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-100"
    >
      {/* Structural Geometry Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl relative shadow-2xl text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Urgent State Icon Indicator */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 sm:mb-6 text-amber-500 font-mono text-xl animate-pulse flex-shrink-0">
          ⚡
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 break-words leading-tight">
          {hijackData.headline || "Hold on a second."}
        </h2>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
          {hijackData.subheading}
        </p>

        {/* High Friction vs Low Friction Action Routes */}
        <div className="space-y-3 sm:space-y-4">
          <button 
            onClick={onAccept}
            className="w-full py-3.5 px-4 min-h-[48px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold rounded-xl text-sm sm:text-base transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center"
          >
            {hijackData.cta_text || "Start 3-Minute Sprint"}
          </button>
          
          <button 
            onClick={onBypass}
            className="w-full py-3 px-4 min-h-[48px] bg-transparent hover:bg-slate-800/50 active:bg-slate-800 text-slate-500 hover:text-slate-400 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider transition-all flex items-center justify-center"
          >
            Ignore & Continue to Distraction
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
