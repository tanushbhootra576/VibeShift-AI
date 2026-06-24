import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Task } from '@/types';

export function useFirestoreTasks(userId: string | null) {
  const store = useTaskStore();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', userId, 'tasks')
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const task = { id: change.doc.id, ...data } as Task;

          if (change.type === 'added' && !task.id.startsWith('optimistic_')) {
            // Check if already exists (to avoid duplicates with optimistic UI)
            if (!store.getTask(task.id)) {
              store.addTask(task);
            }
          }
          if (change.type === 'modified') {
            store.updateTask(task.id, task);
            if (task.aiRescheduledAt) {
              store.flagAIRescheduled(task.id);
            }
          }
          if (change.type === 'removed') {
            store.removeTask(task.id);
          }
        });
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);
}
