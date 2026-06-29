import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return Response.json({ error: 'Missing transcript' }, { status: 400 });
    }

    let genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = genAI; // using latest 2.5

    const prompt = `
Extract tasks from this voice note transcript. Return ONLY valid JSON:

{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "estimatedMinutes": number,
      "priority": 1 | 2 | 3,
      "deadlineISO": "string | null"
    }
  ]
}

Today is ${new Date().toISOString()}.
Transcript: "${transcript}"
`;

    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const result = await genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = result.text || "";
    const clean = text.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return Response.json(parsed);
    } catch {
      return Response.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
