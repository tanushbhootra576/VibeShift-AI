"use client";

import { Target, Flame, Calendar, Award, Mail, Sparkles, Plus, CheckCircle2, Circle, BrainCircuit, Activity, Settings, Send, CreditCard, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function HabitsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [goalType, setGoalType] = useState<"weekly" | "monthly">("weekly");
  const [mailReminders, setMailReminders] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/goals?userId=${user.uid}`);
      const data = await res.json();
      if (data.success) {
        setGoals(data.goals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const toggleAutomation = async (goalId: string, auto: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newAutos = goal.automations.includes(auto) 
      ? goal.automations.filter((a: string) => a !== auto)
      : [...goal.automations, auto];

    setGoals(goals.map(g => g.id === goalId ? { ...g, automations: newAutos } : g));

    await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ userId: user?.uid, updates: { automations: newAutos } })
    });
  };

  const handleCreateGoal = async () => {
    if (!newGoalText || !user?.uid) return;
    const tempId = Date.now().toString();
    
    const newG = {
      id: tempId,
      title: newGoalText,
      type: goalType,
      progress: 0,
      tasksCompleted: 0,
      tasksTotal: 5,
      automations: ["Calendar Reminders"],
      status: "active"
    };
    
    setGoals([newG, ...goals]);
    setNewGoalText("");

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          title: newG.title,
          type: newG.type,
          automations: newG.automations
        })
      });
      const data = await res.json();
      if (data.success) {
        setGoals(prev => prev.map(g => g.id === tempId ? data.goal : g));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.uid) return;
    if (!confirm("Delete this goal?")) return;
    
    setGoals(goals.filter(g => g.id !== goalId));
    await fetch(`/api/goals/${goalId}?userId=${user.uid}`, {
      method: 'DELETE'
    });
  };

  const handleIncrementProgress = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !user?.uid) return;

    const newCompleted = Math.min(goal.tasksCompleted + 1, goal.tasksTotal);
    const newProgress = Math.round((newCompleted / goal.tasksTotal) * 100);

    setGoals(goals.map(g => g.id === goalId ? { ...g, tasksCompleted: newCompleted, progress: newProgress } : g));

    await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        userId: user.uid, 
        updates: { tasksCompleted: newCompleted, progress: newProgress } 
      })
    });

    // Cross-Route Telemetry Sync
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    await addDoc(collection(db, "users", user.uid, "sessions"), {
      date: dateStr,
      time: timeStr,
      duration: "Habit",
      score: 100, // Habits give a max score boost!
      type: "Habit Execution",
      task: goal.title,
      status: "Completed",
      timestamp: now.getTime()
    });

    const analyticsRef = doc(db, "users", user.uid, "analytics", "overview");
    const docSnap = await getDoc(analyticsRef);
    if (docSnap.exists()) {
      let current = docSnap.data().cognitiveLoad || [0,0,0,0,0,0,0,0,0,0];
      if (JSON.stringify(current) === JSON.stringify([40, 60, 45, 80, 50, 70, 90, 85, 60, 40])) {
         current = [0,0,0,0,0,0,0,0,0,0];
      }
      const updated = [...current.slice(1), Math.floor(Math.random() * 20) + 70]; // Boost load naturally
      await updateDoc(analyticsRef, { cognitiveLoad: updated });
    }

    const telRef = doc(db, "users", user.uid, "telemetry", "live");
    await setDoc(telRef, {
       logs: arrayUnion(`Goal Progressed: ${goal.title}`),
    }, { merge: true });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-black font-body relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none z-0" />
      
      <header className="pl-[72px] pr-4 md:px-8 py-4 md:py-6 flex items-center justify-between shrink-0 border-b-4 border-black z-10 bg-[var(--memphis-red)] relative overflow-hidden">
        <div className="absolute inset-0 pattern-zigzag opacity-30 pointer-events-none" />
        <div className="absolute top-4 right-8 w-12 h-12 border-4 border-black shape-triangle bg-[var(--memphis-yellow)] memphis-float hidden md:block" />
        <div className="absolute bottom-2 left-[50%] w-8 h-8 border-4 border-black shape-circle bg-[var(--memphis-mint)] memphis-float hidden md:block" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <h2 className="text-[24px] md:text-[28px] font-display font-black text-white flex items-center gap-2 tracking-tight uppercase">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-white" /> Goal & Habit Matrix
          </h2>
          <p className="text-[12px] md:text-[14px] text-white mt-1 font-mono font-bold uppercase tracking-widest">
            Weekly & Monthly Execution Tracking
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-20">
        
        {/* Goal Creation Row */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="E.g., Complete monthly audits..." 
            className="flex-1 w-full bg-white rounded-none border-4 border-black p-3 md:p-4 font-bold text-black focus:outline-none focus:ring-4 focus:ring-[var(--memphis-pink)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[14px] md:text-[16px]"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGoal()}
          />
          <select 
            className="w-full md:w-auto bg-white rounded-none border-4 border-black p-3 md:p-4 font-bold text-black uppercase cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-[var(--memphis-pink)] text-[14px] md:text-[16px]"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as any)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={handleCreateGoal} className="memphis-btn flex items-center justify-center gap-2 px-8 py-3 md:py-4 w-full md:w-auto">
            <Plus className="w-5 h-5" /> Initialize Goal
          </button>
        </div>

        {/* AI Autopilot Capabilities */}
        <div className="memphis-card memphis-card--yellow bg-white p-4 md:p-6 mb-6 md:mb-8">
           <div className="card-eyebrow flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
             <span><BrainCircuit className="w-5 h-5 inline mr-2 text-[var(--memphis-pink)]" /> AI Automation Protocols</span>
             <span className="badge badge--cyan animate-pulse w-max">ACTIVE</span>
           </div>
           <p className="text-[12px] md:text-[14px] font-mono font-bold leading-relaxed text-black mb-4 md:mb-6">
             VibeShift can securely interface with Google Workspace to accelerate your goals. Activate automations like <strong>Auto-Mail</strong> (drafting emails for updates), <strong>Auto-Pay</strong> (scanning bills in Gmail and scheduling calendar reminders), or <strong>Aggressive Reminders</strong> (SMS/Email alerts when falling behind).
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="rounded-2xl border-4 border-black p-4 bg-white hover:bg-gray-50 transition-colors flex flex-col gap-2 cursor-pointer shadow-[4px_4px_0px_0px_var(--memphis-pink)]">
                 <div className="flex items-center gap-2 font-bold font-display uppercase text-[14px] md:text-[16px]"><Mail className="w-5 h-5 text-[var(--memphis-blue)]" /> Auto-Mail Drafts</div>
                 <p className="text-[10px] md:text-[11px] font-mono text-gray-700 font-bold">Agent reads project progress and drafts weekly update emails to stakeholders.</p>
              </div>
              <div className="rounded-2xl border-4 border-black p-4 bg-white hover:bg-gray-50 transition-colors flex flex-col gap-2 cursor-pointer shadow-[4px_4px_0px_0px_var(--memphis-mint)]">
                 <div className="flex items-center gap-2 font-bold font-display uppercase text-[14px] md:text-[16px]"><CreditCard className="w-5 h-5 text-[var(--memphis-mint)]" /> Bill Parsing & Pay</div>
                 <p className="text-[10px] md:text-[11px] font-mono text-gray-700 font-bold">Extracts invoices from Gmail, creates payment tasks, and blocks calendar time.</p>
              </div>
              <div className="rounded-2xl border-4 border-black p-4 bg-white hover:bg-gray-50 transition-colors flex flex-col gap-2 cursor-pointer shadow-[4px_4px_0px_0px_var(--memphis-blue)]" onClick={() => setMailReminders(!mailReminders)}>
                 <div className="flex items-center gap-2 font-bold font-display uppercase text-[14px] md:text-[16px]"><Sparkles className="w-5 h-5 text-[var(--memphis-pink)]" /> Aggressive Nudges</div>
                 <p className="text-[10px] md:text-[11px] font-mono text-gray-700 font-bold">Currently: {mailReminders ? 'Enabled' : 'Disabled'}. Automatically sends you harsh reminders if DDV drops.</p>
              </div>
           </div>
        </div>

        {/* Goals List */}
        <div className="grid gap-6">
          {loading ? (
            <p className="text-center font-mono font-bold text-lg md:text-xl">Loading goals...</p>
          ) : goals.length === 0 ? (
            <div className="p-6 md:p-10 border-4 border-dashed border-black bg-white text-center text-black font-display font-black uppercase text-lg md:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              No goals set yet. Initialize one above.
            </div>
          ) : goals.map((goal) => (
            <div key={goal.id} className="memphis-card memphis-card--pink p-4 md:p-6 bg-white flex flex-col group">
              <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 gap-4 md:gap-0">
                 <div className="w-full md:w-auto flex flex-col items-start">
                   <div className="flex justify-between w-full md:w-auto items-center mb-3">
                     <span className={`badge inline-block ${goal.type === 'weekly' ? 'badge--warning' : 'badge--info'}`}>{goal.type.toUpperCase()} GOAL</span>
                     <button onClick={() => handleDeleteGoal(goal.id)} className="md:hidden p-2 bg-[var(--memphis-red)] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Trash2 className="w-4 h-4 text-white" />
                     </button>
                   </div>
                   <h3 className="text-[20px] md:text-[24px] font-display font-black uppercase text-black leading-tight flex items-center gap-3">
                     {goal.title || goal.name}
                     <button onClick={() => handleDeleteGoal(goal.id)} className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[var(--memphis-red)] border-2 border-black rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Trash2 className="w-5 h-5 text-white" />
                     </button>
                   </h3>
                 </div>
                 <div className="text-left md:text-right">
                   <div className="text-[28px] md:text-[36px] font-black font-display text-[var(--memphis-pink)] leading-none" style={{ textShadow: '2px 2px 0px #000' }}>{goal.progress}%</div>
                   <div className="text-[10px] md:text-[12px] font-mono font-black uppercase text-black mt-1 md:mt-2 tracking-widest">Progress</div>
                 </div>
              </div>
              
              <div className="w-full h-8 md:h-10 bg-white border-4 border-black relative overflow-hidden mb-6 cursor-pointer group/bar shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={() => handleIncrementProgress(goal.id)}>
                 <div className="absolute top-0 left-0 h-full bg-[var(--memphis-pink)] border-r-4 border-black transition-all" style={{ width: `${goal.progress}%` }}></div>
                 <div className="absolute inset-0 bg-[var(--memphis-yellow)] opacity-0 group-hover/bar:opacity-100 flex items-center justify-center text-[12px] md:text-[14px] font-black text-black tracking-widest uppercase transition-opacity">
                    Click to Increment
                 </div>
              </div>
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mt-auto pt-4 md:pt-6 border-t-4 border-black gap-4">
                 <div className="text-[12px] md:text-[14px] font-mono font-black flex items-center gap-2 uppercase tracking-widest">
                    Tasks: <span className="bg-black text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full">{goal.tasksCompleted} / {goal.tasksTotal}</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 md:gap-3">
                    {/* Available automations toggle */}
                    {["Auto-Mail", "Auto-Pay", "Calendar Reminders"].map((auto: string) => {
                      const isActive = goal.automations?.includes(auto);
                      return (
                        <span 
                          key={auto} 
                          onClick={() => toggleAutomation(goal.id, auto)} 
                          className={`text-[10px] md:text-[11px] px-3 md:px-4 py-2 md:py-2 uppercase font-black cursor-pointer transition-colors flex items-center gap-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] ${isActive ? 'bg-[var(--memphis-mint)] text-black' : 'bg-white text-black'}`}
                        >
                          <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> {auto}
                        </span>
                      );
                    })}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
