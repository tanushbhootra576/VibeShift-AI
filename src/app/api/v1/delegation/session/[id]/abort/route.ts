
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await req.json();
    const sessionId = (await params).id;
    if (!userId || !sessionId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const sessionRef = adminDb.doc(`users/${userId}/delegation_sessions/${sessionId}`);
    await sessionRef.update({
      current_status: 'failed',
      updated_at: new Date()
    });

    return NextResponse.json({ success: true, message: 'Session aborted and destroyed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
