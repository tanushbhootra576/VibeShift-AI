import { create } from 'zustand';
import { Task } from '@/types';
import { DDVResult } from '@/workers/ddv.worker';

interface TaskState {
  tasks: Task[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  replaceTask: (tempId: string, realId: string) => void;
  updateDDVValues: (results: DDVResult[]) => void;
  flagAIRescheduled: (taskId: string) => void;
  getTask: (id: string) => Task | undefined;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  userId: null,
  setUserId: (id) => set({ userId: id }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  replaceTask: (tempId, realId) => set((state) => ({
    tasks: state.tasks.map(t => t.id === tempId ? { ...t, id: realId, status: 'pending' } : t)
  })),
  updateDDVValues: (results) => set((state) => {
    const nextTasks = [...state.tasks];
    for (const result of results) {
      const idx = nextTasks.findIndex(t => t.id === result.taskId);
      if (idx !== -1) {
        nextTasks[idx] = { 
          ...nextTasks[idx], 
          driftVelocity: result.ddv,
          driftHistory: [...(nextTasks[idx].driftHistory || []), { ts: new Date() as any, ddv: result.ddv }]
        };
      }
    }
    return { tasks: nextTasks };
  }),
  flagAIRescheduled: (taskId) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, aiRescheduledAt: new Date() as any } : t)
  })),
  getTask: (id) => get().tasks.find(t => t.id === id),
}));
