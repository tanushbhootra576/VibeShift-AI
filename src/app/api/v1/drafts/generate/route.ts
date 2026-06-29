
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { taskId, userId } = await req.json();
    if (!taskId || !userId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const taskDoc = await adminDb.doc(`users/${userId}/tasks/${taskId}`).get();
    if (!taskDoc.exists) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    const task = taskDoc.data()!;

    // Mock Drive Fetch (would normally use googleapis with user's OAuth token)
    const mockDriveFiles = [
      { id: 'file_1', name: 'Q3_Pitch_Deck.pdf', path: '/Drive/Presentations/Q3_Pitch_Deck.pdf' },
      { id: 'file_2', name: 'Invoice_442.pdf', path: '/Drive/Invoices/Invoice_442.pdf' }
    ];

    const prompt = `
System: You are an autonomous executive assistant agent. Your task is to proactively generate high-context, ready-to-send draft communications for a user based on their upcoming tasks, calendar events, and attached file metadata.

Context Provided:
- Current Time: ${new Date().toISOString()}
- Target Task/Deadline: ${task.title} (Details: ${task.description || ''}, Due: ${task.due_date || ''})
- Recipient Info: ${task.recipient_name || 'Client'} (${task.recipient_email || 'client@example.com'})
- Available Drive Files: ${JSON.stringify(mockDriveFiles)}
- User's Historical Tone: concise_professional_warm

Instructions:
1. Determine if the task requires an attachment. Search the provided file list for the most relevant, recent file matching the task context.
2. Draft a highly personalized, contextual email or message body. Do NOT use generic placeholders like "[Insert Name Here]". Use the provided context to fill all details.
3. Keep the tone strictly aligned with the User's Historical Tone.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "should_trigger": true,
  "recipient": { "email": "string", "name": "string" },
  "subject": "string",
  "body": "string",
  "attachment_identified": true,
  "attachment_details": { "file_id": "string", "file_name": "string", "file_path_or_url": "string" },
  "confidence_score": 0.95,
  "reasoning": "string"
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const draftPayload = JSON.parse(response.text || '{}');
    
    if (draftPayload.should_trigger) {
      const draftRef = adminDb.collection(`users/${userId}/ghost_drafts`).doc();
      await draftRef.set({
        id: draftRef.id,
        task_id: taskId,
        user_id: userId,
        subject: draftPayload.subject,
        body: draftPayload.body,
        target_recipient: draftPayload.recipient.email,
        attached_file_id: draftPayload.attachment_identified ? draftPayload.attachment_details?.file_id : null,
        attached_file_name: draftPayload.attachment_identified ? draftPayload.attachment_details?.file_name : null,
        status: 'drafted',
        confidence_score: draftPayload.confidence_score,
        created_at: new Date(),
        updated_at: new Date()
      });
      return NextResponse.json({ success: true, draftId: draftRef.id, draft: draftPayload });
    }

    return NextResponse.json({ success: false, reason: 'AI decided not to trigger' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
