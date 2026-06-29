
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, sessionId, liveTranscriptChunk, meetingTitle } = await req.json();
    if (!userId || !liveTranscriptChunk) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const currentTimeUtc = new Date().toISOString();

    const prompt = `
System: You are an Ambient Audio Intelligence Streamer. You process streaming transcriptions originating from live meetings or study groups. Your task is to detect verbal agreements, explicit declarations of intent, or assigned deadlines, and formulate structured system task suggestions.

Context Provided:
- Live Transcript Chunk: ${liveTranscriptChunk}
- Meeting Metadata: ${meetingTitle || 'Focus Session'}, Current Time: ${currentTimeUtc}

Instructions:
1. Isolate instances where the account owner (${userName || 'The User'}) explicitly says they will perform a task, or when someone assigns a task to them and they verbally accept it.
2. Disregard exploratory conversation, casual chatter, or ideas that do not result in a clear commitment.
3. Formulate a short, punchy task name, deduce the targeted completion timeframe, and clip the exact quote as context.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "action_item_detected": true,
  "confidence_rating": 0.91,
  "task_payload": {
    "title": "string",
    "implied_deadline": "YYYY-MM-DDTHH:MM:SSZ",
    "verbatim_context_quote": "string",
    "mentioned_collaborators": ["string"]
  }
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = JSON.parse(response.text || '{}');

    if (parsedData.action_item_detected && parsedData.task_payload) {
      const queueRef = adminDb.collection(`users/${userId}/detected_action_queue`).doc();
      await queueRef.set({
        id: queueRef.id,
        session_id: sessionId || null,
        user_id: userId,
        proposed_title: parsedData.task_payload.title,
        context_quote: parsedData.task_payload.verbatim_context_quote,
        target_deadline: new Date(parsedData.task_payload.implied_deadline),
        review_status: 'pending_review',
        created_at: new Date()
      });

      return NextResponse.json({ success: true, itemDetected: true, queueId: queueRef.id, payload: parsedData.task_payload });
    }

    return NextResponse.json({ success: true, itemDetected: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
