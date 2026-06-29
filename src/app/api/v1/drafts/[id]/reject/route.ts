
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await req.json();
    const draftId = (await params).id;
    if (!userId || !draftId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const draftRef = adminDb.doc(`users/${userId}/ghost_drafts/${draftId}`);
    await draftRef.update({
      status: 'rejected',
      updated_at: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
