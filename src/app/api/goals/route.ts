import { adminDb } from '@/lib/firebase-admin';
import { Goal } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    const snapshot = await adminDb.collection('users').doc(userId).collection('goals').orderBy('createdAt', 'desc').get();
    const goals = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return Response.json({ success: true, goals });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, type, automations } = body;

    if (!userId || !title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGoal = {
      title,
      type: type || 'weekly',
      progress: 0,
      tasksCompleted: 0,
      tasksTotal: 5, // Mock default
      automations: automations || [],
      status: 'active',
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('users').doc(userId).collection('goals').add(newGoal);

    return Response.json({ success: true, goal: { id: docRef.id, ...newGoal } });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
