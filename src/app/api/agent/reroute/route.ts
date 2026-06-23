import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: Request) {
  try {
    const { calendar, tasks, driftVelocity } = await req.json();

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        successProbabilityBefore: { type: Type.INTEGER },
        successProbabilityAfter: { type: Type.INTEGER },
        strategy: { type: Type.STRING },
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['SHIFT_MEETING', 'CREATE_FOCUS_BLOCK', 'SPLIT_TASK'] },
              description: { type: Type.STRING },
              targetId: { type: Type.STRING }
            },
            required: ['type', 'description']
          }
        },
        stakeholderUpdateDraft: { type: Type.STRING }
      },
      required: ['successProbabilityBefore', 'successProbabilityAfter', 'strategy', 'actions', 'stakeholderUpdateDraft']
    };

    const systemInstruction = `
      You are the VibeShift AI Autonomous Re-Routing Engine.
      The user's Deadline Drift Velocity (DDV) is at critical levels.
      Analyze their calendar and task load, find free slots, create a recovery strategy by shifting low-priority meetings and creating focus blocks.
      You must also draft a stakeholder update email explaining the re-routing.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Drift Velocity: ${driftVelocity}\nCalendar: ${JSON.stringify(calendar)}\nTasks: ${JSON.stringify(tasks)}` }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    const payloadText = response.text;
    if (!payloadText) throw new Error("No payload returned from Gemini");

    const payload = JSON.parse(payloadText);

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Autonomous Re-Routing Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate re-routing plan' }, { status: 500 });
  }
}
