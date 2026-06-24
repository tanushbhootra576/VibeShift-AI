"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTaskStore } from '@/store/taskStore';
import { useDDVWorker } from '@/hooks/useDDVWorker';
import { useFirestoreTasks } from '@/hooks/useFirestoreTasks';

export function TaskEngine() {
  const { user } = useAuth();
  const setUserId = useTaskStore(state => state.setUserId);

  useEffect(() => {
    if (user?.uid) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  }, [user, setUserId]);

  useFirestoreTasks(user?.uid || null);
  useDDVWorker();

  return null; // This component strictly manages background tasks and hooks
}
