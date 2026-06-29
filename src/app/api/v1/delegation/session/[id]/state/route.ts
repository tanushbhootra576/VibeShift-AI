
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const sessionId = (await params).id;
    if (!userId || !sessionId) return NextResponse.json({ error: 'Unauthorized or missing params' }, { status: 400 });

    const sessionDoc = await adminDb.doc(`users/${userId}/delegation_sessions/${sessionId}`).get();
    if (!sessionDoc.exists) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      
    return NextResponse.json({ state: sessionDoc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
