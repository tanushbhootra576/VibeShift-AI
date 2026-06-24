import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript text is required' }, { status: 400 });
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        priority: { type: Type.INTEGER, description: "1-4, where 4 is Critical" },
        deadline: { type: Type.STRING },
        estimatedMinutes: { type: Type.INTEGER }
      },
      required: ['title', 'priority', 'estimatedMinutes']
    };

    const systemInstruction = `
      You are the VibeShift AI Voice-to-Task Parser.
      Extract a structured task from the raw audio transcript provided by the user.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Transcript: "${transcript}"` }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const payloadText = response.text;
    if (!payloadText) throw new Error("No payload returned from Gemini");

    return NextResponse.json(JSON.parse(payloadText));
  } catch (error: any) {
    console.error('Voice Task Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse voice transcript' }, { status: 500 });
  }
}
