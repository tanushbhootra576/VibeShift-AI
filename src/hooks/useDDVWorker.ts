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
  const { tasks, userId, updateDDVValues } = useTaskStore();
  const { triggerGeminiReschedule } = useGeminiStore();

  useEffect(() => {
    if (!userId) return;

    // Initialize worker
    worker.current = new Worker(new URL('../workers/ddv.worker.ts', import.meta.url));

    worker.current.onmessage = async (event) => {
      const { type, results, tasks: criticalTasks } = event.data;

      if (type === 'ddv_update') {
        await batchUpdateDDV(userId, results);
        updateDDVValues(results);
      }

      if (type === 'ddv_critical') {
        for (const criticalTask of criticalTasks) {
          triggerGeminiReschedule(criticalTask);
          // UI can toast this or we can just rely on the store
        }
      }
    };

    worker.current.postMessage({ tasks, userId });

    return () => {
      worker.current?.terminate();
    };
  }, [userId]); // Initialize once per user

  // Re-send updated tasks to worker when they change
  useEffect(() => {
    if (worker.current && userId) {
      worker.current.postMessage({ tasks, userId });
    }
  }, [tasks, userId]);
}
