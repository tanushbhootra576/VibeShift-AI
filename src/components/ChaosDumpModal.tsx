"use client";

import { useState, useRef } from "react";
import { X, Camera, Mic, Upload, CheckCircle2, Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types";

interface ChaosDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "vision" | "voice" | null;
}

export function ChaosDumpModal({ isOpen, onClose, type }: ChaosDumpModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [step, setStep] = useState<"capture" | "review">("capture");
  
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const addTask = useTaskStore((state) => state.addTask);
  const userId = useTaskStore((state) => state.userId);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const res = await fetch("/api/chaos-dump/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
        });
        const data = await res.json();
        if (data.tasks) {
          setExtractedTasks(data.tasks);
          setStep("review");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Basic Speech Recognition Mock for Voice
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      processVoice();
    } else {
      setIsRecording(true);
      setTranscript("I need to finish the client proposal by Thursday, call mom on Saturday, and submit the tax returns before Friday.");
    }
  };

  const processVoice = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/chaos-dump/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      if (data.tasks) {
        setExtractedTasks(data.tasks);
        setStep("review");
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    extractedTasks.forEach(t => {
      addTask({
        ...t,
        id: Date.now().toString() + Math.random(),
        userId: userId!,
        status: 'pending',
        actualMinutes: [],
        driftVelocity: 1.5,
        driftHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceType: type === 'vision' ? 'vision' : 'voice'
      } as unknown as Task);
    });
    setStep("capture");
    setExtractedTasks([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[var(--memphis-blue)]/40 backdrop-blur-md">
      <div 
        className="w-full max-w-lg memphis-card p-0 flex flex-col max-h-[95vh] md:max-h-[90vh] relative z-10 overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b-2 border-gray-100 bg-[var(--memphis-yellow)] relative shrink-0">
          <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>
          <h2 className="text-[18px] md:text-[22px] font-black uppercase tracking-tighter text-black relative z-10">
            {type === 'vision' ? '📷 Vision Chaos Dump' : '🎤 Voice Chaos Dump'}
          </h2>
          <button onClick={() => { onClose(); }} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white rounded-full border border-black shadow-sm hover:bg-[var(--memphis-pink)] hover:text-white hover:scale-110 transition-all relative z-10 text-black shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === "capture" ? (
            <div className="flex flex-col items-center gap-6">
              {type === 'vision' ? (
                <>
                  <div className="w-full aspect-video bg-[var(--memphis-teal)] rounded-3xl border-2 border-gray-100 relative flex flex-col items-center justify-center overflow-hidden text-white gap-4 p-4">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--memphis-yellow)] shape-blob opacity-50 mix-blend-multiply"></div>
                     <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--memphis-pink)] shape-blob opacity-50 mix-blend-multiply"></div>
                     <Camera className="w-12 h-12 md:w-16 md:h-16 text-white relative z-10 drop-shadow-md" />
                     <p className="font-display font-bold uppercase tracking-widest text-white relative z-10 text-center text-sm md:text-base">Take a photo of your mess</p>
                     <label className="memphis-btn bg-white text-black cursor-pointer mt-4 relative z-10 hover:bg-[var(--memphis-yellow)] hover:-translate-y-1 transition-transform min-h-[44px] flex items-center justify-center px-6">
                       {isProcessing ? "Processing..." : "Open Camera"}
                       <input 
                         type="file" 
                         accept="image/*" 
                         capture="environment" 
                         className="hidden" 
                         onChange={handleCapture}
                         disabled={isProcessing}
                       />
                     </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[var(--memphis-pink)] border-4 border-white shadow-md flex items-center justify-center mb-4 md:mb-6 cursor-pointer hover:scale-105 transition-transform" onClick={handleRecord}>
                    <Mic className={`w-10 h-10 md:w-12 md:h-12 ${isRecording ? 'text-[var(--memphis-yellow)] animate-pulse' : 'text-white'}`} />
                  </div>
                  <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-gray-100 p-4 font-mono text-[13px] md:text-[14px] leading-relaxed shadow-inner overflow-y-auto">
                    {transcript || "Tap mic to speak..."}
                  </div>
                  {transcript && !isRecording && (
                    <button onClick={processVoice} disabled={isProcessing} className="memphis-btn w-full py-4 text-base md:text-lg mt-4 min-h-[44px]">
                      {isProcessing ? "Processing..." : "Extract Tasks"}
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-mono text-[11px] md:text-[12px] font-bold uppercase text-[var(--memphis-pink)] mb-4">
                Found {extractedTasks.length} Tasks. Review before committing.
              </p>
              <div className="space-y-3">
                {extractedTasks.map((task, i) => (
                  <div key={i} className="p-3 md:p-4 rounded-2xl border border-gray-100 bg-white group flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="w-full">
                      <input 
                        value={task.title} 
                        onChange={(e) => {
                          const newTasks = [...extractedTasks];
                          newTasks[i].title = e.target.value;
                          setExtractedTasks(newTasks);
                        }}
                        className="font-display font-black text-[13px] md:text-[14px] w-full outline-none bg-transparent min-h-[44px]" 
                      />
                      <div className="flex gap-2 mt-2">
                         <span className="badge badge--info text-[10px] md:text-[12px]">{task.estimatedMinutes}m</span>
                         <span className="badge badge--warning text-[10px] md:text-[12px]">P{task.priority}</span>
                      </div>
                    </div>
                    <button onClick={() => setExtractedTasks(extractedTasks.filter((_, idx) => idx !== i))} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 bg-gray-50 md:bg-transparent rounded-full self-end md:self-auto">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleConfirm} className="memphis-btn w-full py-4 text-base md:text-lg mt-6 min-h-[44px]">
                Commit {extractedTasks.length} Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
