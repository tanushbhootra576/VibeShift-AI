import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              deadline: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
              estimatedMinutes: { type: Type.INTEGER }
            },
            required: ['title', 'priority', 'estimatedMinutes']
          }
        }
      },
      required: ['insight', 'tasks']
    };

    const systemInstruction = `
      You are the VibeShift AI Chaos Dump Engine.
      Analyze the provided image (a notebook photo, whiteboard, or screenshot).
      Extract all actionable tasks, infer reasonable deadlines, assign priorities, and estimate durations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [
            { text: 'Extract tasks from this image.' },
            {
              inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg'
              }
            }
          ] 
        }
      ],
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
    console.error('Chaos Dump Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse image' }, { status: 500 });
  }
}
