import { adminDb } from '@/lib/firebase-admin';
import { getValidAccessToken } from '@/lib/google-auth';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    // 1. Fetch pending tasks
    const tasksSnap = await adminDb.collection('users').doc(userId).collection('tasks')
      .where('status', '==', 'pending')
      .get();
      
    const tasks = tasksSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    // 2. Fetch today's calendar events
    let calendarEvents = [];
    try {
      const accessToken = await getValidAccessToken(userId);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        calendarEvents = data.items || [];
      }
    } catch (e) {
      console.warn("Could not fetch calendar events for planner", e);
    }
    // 3. Generate planner with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    

    const prompt = `
You are an AI Daily Planner. Given the user's tasks and today's calendar events, generate a prioritized schedule for today.
Tasks: ${JSON.stringify(tasks, null, 2)}
Calendar Events: ${JSON.stringify(calendarEvents.map((e: any) => ({ summary: e.summary, start: e.start, end: e.end })), null, 2)}

Return ONLY valid JSON in this format:
{
  "topPriorities": [
    { "title": "string", "reason": "string" }
  ],
  "schedule": [
    {
      "time": "string (e.g. 09:00 AM - 10:00 AM)",
      "activity": "string (event or task)",
      "type": "event" | "task"
    }
  ]
}
The schedule should weave tasks into free time blocks between calendar events. Assume the workday is 9 AM to 6 PM.
Today is ${new Date().toISOString()}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    const text = response.text || "";
    const clean = text.replace(/```json|```/g, '').trim();
    const planner = JSON.parse(clean);

    return Response.json({ success: true, planner });

  } catch (error: any) {
    console.error('Planner Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
