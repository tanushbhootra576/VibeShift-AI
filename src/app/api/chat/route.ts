import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are VibeShift AI, a proactive productivity partner.
You help users break down large goals into actionable micro-tasks. 
If the user asks to schedule or break down a task, output your response in JSON format containing two fields:
{
  "message": "A conversational message explaining what you did",
  "tasks": [
    { "id": "uuid", "time": "14:00 - 14:45", "title": "Sub-task title", "status": "action" }
  ]
}
If they are just chatting, output normal text. Try to output JSON if they mention tasks.`,
      }
    });

    // Try to parse JSON if the response looks like JSON
    let responseText = response.text || "";
    let tasks = null;
    let message = responseText;

    if (responseText.includes("{") && responseText.includes("}")) {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message && parsed.tasks) {
            message = parsed.message;
            tasks = parsed.tasks;
          }
        }
      } catch (e) {
        // Fallback to raw text
      }
    }

    return NextResponse.json({ response: message, newTasks: tasks });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
