import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  deadline: string;
  priority: string;
  timeEstimate: string;
  aiNote: string;
  completed: boolean;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  driftVelocity?: number;
  calendarEventId?: string;
  userId: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        isLoading: false,
        error: null,
        
        fetchTasks: async (userId: string) => {
          set({ isLoading: true, error: null });
          try {
            const q = query(collection(db, 'users', userId, 'tasks'));
            const snapshot = await getDocs(q);
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            set({ tasks, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },

        addTask: async (task) => {
          // Optimistic update
          const tempId = Date.now().toString();
          const optimisticTask = { ...task, id: tempId } as Task;
          set(state => ({ tasks: [optimisticTask, ...state.tasks] }));

          try {
            const docRef = await addDoc(collection(db, 'users', task.userId, 'tasks'), task);
            // Reconcile ID
            set(state => ({
              tasks: state.tasks.map(t => t.id === tempId ? { ...t, id: docRef.id } : t)
            }));
          } catch (error: any) {
            // Rollback
            set(state => ({ tasks: state.tasks.filter(t => t.id !== tempId), error: error.message }));
          }
        },

        updateTask: async (id, updates) => {
          const state = get();
          const taskToUpdate = state.tasks.find(t => t.id === id);
          if (!taskToUpdate) return;

          // Optimistic update
          set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
          }));

          try {
            await updateDoc(doc(db, 'users', taskToUpdate.userId, 'tasks', id), updates);
          } catch (error: any) {
            // Rollback
            set({ tasks: state.tasks, error: error.message });
          }
        },

        deleteTask: async (id) => {
          const state = get();
          const taskToUpdate = state.tasks.find(t => t.id === id);
          if (!taskToUpdate) return;

          // Optimistic delete
          set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));

          try {
            await deleteDoc(doc(db, 'users', taskToUpdate.userId, 'tasks', id));
          } catch (error: any) {
            // Rollback
            set({ tasks: state.tasks, error: error.message });
          }
        }
      }),
      { name: 'vibeshift-task-storage' }
    )
  )
);
