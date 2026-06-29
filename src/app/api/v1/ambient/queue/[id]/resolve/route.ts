
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, action, override_title } = await req.json();
    if (!userId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const queueRef = adminDb.collection(`users/${userId}/detected_action_queue`).doc((await params).id);
    
    // Update review status
    await queueRef.update({
      review_status: action === 'accept' ? 'accepted' : action === 'discard' ? 'discarded' : 'modified',
      ...(override_title && { proposed_title: override_title })
    });

    if (action === 'accept') {
       // Ideally we map this to the core production tasks here
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
