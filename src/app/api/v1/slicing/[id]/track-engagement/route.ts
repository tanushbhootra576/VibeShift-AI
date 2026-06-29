
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, interaction_type } = await req.json();
    if (!userId || !interaction_type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const sliceRef = adminDb.collection(`users/${userId}/task_micro_slices`).doc((await params).id);
    
    const updateData: any = {
      execution_status: interaction_type,
    };
    
    if (interaction_type === 'completed') {
      updateData.completed_at = new Date();
    }

    await sliceRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
