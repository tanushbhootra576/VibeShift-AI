import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DistractionHijackOverlay } from './DistractionHijackOverlay';

export const EscalatorDemoWidget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [showHijack, setShowHijack] = useState(false);
  const [hijackData, setHijackData] = useState<any>({});
  
  // For demo, we use a fixed mock task ID
  const mockTaskId = "demo-task-id-123";

  const triggerEscalation = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setDemoResult(null);

    try {
      const res = await fetch('/api/v1/escalator/eval-and-fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          taskId: mockTaskId,
          // phoneOverride: '+1234567890' // Could add an input field for phone
        })
      });
      const data = await res.json();
      setDemoResult(data);

      if (data.action?.type === 'HIJACK') {
        setHijackData(data.action.data);
        setShowHijack(true);
      }
    } catch (e: any) {
      setDemoResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="memphis-card flex flex-col h-full w-full p-4 sm:p-5">
      <div className="card-eyebrow flex flex-wrap gap-2 items-center justify-between mb-4">
        <span className="text-sm font-bold flex-1 min-w-[200px]">⚠️ Escalator Protocol Demo</span>
        <span className="badge badge--neutral text-[10px] whitespace-nowrap">HACKATHON</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 rounded-xl text-center w-full">
        <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">
          Triggers the Multi-Modal Accountability framework. Click multiple times to progress from Level 1 (Nudge) to Level 3 (Live Phone Call).
        </p>

        <button 
          onClick={triggerEscalation} 
          disabled={loading}
          className="w-full py-3.5 px-4 min-h-[48px] bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? 'Evaluating...' : 'Simulate Task Ignored'}
        </button>

        {demoResult && (
          <div className="mt-6 w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-lg overflow-hidden break-words">
            <h4 className="text-[10px] sm:text-[11px] font-mono text-cyan-500 mb-2 uppercase tracking-widest">Engine Response:</h4>
            <div className="text-[11px] sm:text-xs font-mono text-slate-300 space-y-1.5">
              <p><span className="text-slate-500">Prev Level:</span> {demoResult.previousLevel}</p>
              <p><span className="text-slate-500">New Level:</span> {demoResult.newLevel}</p>
              <p className="mt-2 text-amber-500"><span className="text-slate-500">Action:</span> {demoResult.action?.type}</p>
              {demoResult.action?.type === 'VOICE_CALL' && (
                <p className="text-green-400 mt-2 p-2 bg-green-950/30 rounded border border-green-900/50 inline-block font-bold">
                  📞 Live Twilio Call Dispatched!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <DistractionHijackOverlay 
        isActive={showHijack} 
        hijackData={hijackData} 
        onAccept={() => setShowHijack(false)} 
        onBypass={() => setShowHijack(false)} 
      />
    </div>
  );
};
