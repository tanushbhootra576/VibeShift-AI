"use client";

import { CheckCircle2, Circle, Clock, BrainCircuit, Calendar, Plus, AlertCircle, Sparkles, Loader2, Tag, ChevronDown, ChevronUp, Play, X, TerminalSquare, FileText, ArrowRight, ShieldAlert, Target, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { useTaskStore } from "@/store/taskStore";
import { useCreateTask } from "@/hooks/useTaskMutations";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";

export default function TasksPage() {
  const { user } = useAuth();
  const { toggleTimer, isActive, timeLeft, formatTime } = useTimer();
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [aiInsight, setAiInsight] = useState("I'm ready to analyze your tasks and sub-tasks to optimize your schedule.");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const globalTasks = useTaskStore(state => state.tasks);
  // Sort tasks: highest priority first (1 is critical, 3 is normal), then by deadline
  const tasks = [...globalTasks].sort((a, b) => a.priority - b.priority);
  
  const createTask = useCreateTask();

  // Workspace State Machine
  const [activeWorkspaceTask, setActiveWorkspaceTask] = useState<Task | null>(null);
  const [workspaceStage, setWorkspaceStage] = useState<"PENDING" | "PREPARING" | "ACTIVE" | "INTERVENTION">("PENDING");
  const [interventionAcknowledged, setInterventionAcknowledged] = useState(false);

  // Workspace Lifecycle Simulation
  useEffect(() => {
    if (activeWorkspaceTask && workspaceStage === "PREPARING") {
      const timer = setTimeout(() => {
        setWorkspaceStage("ACTIVE");
      }, 2500); // Simulate Gemini context retrieval
      return () => clearTimeout(timer);
    }
    
    if (activeWorkspaceTask && workspaceStage === "ACTIVE" && !interventionAcknowledged) {
      const interventionTimer = setTimeout(() => {
        setWorkspaceStage("INTERVENTION");
      }, 10000); // Trigger cognitive intervention after 10s for the Demo
      return () => clearTimeout(interventionTimer);
    }
  }, [activeWorkspaceTask, workspaceStage, interventionAcknowledged]);

  const openWorkspace = (task: Task) => {
    setActiveWorkspaceTask(task);
    setWorkspaceStage("PREPARING");
    setInterventionAcknowledged(false);
    if (!isActive) toggleTimer(); // Auto-start global timer
  };

  const closeWorkspace = () => {
    setActiveWorkspaceTask(null);
    setWorkspaceStage("PENDING");
    if (isActive) toggleTimer();
  };

  const addTask = async () => {
    if (!newTaskTitle || !user) return;
    await createTask({
      title: newTaskTitle,
      description: "Awaiting AI Analysis",
      deadline: new Date() as any, // temporary until calendar AI assigns one
      estimatedMinutes: 30,
      actualMinutes: [],
      priority: 3, // Default normal
      calendarEventId: null,
      calendarBlockIds: [],
      stakeholderEmail: null,
      aiRescheduledAt: null,
      aiRescheduleReason: null,
      tags: ["Inbox"],
      sourceType: "manual"
    });
    setNewTaskTitle("");
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic local update
    useTaskStore.getState().updateTask(task.id, { status: newStatus });
    // Firestore update
    await updateDoc(doc(db, "users", user.uid, "tasks", task.id), { status: newStatus });
  };

  const prioritizeTasks = async () => {
    // Calls the Gemini API internally via agent pipeline
    setIsPrioritizing(true);
    setAiInsight("Analyzing tasks, extrapolating sub-tasks, and generating new priorities...");
    // Mock simulation for hackathon demo
    setTimeout(() => {
      setAiInsight("Re-prioritized task load to minimize cognitive friction.");
      setIsPrioritizing(false);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const [isChaosDumping, setIsChaosDumping] = useState(false);

  const handleChaosDump = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsChaosDumping(true);
    setAiInsight("Analyzing multi-modal chaos dump. Extracting actionable tasks from image...");

    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const response = await fetch('/api/chaos-dump/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: base64String,
            mimeType: file.type
          })
        });

        if (response.ok) {
          const result = await response.json();
          // Create tasks from vision AI results
          for (const extracted of result.tasks) {
            await createTask({
              title: extracted.title,
              description: extracted.description || "Extracted via Chaos Dump",
              deadline: extracted.deadlineISO ? new Date(extracted.deadlineISO) as any : new Date() as any,
              estimatedMinutes: extracted.estimatedMinutes || 30,
              actualMinutes: [],
              priority: extracted.priority || 3,
              calendarEventId: null,
              calendarBlockIds: [],
              stakeholderEmail: null,
              aiRescheduledAt: null,
              aiRescheduleReason: null,
              tags: ["Chaos Dump"],
              sourceType: "vision"
            });
          }
          setAiInsight(`Chaos Organized. Detected ${result.tasks.length} actionable tasks.`);
        } else {
          setAiInsight("Failed to parse chaos dump.");
        }
        setIsChaosDumping(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsChaosDumping(false);
      setAiInsight("Error occurred during chaos dump.");
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return { label: 'Critical', class: 'badge--danger' };
    if (priority === 2) return { label: 'High', class: 'badge--warning' };
    return { label: 'Normal', class: 'badge--neutral' };
  };

  const formatDate = (deadline: any) => {
    if (!deadline) return 'No Date';
    // Handle Firestore Timestamp object or Date object or String
    let dateObj;
    if (deadline.seconds) {
      dateObj = new Date(deadline.seconds * 1000);
    } else if (deadline instanceof Date) {
      dateObj = deadline;
    } else if (typeof deadline === 'string') {
      dateObj = new Date(deadline);
    } else {
      return 'Soon';
    }
    return dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[var(--text-primary)] font-body relative">
      <header className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-[var(--border-subtle)] z-10 bg-transparent">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-[28px] font-display font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight"><BrainCircuit className="w-6 h-6 text-[var(--accent-primary)]" /> Goal & Task Engine</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-body">VibeShift proactively organizes and breaks down your commitments.</p>
        </motion.div>
        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={prioritizeTasks} disabled={isPrioritizing || isChaosDumping} className="btn-primary shadow-none disabled:opacity-50">
          {isPrioritizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isPrioritizing ? "Analyzing..." : "AI: Optimize Priorities"}
        </motion.button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
        
        {/* AI Insight Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--border-active)] flex items-start gap-4 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-none bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 border border-[var(--glass-border)]">
            {isPrioritizing || isChaosDumping ? <Loader2 className="w-5 h-5 text-[var(--accent-primary)] animate-spin" /> : <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />}
          </div>
          <div>
            <h3 className="text-[var(--text-accent)] font-bold text-[13px] mb-1">Agent Assessment</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-3xl font-mono ai-streaming">{aiInsight}</p>
          </div>
        </motion.div>

        {/* Add Task */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex gap-4">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task (e.g. Call client tomorrow morning)" 
            className="flex-1 px-5 py-4 rounded-none bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] text-[14px] font-medium focus:outline-none focus:border-[var(--border-active)] focus:shadow-none transition-all placeholder:text-[var(--text-tertiary)]"
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} className="btn-ghost text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] flex items-center gap-2 shadow-sm font-bold border-[var(--border-active)] bg-[var(--accent-primary-glow)] hover:border-[var(--border-active)]">
            <Plus className="w-5 h-5" /> Add
          </button>
          
          <label className="btn-ghost text-[var(--accent-live)] hover:bg-[var(--accent-live-glow)] flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap font-bold border-[rgba(6,182,212,0.4)] bg-[rgba(6,182,212,0.1)] hover:border-[rgba(6,182,212,0.6)]">
            <input type="file" className="hidden" onChange={handleChaosDump} accept="image/*" />
            <Camera className="w-5 h-5" /> Chaos Dump
          </label>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {tasks.length === 0 && <div className="text-center py-10 text-[var(--text-secondary)] font-medium">No active tasks.</div>}
          {tasks.map(task => {
            const priorityInfo = getPriorityBadge(task.priority);
            const isCompleted = task.status === 'completed';
            const isCriticalDDV = task.driftVelocity < -0.5;

            return (
            <motion.div layoutId={`task-${task.id}`} variants={itemVariants as any} key={task.id} className={`glass-card p-5 hover:border-[rgba(255,255,255,0.14)] transition-all flex flex-col gap-3 group ${isCompleted ? 'opacity-50 grayscale hover:grayscale-0' : 'shadow-sm relative overflow-hidden'}`}>
              
              {isCriticalDDV && !isCompleted && (
                 <div className="absolute top-0 right-0 bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-1 uppercase border-l border-b border-black">
                   Critical Drift: {task.driftVelocity}
                 </div>
              )}

              <div className="flex items-start gap-4 z-10 relative">
                <button onClick={() => toggleTask(task)} className="shrink-0 mt-0.5">
                  {isCompleted ? <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" /> : <Circle className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-[16px] font-bold transition-all font-body ${isCompleted ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>{task.title}</h4>
                    <div className="flex items-center gap-2">
                       {!isCompleted && (
                         <button onClick={() => openWorkspace(task)} className="px-3 py-1.5 rounded-none bg-[var(--accent-primary-glow)] text-[var(--text-accent)] text-[12px] font-bold flex items-center gap-1.5 hover:bg-[var(--accent-primary)] hover:text-white transition-colors border border-[var(--border-active)]">
                           <Play className="w-3.5 h-3.5" /> Execute
                         </button>
                       )}
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-3 mt-2">
                    <span className={`badge ${priorityInfo.class}`}>
                      <AlertCircle className="w-3 h-3" /> {priorityInfo.label}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(task.deadline)}</span>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1"><Clock className="w-3 h-3" /> {task.estimatedMinutes}m</span>
                    
                    {task.tags?.map((tag, idx) => (
                      <span key={idx} className="badge badge--info font-bold uppercase tracking-wider">
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:flex w-[280px] bg-[var(--bg-elevated)] p-3 rounded-none border border-[var(--glass-border)] items-start gap-2 shadow-inner">
                  <BrainCircuit className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono italic leading-relaxed">{task.description}</p>
                </div>
              </div>

            </motion.div>
          )})}
        </motion.div>
      </div>

      {/* DYNAMIC WORKSPACE OVERLAY / CDR */}
      <AnimatePresence>
        {activeWorkspaceTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop- flex items-center justify-center p-8"
          >
            <motion.div 
              layoutId={`task-${activeWorkspaceTask.id}`}
              className="bg-[var(--bg-surface)] w-full max-w-6xl h-full max-h-[85vh] rounded-none shadow-none overflow-hidden flex flex-col border border-[var(--border-active)]"
            >
              {/* Workspace Header */}
              <div className="px-8 py-6 bg-transparent border-b border-[var(--glass-border)] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-none bg-[var(--accent-primary-glow)] border border-[var(--border-active)] flex items-center justify-center shadow-none">
                     <BrainCircuit className="w-6 h-6 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-display font-bold text-[var(--text-primary)]">{activeWorkspaceTask.title}</h2>
                    <p className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                       <span className="w-2 h-2 rounded-none bg-[var(--color-success)] animate-pulse"></span>
                       Workspace Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-[var(--text-tertiary)]">Focus Timer</span>
                    <span className="text-[24px] font-mono font-bold text-[var(--text-accent)] tracking-tighter">{formatTime(timeLeft)}</span>
                  </div>
                  <button onClick={closeWorkspace} className="p-3 rounded-none bg-[var(--bg-elevated)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[var(--text-secondary)] border border-[var(--glass-border)]">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
                <AnimatePresence mode="wait">
                  {/* STAGE 1: PREPARING */}
                  {workspaceStage === "PREPARING" && (
                    <motion.div key="preparing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full flex flex-col items-center justify-center">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-[var(--accent-primary)] animate-spin" />
                        <Sparkles className="w-6 h-6 text-[var(--accent-live)] absolute -top-2 -right-2 animate-pulse" />
                      </div>
                      <h3 className="text-[24px] font-display font-bold text-[var(--text-primary)] mt-8 mb-2">Assembling Workspace</h3>
                      <p className="text-[var(--text-secondary)] font-mono text-[13px] max-w-md text-center ai-streaming">Gemini is retrieving calendar context, generating implementation scaffolds, and analyzing related documentation...</p>
                    </motion.div>
                  )}

                  {/* STAGE 2: ACTIVE */}
                  {(workspaceStage === "ACTIVE" || workspaceStage === "INTERVENTION") && (
                    <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-12 gap-6 h-full">
                      
                      {/* Left Column: Execution Plan */}
                      <div className="col-span-4 flex flex-col gap-6 h-full">
                         <div className="glass-card flex-1 p-6">
                           <h4 className="card-eyebrow mb-6">
                             <Target className="w-4 h-4 text-[var(--accent-primary)]" /> Execution Plan
                           </h4>
                           <div className="space-y-4">
                               <div className="flex gap-4 items-start group">
                                 <div className="w-6 h-6 rounded-none bg-[var(--bg-elevated)] border border-[var(--glass-border)] flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono text-[var(--text-secondary)]">1</div>
                                 <div>
                                   <p className="text-[13px] font-medium font-body text-[var(--text-primary)]">Execute Task Segment</p>
                                   <p className="text-[11px] font-mono text-[var(--text-tertiary)] mt-1">Est: {activeWorkspaceTask.estimatedMinutes} mins</p>
                                 </div>
                               </div>
                           </div>
                         </div>
                      </div>

                      {/* Right Column: Code & Docs */}
                      <div className="col-span-8 flex flex-col gap-6 h-full">
                        <div className="glass-card flex-1 p-6 flex flex-col bg-[var(--bg-elevated)]">
                          <div className="flex items-center justify-between mb-4 border-b border-[var(--glass-border)] pb-4">
                            <h4 className="card-eyebrow mb-0">
                              <TerminalSquare className="w-4 h-4 text-[var(--color-success)]" /> Terminal & Scaffold
                            </h4>
                            <div className="flex gap-2">
                              <span className="w-3 h-3 rounded-none bg-[var(--color-danger)]"></span>
                              <span className="w-3 h-3 rounded-none bg-[var(--color-warning)]"></span>
                              <span className="w-3 h-3 rounded-none bg-[var(--color-success)]"></span>
                            </div>
                          </div>
                          <div className="font-mono text-[13px] space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 text-[var(--text-secondary)]">
                            <p className="text-[var(--text-tertiary)]"># Auto-generated workspace setup</p>
                            <p><span className="text-[var(--accent-live)]">npm</span> install @google/calendar-api</p>
                            <p className="mt-4 text-[var(--text-tertiary)]"># Suggested implementation scaffold</p>
                            <pre className="text-[var(--text-primary)] bg-[#080810] p-4 rounded-none text-[12px] overflow-x-auto leading-relaxed border border-[var(--glass-border)]">
{`import { google } from 'googleapis';

export async function fetchContext() {
  const auth = new google.auth.OAuth2();
  // TODO: Add token
  const calendar = google.calendar({version: 'v3', auth});
  return calendar.events.list({});
}`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="glass-card h-48 flex flex-col shrink-0 p-6">
                           <h4 className="card-eyebrow mb-4">
                             <FileText className="w-4 h-4 text-[var(--color-info)]" /> Gathered Context
                           </h4>
                           <div className="flex gap-4">
                              <a href="#" className="flex-1 p-4 rounded-none bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.2)] transition-colors group">
                                <p className="text-[13px] font-bold text-[var(--text-primary)] flex items-center justify-between">Google Calendar Auth Docs <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" /></p>
                                <p className="text-[12px] text-[var(--color-info)] mt-1 font-mono">Official API Reference</p>
                              </a>
                              <a href="#" className="flex-1 p-4 rounded-none bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] hover:bg-[rgba(99,102,241,0.2)] transition-colors group">
                                <p className="text-[13px] font-bold text-[var(--text-primary)] flex items-center justify-between">Past Project Notes <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" /></p>
                                <p className="text-[12px] text-[var(--accent-primary)] mt-1 font-mono">Vibe2Ship Architecture</p>
                              </a>
                           </div>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* STAGE 3: COGNITIVE INTERVENTION TAKEOVER */}
                <AnimatePresence>
                  {workspaceStage === "INTERVENTION" && (
                     <motion.div 
                       initial={{ opacity: 0, y: 50 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="absolute inset-0 bg-[var(--bg-overlay)] backdrop- z-20 flex items-center justify-center p-12 text-center"
                     >
                        <div className="max-w-2xl bg-[var(--bg-surface)] p-10 rounded-none border border-[var(--border-active)] shadow-none">
                          <div className="w-20 h-20 rounded-none bg-[rgba(239,68,68,0.15)] border border-[var(--color-danger)] flex items-center justify-center mx-auto mb-8 relative">
                            <ShieldAlert className="w-10 h-10 text-[var(--color-danger)]" />
                            <span className="absolute -top-2 -right-2 flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[var(--color-danger)] opacity-75"></span>
                              <span className="relative inline-flex rounded-none h-6 w-6 bg-[var(--color-danger)] text-[10px] font-black text-white items-center justify-center">!</span>
                            </span>
                          </div>
                          
                          <h2 className="text-[32px] font-display font-bold text-[var(--text-primary)] tracking-tight mb-4">Cognitive Friction Detected</h2>
                          
                          <p className="text-[14px] text-[var(--text-secondary)] font-body leading-relaxed mb-8">
                            You've spent significant time inactive while schedule pressure increases. I've paused notifications and condensed your workspace into a <span className="text-[var(--color-danger)] font-bold">Single Objective Mode</span>. 
                          </p>

                          <div className="bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-none p-6 text-left mb-8">
                            <h4 className="card-eyebrow mb-4 text-[var(--color-danger)]">Immediate Next Action</h4>
                            <p className="text-[18px] font-bold text-[var(--text-primary)]">Execute your first segment for <code className="text-[var(--text-primary)] font-mono text-[14px] bg-[#080810] px-2 py-1 rounded-none border border-[var(--glass-border)]">{activeWorkspaceTask.title}</code>.</p>
                          </div>

                          <button 
                            onClick={() => {
                              setInterventionAcknowledged(true);
                              setWorkspaceStage("ACTIVE");
                            }}
                            className="btn-primary w-full py-4 justify-center text-[16px]"
                          >
                            De-escalate & Resume Focus
                          </button>
                        </div>
                     </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
