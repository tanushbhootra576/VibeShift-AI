import { GoogleGenAI } from '@google/genai';


export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return Response.json({ error: 'Missing image data' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const prompt = `
You are a task extraction engine. I have an image (whiteboard/notes).
Extract ALL actionable tasks from this text and return ONLY valid JSON:

{
  "tasks": [
    {
      "title": "string — clear, action-oriented task title",
      "description": "string — context from the text",
      "estimatedMinutes": number,
      "priority": 1 | 2 | 3,
      "deadlineHint": "string | null — any deadline mentioned",
      "deadlineISO": "string | null"
    }
  ],
  "imageContext": "string — brief description of what the text implies",
  "confidence": number
}

Priority scale: 1 = critical, 2 = important, 3 = normal.
Today is ${new Date().toISOString()}.
`;

    const result = await ai.models.generateContent({ 
      model: 'gemini-2.0-flash', 
      contents: [
        prompt, 
        { inlineData: { data: imageBase64.replace(/^data:image\/\w+;base64,/, ""), mimeType } }
      ] 
    });
    
    const text = result.text || "";
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Response.json(parsed);

  } catch (error: any) {
    console.error("Gemini/Tesseract API Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
