
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, edited_body, edited_subject } = await req.json();
    const draftId = (await params).id;
    if (!userId || !draftId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const draftRef = adminDb.doc(`users/${userId}/ghost_drafts/${draftId}`);
    const draftDoc = await draftRef.get();
    if (!draftDoc.exists) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    
    const draft = draftDoc.data()!;

    // Here we would use googleapis and the user's OAuth token to actually send via Gmail
    // For now, simulate sending
    console.log(`Sending email to ${draft.target_recipient} with subject: ${edited_subject || draft.subject}`);
    
    await draftRef.update({
      status: 'sent',
      body: edited_body || draft.body,
      subject: edited_subject || draft.subject,
      updated_at: new Date()
    });

    if (draft.task_id) {
      await adminDb.doc(`users/${userId}/tasks/${draft.task_id}`).update({
        status: 'completed'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
