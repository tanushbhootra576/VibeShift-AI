import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return Response.json({ error: 'Missing image data' }, { status: 400 });
    }

    // 1. OFFLINE OCR: Extract text using Tesseract.js to bypass Google Vision 503s
    const bufferData = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const { data: { text: extractedText } } = await Tesseract.recognize(
      bufferData,
      'eng',
      { logger: m => console.log(m) }
    );

    if (!extractedText.trim()) {
      return Response.json({ error: 'No text detected in the image.' }, { status: 400 });
    }

    // 2. TEXT FORMATTING: Send the raw text to a highly-available text-only model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', // Lite is highly available and perfect for text structuring
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are a task extraction engine. I have extracted the raw text from an image (whiteboard/notes) via OCR.
Raw OCR Text:
"""
${extractedText}
"""

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

    const result = await model.generateContent(prompt);
    
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Response.json(parsed);

  } catch (error: any) {
    console.error("Gemini/Tesseract API Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
