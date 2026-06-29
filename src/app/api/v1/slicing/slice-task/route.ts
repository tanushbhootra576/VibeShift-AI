
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, taskId, taskTitle, taskDescription, workspaceTool } = await req.json();
    if (!userId || !taskId || !taskTitle) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const prompt = `
System: You are a Behavioral Psychology Copilot. Your job is to defeat user procrastination caused by task-induced cognitive overwhelm. You take a massive, ambiguous project title and extract a singular, low-friction "Micro-Slice" action that takes less than 5 minutes to complete.

Context Provided:
- Overwhelming Task: ${taskTitle}
- Task Context/Notes: ${taskDescription || 'None'}
- Associated Workspace Tool: ${workspaceTool || 'Unknown'}
- User Procrastination Factor: High

Instructions:
1. Strip away the intimidating scope of the project. Do NOT suggest a multi-step milestone.
2. Isolate the absolute FIRST physical or digital friction-free action.
3. Formulate a direct, ultra-low-barrier notification prompt using psychological momentum design.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "task_id": "${taskId}",
  "micro_slice_action": "string",
  "psychological_nudge_text": "string",
  "target_deep_link_url": "string",
  "estimated_time_seconds": 300,
  "momentum_follow_up_prompt": "string"
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const sliceData = JSON.parse(response.text || '{}');

    const sliceRef = adminDb.collection(`users/${userId}/task_micro_slices`).doc();
    await sliceRef.set({
      id: sliceRef.id,
      parent_task_id: taskId,
      user_id: userId,
      micro_slice_action: sliceData.micro_slice_action,
      nudge_text: sliceData.psychological_nudge_text,
      workspace_url: sliceData.target_deep_link_url,
      execution_status: 'untriggered',
      created_at: new Date()
    });

    return NextResponse.json({ success: true, slice: sliceData, sliceId: sliceRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
