import { adminDb } from './firebase-admin';
import { createCalendarEvent, updateCalendarEvent, getCalendarBusySlots, CalendarEventInput } from './calendar-server';

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  // Log every tool call to Firestore agentLogs
  const logRef = adminDb.collection('users').doc(userId).collection('agentLogs').doc();
  await logRef.set({
    id: logRef.id,
    timestamp: new Date(),
    toolName,
    input: args,
    triggeredBy: 'user', // default
    undoable: true,
    undoneAt: null,
  });

  const start = Date.now();

  try {
    let result: unknown;

    switch (toolName) {
      case 'createCalendarEvent': {
        const eventId = await createCalendarEvent(userId, args as unknown as CalendarEventInput);
        await adminDb.collection('users').doc(userId).collection('tasks').doc(args.taskId as string).update({
          calendarEventId: eventId
        });
        result = { success: true, calendarEventId: eventId };
        break;
      }

      case 'rescheduleTask': {
        const { taskId, newStartISO, newEndISO, reason } = args as any;

        const taskDoc = await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).get();
        const task = taskDoc.data();

        if (task?.calendarEventId) {
          await updateCalendarEvent(userId, task.calendarEventId, newStartISO, newEndISO);
        } else {
          const eventId = await createCalendarEvent(userId, {
            taskId, title: task?.title || 'Task', startISO: newStartISO,
            endISO: newEndISO, type: 'focus_block', description: ''
          });
          await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).update({ calendarEventId: eventId });
        }

        await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).update({
          status: 'rescheduled',
          aiRescheduledAt: new Date(),
          aiRescheduleReason: reason,
        });

        result = { success: true, reason };
        break;
      }

      case 'analyzeTaskLoad': {
        const { lookAheadHours = 24 } = args as { lookAheadHours?: number };
        const horizon = new Date(Date.now() + lookAheadHours * 3600000);
        
        const tasksSnap = await adminDb.collection('users').doc(userId).collection('tasks')
          .where('deadline', '<=', horizon)
          .get();
        
        const tasks = tasksSnap.docs.map((d: any) => d.data());
        const busySlots = await getCalendarBusySlots(userId, lookAheadHours);

        const totalWorkMinutes = lookAheadHours * 60 * 0.6;
        const committedMinutes = tasks.reduce((sum: number, t: any) => {
           const actual = (t.actualMinutes || []).reduce((a: number,b: number) => a+b, 0);
           return sum + (t.estimatedMinutes - actual);
        }, 0);
        const loadPercent = Math.round((committedMinutes / totalWorkMinutes) * 100);

        result = {
          taskCount: tasks.length,
          overdueTasks: tasks.filter(t => new Date(t.deadline.toDate()) < new Date()).length,
          committedMinutes,
          loadPercent,
          cognitiveLoad: loadPercent > 80 ? 'high' : loadPercent > 50 ? 'medium' : 'low',
          criticalDDVTasks: tasks.filter(t => t.driftVelocity < -0.5).map(t => t.title),
        };
        break;
      }

      case 'suggestTaskBreakdown': {
        const { taskTitle, taskDescription, deadlineISO, totalEstimatedMinutes } = args as any;
        const hoursUntilDeadline = (new Date(deadlineISO).getTime() - Date.now()) / 3600000;

        result = {
          context: {
            hoursAvailable: hoursUntilDeadline * 0.6,
            minutesEstimated: totalEstimatedMinutes,
            feasible: (hoursUntilDeadline * 0.6 * 60) >= totalEstimatedMinutes,
          },
        };
        break;
      }

      case 'fetchContextDoc': {
        const { url } = args as { url: string };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          const text = await response.text();
          result = { content: text.slice(0, 8000), url, fetchedAt: new Date().toISOString() };
        } catch(e) {
          result = { error: 'Failed to fetch' };
        }
        break;
      }

      case 'draftStakeholderEmail': {
        result = {
          ready: true,
          meta: args,
          instruction: 'Generate a professional, warm email requesting extension',
        };
        break;
      }

      case 'updateTaskStatus': {
        const { taskId, status, completionPercent } = args as any;
        const updateData: any = { status };
        if (completionPercent !== undefined) updateData.completionPercent = completionPercent;
        
        await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).update(updateData);
        result = { success: true };
        break;
      }

      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    await logRef.update({
      output: result,
      durationMs: Date.now() - start
    });
    return result;

  } catch (error: any) {
    await logRef.update({
      output: { error: String(error) },
      durationMs: Date.now() - start
    });
    throw error;
  }
}
