
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id'); // In a real app, parse from auth token
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const draftsSnap = await adminDb.collection(`users/${userId}/ghost_drafts`)
      .where('status', '==', 'drafted')
      .get();
      
    const drafts = draftsSnap.docs.map((doc: any) => doc.data());
    return NextResponse.json({ drafts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
