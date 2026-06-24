import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId, results } = await request.json();

    if (!userId || !results || !Array.isArray(results)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const batch = adminDb.batch();

    for (const result of results) {
      const taskRef = adminDb.collection('users').doc(userId).collection('tasks').doc(result.taskId);
      batch.update(taskRef, {
        driftVelocity: result.ddv,
        // Optional: you could push to driftHistory here, but maybe that's too frequent for a 60s worker.
        // Doing it sparsely in a Cloud Function or just relying on live DDV might be better to save writes.
      });
    }

    await batch.commit();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
