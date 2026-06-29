const fs = require('fs');
const path = require('path');

const apiPath = path.join('G:', 'vibe2ship', 'vibeshift', 'src', 'app', 'api', 'v1');

fs.mkdirSync(path.join(apiPath, 'buffers', 'analyze-and-inject'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'telemetry', 'log-completion'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'buffers', 'insights'), { recursive: true });

// 1. ANALYZE AND INJECT
fs.writeFileSync(path.join(apiPath, 'buffers', 'analyze-and-inject', 'route.ts'), `
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
    const logsSnap = await adminDb.collection(\`users/\${userId}/user_performance_logs\`)
      .where('category', '==', category)
      .limit(30)
      .get();
      
    const telemetryLogs = logsSnap.docs.map(doc => doc.data());

    const prompt = \`
System: You are a Predictive Behavioral Analytics Engine specializing in time-management ergonomics. Your role is to look at a user's recent execution telemetry and calculate personalized "Buffer Adjustments" to prevent calendar cascading failures.

Context Provided:
- Current Target Task/Event: \${eventTitle || 'Untitled Event'}
- Event Category: \${category}
- Scheduled Duration: \${scheduledDurationMinutes} minutes
- User Behavioral Telemetry Logs: \${JSON.stringify(telemetryLogs)}
- Target Context: Day \${dayOfWeek}, Hour \${timeOfDay}

Instructions:
1. Cross-reference the current event type, day, and time against historical logs to identify latency patterns.
2. Calculate a recommended buffer duration in minutes.
3. Determine the injection strategy: 'pad_start', 'pad_end', or 'block_adjacent'.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "event_id": "\${eventId}",
  "pattern_detected": "string",
  "historical_latency_mean_minutes": 0,
  "confidence_score": 0.0,
  "injection_strategy": "pad_start",
  "buffer_minutes_to_inject": 0,
  "is_silent_adjustment": true,
  "reasoning": "string"
}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const injectionPayload = JSON.parse(response.text || '{}');

    if (injectionPayload.buffer_minutes_to_inject > 0) {
      // Simulate Google Calendar API call to create silent buffer block
      const associatedBlockCalendarId = \`cal_buf_\${Date.now()}\`;

      const bufferRef = adminDb.collection(\`users/\${userId}/injected_buffers\`).doc();
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
`);

// 2. LOG COMPLETION (TELEMETRY)
fs.writeFileSync(path.join(apiPath, 'telemetry', 'log-completion', 'route.ts'), `
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

    const logRef = adminDb.collection(\`users/\${userId}/user_performance_logs\`).doc();
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
`);

// 3. INSIGHTS
fs.writeFileSync(path.join(apiPath, 'buffers', 'insights', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const buffersSnap = await adminDb.collection(\`users/\${userId}/injected_buffers\`)
      .where('is_active', '==', true)
      .get();
      
    const buffers = buffersSnap.docs.map(doc => doc.data());
    
    // Aggregate insights
    let totalProtectedEvents = buffers.length;
    let totalBufferMinutes = buffers.reduce((acc, curr) => acc + (curr.buffer_duration_minutes || 0), 0);
    let strategies = buffers.reduce((acc, curr) => {
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
`);

console.log("Created Buffers and Telemetry API routes successfully.");
