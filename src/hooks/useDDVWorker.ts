import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useGeminiStore } from '@/store/geminiStore';
import { DDVResult } from '@/workers/ddv.worker';

// Assume batchUpdateDDV writes to firestore via API route or SDK
async function batchUpdateDDV(userId: string, results: DDVResult[]) {
  try {
    await fetch('/api/tasks/ddv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, results })
    });
  } catch (error) {
    console.error('Failed to batch update DDV', error);
  }
}

export function useDDVWorker() {
  const worker = useRef<Worker | null>(null);
  const userId = useTaskStore(state => state.userId);
  const triggerGeminiReschedule = useGeminiStore(state => state.triggerGeminiReschedule);

  useEffect(() => {
    if (!userId) return;

    // Initialize worker
    worker.current = new Worker(new URL('../workers/ddv.worker.ts', import.meta.url));

    worker.current.onmessage = async (event) => {
      const { type, results, tasks: criticalTasks } = event.data;

      if (type === 'ddv_update') {
        // await batchUpdateDDV(userId, results); // Skip server batch update for now to save quota
        useTaskStore.getState().updateDDVValues(results);
      }

      if (type === 'ddv_critical') {
        for (const criticalTask of criticalTasks) {
          triggerGeminiReschedule(criticalTask);
        }
      }
    };

    // Calculate initial DDV
    worker.current.postMessage({ tasks: useTaskStore.getState().tasks, userId });

    // Poll every 10 seconds to recalculate DDV without infinite re-renders
    const interval = setInterval(() => {
      if (worker.current) {
        worker.current.postMessage({ tasks: useTaskStore.getState().tasks, userId });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      worker.current?.terminate();
    };
  }, [userId, triggerGeminiReschedule]); 
}
