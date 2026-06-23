import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        microStep: {
          type: Type.STRING,
          description: "An extremely specific, 5-minute actionable micro-step to break cognitive friction."
        }
      },
      required: ['microStep']
    };

    const systemInstruction = `
      You are the VibeShift AI Cognitive De-escalation Router.
      The user is stuck, overwhelmed, or experiencing cognitive friction.
      Your ONLY job is to break their current context down into a single, aggressively small micro-step that takes less than 5 minutes to complete.
      DO NOT give general advice. Give a specific instruction based on their context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Current Context: ${JSON.stringify(context)}` }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const payloadText = response.text;
    if (!payloadText) throw new Error("No payload returned from Gemini");

    const payload = JSON.parse(payloadText);

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Intervention Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate intervention' }, { status: 500 });
  }
}
