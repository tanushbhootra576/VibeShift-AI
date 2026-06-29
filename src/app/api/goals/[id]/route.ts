import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { userId, updates } = body;
    const { id } = await params;

    if (!userId || !id) {
      return Response.json({ error: 'Missing userId or goalId' }, { status: 400 });
    }

    const docRef = adminDb.collection('users').doc(userId).collection('goals').doc(id);
    await docRef.update(updates);

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { id } = await params;

    if (!userId || !id) {
      return Response.json({ error: 'Missing userId or goalId' }, { status: 400 });
    }

    const docRef = adminDb.collection('users').doc(userId).collection('goals').doc(id);
    await docRef.delete();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
