
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, biometric_signature, confirmed_amount } = await req.json();
    const sessionId = (await params).id;
    if (!userId || !sessionId || !biometric_signature) {
      return NextResponse.json({ error: 'Missing biometric signature or params' }, { status: 400 });
    }

    const sessionRef = adminDb.doc(`users/${userId}/delegation_sessions/${sessionId}`);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    
    // In reality, we'd send an unblock signal to the suspended Playwright instance here.
    // We simulate the Playwright worker clicking the final button and capturing the receipt.
    
    await sessionRef.update({
      current_status: 'completed',
      screenshot_url: 'https://storage.googleapis.com/vibeshift-mock/receipt.png', // Final receipt
      updated_at: new Date()
    });

    const task_id = sessionDoc.data()?.task_id;
    if (task_id) {
      await adminDb.doc(`users/${userId}/tasks/${task_id}`).update({
        status: 'completed'
      });
    }

    return NextResponse.json({ success: true, message: 'Execution completed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
