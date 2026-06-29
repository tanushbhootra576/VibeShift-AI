
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, event_id, category, scheduled_duration, actual_end_time, start_time } = await req.json();
    if (!userId || !event_id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const startDate = new Date(start_time);
    const endDate = new Date(actual_end_time);
    
    // Calculate actual duration in minutes
    const actual_duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    const variance_minutes = actual_duration - scheduled_duration;
    
    const day_of_the_week = startDate.getDay();
    const start_hour = startDate.getHours();

    const logRef = adminDb.collection(`users/${userId}/user_performance_logs`).doc();
    await logRef.set({
      id: logRef.id,
      user_id: userId,
      event_id,
      category,
      scheduled_duration,
      actual_duration,
      variance_minutes,
      day_of_the_week,
      start_hour,
      logged_at: new Date()
    });

    return NextResponse.json({ success: true, variance_minutes, logId: logRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
