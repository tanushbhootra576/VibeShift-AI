import { useTaskStore } from '@/store/taskStore';
import { useGeminiStore } from '@/store/geminiStore';
import { Task } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function useCreateTask() {
  const store = useTaskStore();
  const { callGeminiAPI } = useGeminiStore();

  return async (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'driftVelocity' | 'driftHistory'>) => {
    const tempId = `optimistic_${Date.now()}`;

    const optimisticTask: Task = {
      ...taskData,
      id: tempId,
      status: 'pending', // Optimistic pending
      driftVelocity: 1.0,
      driftHistory: [],
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    store.addTask(optimisticTask);

    try {
      if (!store.userId) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, 'users', store.userId, 'tasks'), {
        ...taskData,
        status: 'pending',
        driftVelocity: 1.0,
        driftHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      store.replaceTask(tempId, docRef.id);

      // Trigger Gemini to autonomously create calendar events
      const prompt = `New task created: "${taskData.title}". Deadline: ${taskData.deadline}. Estimated minutes: ${taskData.estimatedMinutes}. Please create a calendar deadline event, and if necessary, suggest a task breakdown.`;
      
      callGeminiAPI([{ role: 'user', content: prompt }]);

    } catch (error) {
      console.error('Failed to create task', error);
      store.removeTask(tempId);
      alert('Failed to save task. Try again.'); // Simple fallback for now
    }
  };
}
