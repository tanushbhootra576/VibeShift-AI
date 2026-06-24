import { Task } from '@/types';

type DDVStatus = 'on_track' | 'at_risk' | 'critical' | 'overdue';

export interface DDVResult {
  taskId: string;
  ddv: number;
  status: DDVStatus;
  remainingMinutes: number;
  hoursUntilDeadline: number;
}

self.onmessage = (event: MessageEvent) => {
  const { tasks, userId } = event.data;
  startDDVLoop(tasks, userId);
};

let intervalId: any;

function startDDVLoop(tasks: any[], userId: string) {
  if (intervalId) clearInterval(intervalId);

  const calculate = () => {
    const now = Date.now();
    const results: DDVResult[] = [];

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'rescheduled') continue;

      // Handle Timestamp from Firestore which might be a raw object in the worker
      let deadlineMs = 0;
      if (task.deadline?.seconds) {
        deadlineMs = task.deadline.seconds * 1000;
      } else if (task.deadline instanceof Date) {
        deadlineMs = task.deadline.getTime();
      } else if (typeof task.deadline === 'string') {
        deadlineMs = new Date(task.deadline).getTime();
      }

      if (!deadlineMs) continue;

      const hoursUntilDeadline = (deadlineMs - now) / (1000 * 60 * 60);

      if (hoursUntilDeadline <= 0) {
        results.push({ taskId: task.id, ddv: -999, status: 'overdue', remainingMinutes: 0, hoursUntilDeadline });
        continue;
      }

      const totalActualMinutes = (task.actualMinutes || []).reduce((a: number, b: number) => a + b, 0);
      const remainingMinutes = task.estimatedMinutes - totalActualMinutes;

      const ddv = remainingMinutes / hoursUntilDeadline;

      const status: DDVStatus =
        ddv >= 1.0  ? 'on_track'  :
        ddv >= 0.0  ? 'at_risk'   :
        'critical';

      results.push({
        taskId: task.id,
        ddv: Math.round(ddv * 100) / 100,
        status,
        remainingMinutes,
        hoursUntilDeadline: Math.round(hoursUntilDeadline * 10) / 10,
      });
    }

    self.postMessage({ type: 'ddv_update', results, userId });

    const critical = results.filter(r => r.status === 'critical' && r.ddv !== -999);
    if (critical.length > 0) {
      self.postMessage({ type: 'ddv_critical', tasks: critical, userId });
    }
  };

  calculate();
  intervalId = setInterval(calculate, 60 * 1000);
}
