"use client";

import { CheckCircle2, Circle, Clock, BrainCircuit, Calendar, Plus, AlertCircle, Sparkles, Loader2, Tag, ChevronDown, ChevronUp, Play, X, TerminalSquare, FileText, ArrowRight, ShieldAlert, Target, Camera, Trash2, ListTodo, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { useTaskStore } from "@/store/taskStore";
import { useCreateTask } from "@/hooks/useTaskMutations";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch, deleteDoc, addDoc, collection, getDoc, setDoc, arrayUnion } from "firebase/firestore";

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
  const tasks = [...globalTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return a.priority - b.priority;
  });
  
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
    
    let estimatedMinutes = 30;
    let parsedTitle = newTaskTitle;
    
    // Extract duration like '45m', '2h', '15 min'
    const durationMatch = newTaskTitle.match(/(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours)\b/i);
    if (durationMatch) {
      const val = parseInt(durationMatch[1], 10);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        estimatedMinutes = val * 60;
      } else {
        estimatedMinutes = val;
      }
      // Strip duration from title
      parsedTitle = parsedTitle.replace(durationMatch[0], '').trim();
    }

    await createTask({
      title: parsedTitle || newTaskTitle,
      description: "Awaiting AI Analysis",
      deadline: new Date() as any, // temporary until calendar AI assigns one
      estimatedMinutes: estimatedMinutes,
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

    if (newStatus === 'completed') {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      
      // Log Session
      await addDoc(collection(db, "users", user.uid, "sessions"), {
        date: dateStr,
        time: timeStr,
        duration: `${task.estimatedMinutes}m`,
        score: Math.floor(Math.random() * 20) + 80, // 80-100 score
        type: "Task Execution",
        task: task.title,
        status: "Completed",
        timestamp: now.getTime()
      });

      // Update Analytics
      const analyticsRef = doc(db, "users", user.uid, "analytics", "overview");
      const docSnap = await getDoc(analyticsRef);
      const newLoad = Math.floor(Math.random() * 30) + 60; // 60-90%
      if (docSnap.exists()) {
        let current = docSnap.data().cognitiveLoad || [0,0,0,0,0,0,0,0,0,0];
        if (JSON.stringify(current) === JSON.stringify([40, 60, 45, 80, 50, 70, 90, 85, 60, 40])) {
           current = [0,0,0,0,0,0,0,0,0,0];
        }
        const updated = [...current.slice(1), newLoad];
        await updateDoc(analyticsRef, { cognitiveLoad: updated });
      } else {
        await setDoc(analyticsRef, { cognitiveLoad: [0,0,0,0,0,0,0,0,0,newLoad] });
      }
      
      // Update Telemetry
      const telRef = doc(db, "users", user.uid, "telemetry", "live");
      await setDoc(telRef, {
         logs: arrayUnion(`Task Completed: ${task.title}`),
      }, { merge: true });
    }
  };

  const prioritizeTasks = async () => {
    if (!user) return;
    setIsPrioritizing(true);
    setAiInsight("Analyzing tasks, extrapolating sub-tasks, and generating new priorities...");
    
    try {
      const pendingTasks = tasks.filter(t => t.status !== 'completed');
      if (pendingTasks.length === 0) {
        setAiInsight("No pending tasks to analyze.");
        setIsPrioritizing(false);
        return;
      }
      
      const res = await fetch('/api/tasks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, tasks: pendingTasks })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsight(`Re-prioritized task load to minimize cognitive friction. Updated ${data.updatedCount} tasks.`);
      } else {
        setAiInsight("AI Analysis failed: " + data.error);
      }
    } catch (e) {
      setAiInsight("Error calling AI.");
    } finally {
      setIsPrioritizing(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    useTaskStore.getState().removeTask(taskId);
    await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
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
          const errData = await response.json().catch(()=>({}));
          setAiInsight(`Error: ${errData.error || "Failed to parse chaos dump."}`);
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
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-black font-body relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none z-0" />
      
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 border-b-4 border-black z-10 bg-[var(--memphis-mint)] relative gap-4 md:gap-0">
        <div className="absolute inset-0 pattern-stripes opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-[24px] md:text-[28px] font-display font-black text-black flex items-center gap-3 tracking-tight uppercase">
            <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-black" /> Goal & Task Engine
          </h2>
          <p className="text-[12px] md:text-[14px] text-black font-mono font-bold tracking-widest mt-1 uppercase">
            VibeShift proactively organizes and breaks down your commitments.
          </p>
        </div>
        <button onClick={prioritizeTasks} disabled={isPrioritizing || isChaosDumping} className="memphis-btn relative z-10 w-full md:w-auto py-3 md:py-4 justify-center">
          {isPrioritizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isPrioritizing ? "Analyzing..." : "AI: Optimize Priorities"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-20">
        
        {/* AI Insight Header */}
        <div className="memphis-card memphis-card--yellow mb-6 md:mb-8 p-4 md:p-6 flex flex-col md:flex-row items-start gap-4 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {isPrioritizing || isChaosDumping ? <Loader2 className="w-6 h-6 text-[var(--memphis-pink)] animate-spin" /> : <Sparkles className="w-6 h-6 text-[var(--memphis-pink)]" />}
          </div>
          <div>
            <h3 className="text-black font-black text-[14px] uppercase tracking-widest mb-1">Agent Assessment</h3>
            <p className="text-[14px] md:text-[15px] font-black text-black leading-relaxed max-w-3xl font-mono ai-streaming">{aiInsight}</p>
          </div>
        </div>

        {/* Add Task */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..." 
            className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-none bg-white border-4 border-black text-black text-[15px] font-black focus:outline-none focus:ring-4 focus:ring-[var(--memphis-pink)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} className="memphis-btn flex justify-center gap-2 px-8 py-3 md:py-4 w-full md:w-auto">
            <Plus className="w-5 h-5" /> Add Task
          </button>
          
          <label className="memphis-btn memphis-btn--pink flex justify-center gap-2 px-8 py-3 md:py-4 cursor-pointer whitespace-nowrap w-full md:w-auto">
            <input type="file" className="hidden" onChange={handleChaosDump} accept="image/*" />
            <Camera className="w-5 h-5" /> Chaos Dump
          </label>
        </div>

        {/* Personalized Productivity Recommendation */}
        <div className="mb-6 md:mb-8">
          <div className="memphis-card memphis-card--mint p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start gap-4 text-black w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--memphis-yellow)] border-4 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl md:rounded-2xl">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[var(--memphis-pink)]" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] bg-black text-white px-2 py-0.5 rounded">Personalized Recommendation</span>
                </div>
                <h3 className="text-[18px] md:text-[20px] font-display font-black uppercase leading-tight mb-2 tracking-tight">Optimal time for "Respond to Client Emails"</h3>
                <p className="text-[13px] md:text-[14px] font-mono font-bold max-w-2xl leading-relaxed">
                  It's 2:00 PM. Based on your biometric data from yesterday, your execution velocity drops slightly post-lunch. I recommend clearing this quick win now before starting your next deep focus block.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
               <button className="memphis-btn px-6 py-3 md:py-4 flex-1 md:flex-none justify-center text-[13px]">Start Task</button>
               <button className="bg-white text-black rounded-full font-black font-display text-[13px] uppercase tracking-widest px-6 py-3 md:py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex-1 md:flex-none" onClick={(e) => (e.currentTarget.parentElement?.parentElement?.parentElement as HTMLElement).style.display = 'none'}>Dismiss</button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {tasks.length === 0 && <div className="text-center py-10 font-black font-display text-xl md:text-2xl uppercase border-4 border-dashed border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">No active tasks. Add one above!</div>}
          {tasks.map(task => {
            const priorityInfo = getPriorityBadge(task.priority);
            const isCompleted = task.status === 'completed';
            const isCriticalDDV = task.driftVelocity && task.driftVelocity < -0.5;
            
            const cardStyle = task.priority === 1 ? 'memphis-card--red' : task.priority === 2 ? 'memphis-card--yellow' : 'memphis-card--blue';

            return (
            <div key={task.id} className={`memphis-card ${cardStyle} p-4 md:p-6 flex flex-col gap-4 group ${isCompleted ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}>
              
              {isCriticalDDV && !isCompleted && (
                 <div className="absolute top-0 right-0 bg-[var(--memphis-red)] text-white text-[10px] md:text-[12px] font-black px-3 py-1.5 md:px-4 md:py-2 uppercase border-l-4 border-b-4 border-black z-20">
                   Critical Drift: {task.driftVelocity}
                 </div>
              )}

              <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 z-10 relative w-full">
                <div className="flex items-center gap-3 w-full md:w-auto md:mt-1">
                  <button onClick={() => toggleTask(task)} className="shrink-0 bg-white rounded-full border-4 border-black w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-[var(--memphis-mint)] transition-colors">
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-black" />}
                  </button>
                  <h4 className={`text-[18px] md:text-[20px] font-black font-display uppercase tracking-tight transition-all md:hidden ${isCompleted ? 'text-gray-500 line-through' : 'text-black'}`}>{task.title}</h4>
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
                    <h4 className={`hidden md:block text-[20px] font-black font-display uppercase tracking-tight transition-all ${isCompleted ? 'text-gray-500 line-through' : 'text-black'}`}>{task.title}</h4>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                       {!isCompleted && (
                         <button onClick={() => openWorkspace(task)} className="flex-1 lg:flex-none px-4 py-3 lg:py-2 rounded-full bg-[var(--memphis-yellow)] text-black text-[13px] font-black uppercase flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                           <Play className="w-4 h-4" /> Execute
                         </button>
                       )}
                       <button onClick={() => deleteTask(task.id)} className="w-12 h-12 lg:w-10 lg:h-10 flex shrink-0 items-center justify-center bg-white text-black border-2 border-black rounded-xl hover:bg-[var(--memphis-red)] hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors">
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2 md:gap-3 mt-4">
                    <span className={`badge ${priorityInfo.class}`}>
                      <AlertCircle className="w-4 h-4" /> {priorityInfo.label}
                    </span>
                    <span className="badge badge--neutral bg-white font-mono"><Calendar className="w-4 h-4" /> {formatDate(task.deadline)}</span>
                    <span className="badge badge--neutral bg-white font-mono"><Clock className="w-4 h-4" /> {task.estimatedMinutes}m</span>
                    
                    {task.tags?.map((tag, idx) => (
                      <span key={idx} className="badge badge--info font-bold uppercase tracking-wider">
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden xl:flex w-[300px] bg-white p-4 rounded-2xl border-4 border-black items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 pattern-grid w-full h-full opacity-10 pointer-events-none" />
                  <BrainCircuit className="w-5 h-5 text-[var(--memphis-pink)] shrink-0 mt-0.5 relative z-10" />
                  <p className="text-[12px] text-black font-mono font-bold leading-relaxed relative z-10">{task.description}</p>
                </div>
              </div>

            </div>
          )})}
        </div>
      </div>

      {/* DYNAMIC WORKSPACE OVERLAY / CDR */}
      {activeWorkspaceTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-8">
          <div className="bg-white w-full max-w-6xl h-full max-h-[95vh] md:max-h-[90vh] rounded-2xl md:rounded-3xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
            {/* Workspace Header */}
            <div className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 bg-[var(--memphis-yellow)] border-b-4 border-black flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 relative overflow-hidden gap-4 md:gap-0">
              <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>
              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                   <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-[var(--memphis-pink)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[20px] md:text-[28px] font-display font-black text-black tracking-tight uppercase truncate">{activeWorkspaceTask.title}</h2>
                  <p className="text-[10px] md:text-[12px] font-black text-black flex items-center gap-2 uppercase tracking-widest mt-1 bg-white px-2 md:px-3 py-0.5 md:py-1 border-2 border-black inline-flex rounded-full">
                     <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--memphis-mint)] border border-black animate-pulse"></span>
                     Workspace Active
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 relative z-10">
                <div className="flex flex-col items-end bg-white px-3 py-1.5 md:px-4 md:py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl md:rounded-2xl flex-1 md:flex-none">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-[var(--memphis-pink)]">Focus Timer</span>
                  <span className="text-[24px] md:text-[32px] font-mono font-black text-black tracking-tighter leading-none mt-1">{formatTime(timeLeft)}</span>
                </div>
                <button onClick={closeWorkspace} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[var(--memphis-red)] text-white border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
            </div>

            {/* Workspace Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative bg-[var(--bg-base)]">
              <div className="absolute inset-0 pattern-stripes opacity-5 pointer-events-none" />
              
              {/* STAGE 1: PREPARING */}
              {workspaceStage === "PREPARING" && (
                <div key="preparing" className="h-full flex flex-col items-center justify-center relative z-10 px-4 text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[8px_8px_0px_0px_var(--memphis-pink)] mb-6 md:mb-8">
                    <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-[var(--memphis-teal)] animate-spin" />
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[var(--memphis-yellow)] absolute -top-2 -right-2 md:-top-4 md:-right-4 animate-pulse" />
                  </div>
                  <h3 className="text-[28px] md:text-[42px] font-display font-black text-black mb-4 uppercase tracking-tighter">Assembling Workspace</h3>
                  <p className="text-black font-mono font-bold text-[14px] md:text-[18px] max-w-2xl text-center bg-white p-4 md:p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ai-streaming">
                    Gemini is retrieving calendar context, generating implementation scaffolds, and analyzing related documentation...
                  </p>
                </div>
              )}

              {/* STAGE 2: ACTIVE */}
              {(workspaceStage === "ACTIVE" || workspaceStage === "INTERVENTION") && (
                <div key="active" className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full relative z-10">
                  
                  {/* Left Column: Execution Plan */}
                  <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                     <div className="memphis-card memphis-card--blue flex-1 p-4 md:p-6 flex flex-col">
                       <h4 className="card-eyebrow mb-4 md:mb-6 border-b-4 border-black pb-4 text-lg md:text-xl">
                         <Target className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-pink)]" /> Execution Plan
                       </h4>
                       <div className="space-y-4">
                           <div className="flex gap-3 md:gap-4 items-start bg-white p-3 md:p-4 border-4 border-black rounded-xl md:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--memphis-yellow)] border-4 border-black flex items-center justify-center shrink-0 text-[16px] md:text-[18px] font-black text-black">1</div>
                             <div>
                               <p className="text-[15px] md:text-[18px] font-black font-display text-black uppercase leading-tight">Execute Task Segment</p>
                               <p className="text-[11px] md:text-[13px] font-mono text-[var(--memphis-pink)] mt-2 uppercase tracking-widest font-black bg-black text-white px-2 py-1 inline-block">Est: {activeWorkspaceTask.estimatedMinutes} mins</p>
                             </div>
                           </div>
                       </div>
                     </div>
                  </div>

                  {/* Right Column: Code & Docs */}
                  <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    <div className="memphis-card memphis-card--mint flex-1 p-0 flex flex-col overflow-hidden min-h-[300px]">
                      <div className="flex items-center justify-between p-4 md:p-6 border-b-4 border-black bg-white">
                        <h4 className="card-eyebrow mb-0 text-lg md:text-xl truncate mr-2">
                          <ListTodo className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-mint)]" /> Task Breakdown & Scratchpad
                        </h4>
                        <div className="flex gap-1.5 md:gap-2 shrink-0">
                          <span className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-[var(--memphis-red)] border-2 border-black shadow-sm"></span>
                          <span className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-[var(--memphis-yellow)] border-2 border-black shadow-sm"></span>
                          <span className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-[var(--memphis-mint)] border-2 border-black shadow-sm"></span>
                        </div>
                      </div>
                      <div className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-black bg-[#FDFBF7]">
                        <h5 className="font-black uppercase tracking-widest text-[12px] md:text-sm text-gray-500 mb-2 mt-2">AI Generated Sub-Tasks</h5>
                        <ul className="space-y-2 mb-6">
{(() => {
  const t = activeWorkspaceTask.title.toLowerCase();
  let subs = [];
  if (t.includes("mail") || t.includes("email") || t.includes("inbox")) {
    subs = ["Review recent correspondence", "Draft response", "Proofread tone and clarity", "Send and archive"];
  } else if (t.includes("design") || t.includes("ui") || t.includes("deck") || t.includes("figma")) {
    subs = ["Gather inspiration and assets", "Create layout draft", "Refine typography and colors", "Export final assets"];
  } else if (t.includes("model") || t.includes("financial") || t.includes("sheet")) {
    subs = ["Import raw data", "Format cells and tables", "Apply formulas and logic", "Review final numbers"];
  } else {
    subs = ["Initial preparation", "Execute core objective", "Review work", "Mark as complete"];
  }
  return subs.map((sub, i) => (
    <li key={i} className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <CheckCircle2 className="w-5 h-5 text-[var(--memphis-mint)] shrink-0" />
      <span className="font-bold text-[14px] md:text-[16px] uppercase tracking-tight leading-tight">{sub}</span>
    </li>
  ));
})()}
                        </ul>
                        
                        <h5 className="font-black uppercase tracking-widest text-[12px] md:text-sm text-gray-500 mb-2 mt-6 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Scratchpad</h5>
                        <textarea 
                           className="w-full h-32 md:h-48 p-4 bg-white border-4 border-black rounded-xl md:rounded-2xl shadow-[4px_4px_0px_0px_var(--memphis-blue)] resize-none font-mono text-[14px] md:text-[16px] focus:outline-none focus:ring-4 focus:ring-[var(--memphis-pink)]"
                           placeholder="Jot down your notes, thoughts, or drafts here..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="memphis-card memphis-card--yellow shrink-0 p-4 md:p-6 flex flex-col">
                       <h4 className="card-eyebrow mb-4 border-b-4 border-black pb-2 text-lg md:text-xl">
                         <FileText className="w-5 h-5 md:w-6 md:h-6 text-[var(--memphis-blue)]" /> Gathered Context
                       </h4>
                       <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                          {(() => {
                            const t = activeWorkspaceTask.title.toLowerCase();
                            let links = [];
                            if (t.includes("mail") || t.includes("email") || t.includes("inbox")) {
                              links = [{ title: "Email Templates", badge: "Knowledge Base", color: "var(--memphis-mint)" }, { title: "Client Contacts", badge: "CRM Sync", color: "var(--memphis-pink)" }];
                            } else if (t.includes("design") || t.includes("ui") || t.includes("deck") || t.includes("figma")) {
                              links = [{ title: "Component Library", badge: "Design System", color: "var(--memphis-mint)" }, { title: "Brand Guidelines", badge: "PDF", color: "var(--memphis-pink)" }];
                            } else if (t.includes("model") || t.includes("financial") || t.includes("sheet")) {
                              links = [{ title: "Q1 Financials", badge: "Spreadsheet", color: "var(--memphis-mint)" }, { title: "Revenue Projections", badge: "Model", color: "var(--memphis-pink)" }];
                            } else {
                              links = [{ title: "Past Project Notes", badge: "Architecture", color: "var(--memphis-mint)" }, { title: "Official API Ref", badge: "Documentation", color: "var(--memphis-pink)" }];
                            }
                            return links.map((link, i) => (
                              <a key={i} href="#" className="flex-1 p-4 md:p-5 rounded-xl md:rounded-2xl bg-white border-4 border-black transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center hover:bg-black hover:text-white">
                                <p className="text-[14px] md:text-[16px] font-black flex items-center justify-between uppercase">{link.title} <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" /></p>
                                <p className="text-[10px] md:text-[12px] bg-black group-hover:bg-white group-hover:text-black text-white px-2 py-1 mt-2 md:mt-3 font-mono font-bold tracking-widest uppercase inline-block w-max border-2 border-transparent">{link.badge}</p>
                              </a>
                            ));
                          })()}
                       </div>
                    </div>
                  </div>

                </div>
              )}

              {/* STAGE 3: COGNITIVE INTERVENTION TAKEOVER */}
              {workspaceStage === "INTERVENTION" && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-12 text-center">
                    <div className="w-full max-w-3xl bg-white p-6 md:p-12 rounded-2xl md:rounded-3xl border-4 md:border-8 border-[var(--memphis-red)] shadow-[8px_8px_0px_0px_var(--memphis-red)] md:shadow-[16px_16px_0px_0px_var(--memphis-red)] relative overflow-hidden">
                      <div className="absolute inset-0 pattern-squiggles opacity-20 pointer-events-none text-[var(--memphis-red)]"></div>
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--memphis-red)] flex items-center justify-center mx-auto mb-6 md:mb-8 relative border-4 md:border-8 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10">
                        <ShieldAlert className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        <span className="absolute -top-2 -right-2 md:-top-4 md:-right-4 flex h-8 w-8 md:h-12 md:w-12">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--memphis-yellow)] opacity-100"></span>
                          <span className="relative inline-flex rounded-full h-8 w-8 md:h-12 md:w-12 bg-[var(--memphis-yellow)] text-[16px] md:text-[24px] font-black text-black items-center justify-center border-2 md:border-4 border-black">!</span>
                        </span>
                      </div>
                      
                      <h2 className="text-[28px] md:text-[48px] font-display font-black text-black tracking-tight mb-4 md:mb-6 uppercase leading-none relative z-10">Cognitive Friction Detected</h2>
                      
                      <p className="text-[14px] md:text-[18px] text-black font-bold leading-relaxed mb-8 md:mb-10 relative z-10 max-w-xl mx-auto">
                        You've spent significant time inactive while schedule pressure increases. I've paused notifications and condensed your workspace into a <span className="bg-[var(--memphis-red)] text-white px-2 py-0.5 md:px-3 md:py-1 border-2 border-black font-black tracking-widest uppercase text-[12px] md:text-[14px]">Single Objective Mode</span>. 
                      </p>

                      <div className="bg-[var(--memphis-yellow)] border-4 border-black rounded-2xl md:rounded-3xl p-6 md:p-8 text-left mb-8 md:mb-10 relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                        <h4 className="font-black text-black mb-3 md:mb-4 uppercase tracking-widest text-[14px] md:text-[16px] bg-white border-2 border-black inline-block px-3 py-1 md:px-4 md:py-1">Immediate Next Action</h4>
                        <p className="text-[18px] md:text-[24px] font-black text-black leading-tight uppercase mt-2">Execute segment for <span className="text-[var(--memphis-pink)] bg-white px-2 py-1 md:px-3 md:py-1 border-2 md:border-4 border-black mt-2 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-words">{activeWorkspaceTask.title}</span>.</p>
                      </div>

                      <button 
                        onClick={() => {
                          setInterventionAcknowledged(true);
                          setWorkspaceStage("ACTIVE");
                        }}
                        className="memphis-btn w-full py-4 md:py-6 justify-center text-[16px] md:text-[20px] relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] whitespace-normal"
                      >
                        De-escalate & Resume Focus
                      </button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
