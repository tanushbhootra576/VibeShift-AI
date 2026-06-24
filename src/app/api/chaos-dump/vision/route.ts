import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getServerSession } from 'next-auth'; // or your custom auth session
// For hackathon, assuming auth logic allows or user is checked via middleware.

export async function POST(request: Request) {
  try {
    // Auth check normally happens here
    
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return Response.json({ error: 'Missing image data' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // using latest 2.5

    const prompt = `
You are a task extraction engine. Analyze this image which may contain:
- Handwritten notes
- Whiteboard content
- Sticky notes
- Printed task lists
- Meeting notes

Extract ALL actionable tasks and return ONLY valid JSON (no markdown, no explanation):

{
  "tasks": [
    {
      "title": "string — clear, action-oriented task title",
      "description": "string — any additional context from the image",
      "estimatedMinutes": number,
      "priority": 1 | 2 | 3,
      "deadlineHint": "string | null — any deadline mentioned (e.g. 'by Friday', 'June 28')",
      "deadlineISO": "string | null — convert deadlineHint to ISO date if possible, else null"
    }
  ],
  "imageContext": "string — brief description of what the image shows",
  "confidence": number // 0 to 1, how confident you are in the extraction
}

Priority scale: 1 = critical/urgent, 2 = important, 3 = normal
Estimate duration honestly — don't underestimate.
If deadlineHint exists, today is ${new Date().toISOString()}.
`;

    const result = await model.generateContent([
      { inlineData: { mimeType, data: imageBase64.replace(/^data:image\/\w+;base64,/, "") } },
      { text: prompt },
    ]);

    const text = result.response.text();

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return Response.json(parsed);
    } catch {
      return Response.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
