import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the Google Gen AI SDK
// Note: In a real app, you would pass the API key from environment variables or Firebase user doc.
// For Phase 2 architectural layout, we define the structure.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function POST(req: Request) {
  try {
    const { taskTitle, context } = await req.json();

    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        motivation: {
          type: Type.STRING,
          description: "A short, punchy sentence to get the user into flow state."
        },
        runwayMinutes: {
          type: Type.INTEGER,
          description: "Estimated total minutes needed to complete the execution plan."
        },
        executionPlan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              estimatedMinutes: { type: Type.INTEGER },
              completed: { type: Type.BOOLEAN }
            },
            required: ['id', 'title', 'estimatedMinutes', 'completed']
          }
        },
        documentation: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              snippet: { type: Type.STRING }
            },
            required: ['title', 'url', 'snippet']
          }
        },
        commands: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        starterCode: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['motivation', 'runwayMinutes', 'executionPlan', 'documentation', 'commands', 'starterCode']
    };

    const systemInstruction = `
      You are the VibeShift AI Execution Engine.
      Your job is to assemble a complete, distraction-free workspace payload for a user about to start a task.
      Analyze the task and provide an execution plan, relevant documentation links, terminal commands to run, and starter code if applicable.
    `;

    // Execute the GenAI call
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Task: ${taskTitle}\nContext: ${JSON.stringify(context)}` }] }],
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
    console.error('Workspace Assembly Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to assemble workspace' }, { status: 500 });
  }
}
