
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const buffersSnap = await adminDb.collection(`users/${userId}/injected_buffers`)
      .where('is_active', '==', true)
      .get();
      
    const buffers = buffersSnap.docs.map((doc: any) => doc.data());
    
    // Aggregate insights
    let totalProtectedEvents = buffers.length;
    let totalBufferMinutes = buffers.reduce((acc: number, curr: any) => acc + (curr.buffer_duration_minutes || 0), 0);
    let strategies = buffers.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.buffer_strategy] = (acc[curr.buffer_strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ 
      success: true, 
      insights: {
        total_cascades_prevented: totalProtectedEvents,
        total_time_buffered: totalBufferMinutes,
        strategy_distribution: strategies
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
