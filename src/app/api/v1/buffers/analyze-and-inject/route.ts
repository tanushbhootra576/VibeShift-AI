
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, eventId, eventTitle, category, scheduledDurationMinutes, targetDateISO } = await req.json();
    if (!userId || !eventId || !category || !scheduledDurationMinutes) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const targetDate = new Date(targetDateISO || Date.now());
    const dayOfWeek = targetDate.getDay();
    const timeOfDay = targetDate.getHours();

    // Query historical performance logs for this user (mocking complex telemetry pull)
    const logsSnap = await adminDb.collection(`users/${userId}/user_performance_logs`)
      .where('category', '==', category)
      .limit(30)
      .get();
      
    const telemetryLogs = logsSnap.docs.map((doc: any) => doc.data());

    const prompt = `
System: You are a Predictive Behavioral Analytics Engine specializing in time-management ergonomics. Your role is to look at a user's recent execution telemetry and calculate personalized "Buffer Adjustments" to prevent calendar cascading failures.

Context Provided:
- Current Target Task/Event: ${eventTitle || 'Untitled Event'}
- Event Category: ${category}
- Scheduled Duration: ${scheduledDurationMinutes} minutes
- User Behavioral Telemetry Logs: ${JSON.stringify(telemetryLogs)}
- Target Context: Day ${dayOfWeek}, Hour ${timeOfDay}

Instructions:
1. Cross-reference the current event type, day, and time against historical logs to identify latency patterns.
2. Calculate a recommended buffer duration in minutes.
3. Determine the injection strategy: 'pad_start', 'pad_end', or 'block_adjacent'.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "event_id": "${eventId}",
  "pattern_detected": "string",
  "historical_latency_mean_minutes": 0,
  "confidence_score": 0.0,
  "injection_strategy": "pad_start",
  "buffer_minutes_to_inject": 0,
  "is_silent_adjustment": true,
  "reasoning": "string"
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const injectionPayload = JSON.parse(response.text || '{}');

    if (injectionPayload.buffer_minutes_to_inject > 0) {
      // Simulate Google Calendar API call to create silent buffer block
      const associatedBlockCalendarId = `cal_buf_${Date.now()}`;

      const bufferRef = adminDb.collection(`users/${userId}/injected_buffers`).doc();
      await bufferRef.set({
        id: bufferRef.id,
        user_id: userId,
        target_event_id: eventId,
        buffer_strategy: injectionPayload.injection_strategy,
        buffer_duration_minutes: injectionPayload.buffer_minutes_to_inject,
        associated_block_calendar_id: associatedBlockCalendarId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return NextResponse.json({ success: true, payload: injectionPayload, bufferId: bufferRef.id });
    }

    return NextResponse.json({ success: true, message: 'No buffer required', payload: injectionPayload });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
