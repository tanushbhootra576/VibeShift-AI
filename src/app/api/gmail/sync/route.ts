import { getValidAccessToken } from '@/lib/google-auth';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    const accessToken = await getValidAccessToken(userId);

    // 1. Fetch recent unread messages from Gmail
    const messagesRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!messagesRes.ok) {
      const err = await messagesRes.json();
      throw new Error(`Gmail API Error: ${err.error?.message || JSON.stringify(err)}`);
    }
    const { messages } = await messagesRes.json();
    if (!messages || messages.length === 0) {
      return Response.json({ success: true, tasks: [], message: 'No new emails to process.' });
    }
    // 2. Fetch full email content for each message
    const emailContents = await Promise.all(
      messages.map(async (msg: { id: string }) => {
        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        
        let body = '';
        if (data.payload?.parts) {
          const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        } else if (data.payload?.body?.data) {
          body = Buffer.from(data.payload.body.data, 'base64').toString('utf-8');
        }        
        const subjectHeader = data.payload?.headers?.find((h: any) => h.name === 'Subject');
        const senderHeader = data.payload?.headers?.find((h: any) => h.name === 'From');
        
        return {
          id: msg.id,
          subject: subjectHeader ? subjectHeader.value : 'No Subject',
          sender: senderHeader ? senderHeader.value : 'Unknown Sender',
          body: body.substring(0, 1500) // Truncate to save tokens
        };
      })
    );

    // 3. Process with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    

    const prompt = `
You are an AI assistant helping to extract actionable commitments (tasks, deadlines, meetings, bills, interviews) from a list of emails.
Here are the emails:
${JSON.stringify(emailContents, null, 2)}

For each email, if it contains an actionable commitment, extract it. Return ONLY valid JSON in this format:
{
  "tasks": [
    {
      "title": "string - Clear, action-oriented task title",
      "description": "string - Context from the email",
      "estimatedMinutes": number,
      "priority": 1 (critical) | 2 (important) | 3 (normal),
      "deadlineHint": "string | null - extracted deadline phrase",
      "sourceEmailId": "string - the ID of the email"    }
  ]
}

If no actionable tasks are found, return {"tasks": []}. Today is ${new Date().toISOString()}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    const text = response.text || "";
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // 4. Save extracted tasks to Firestore
    const savedTasks = [];
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      for (const task of parsed.tasks) {
        const docRef = adminDb.collection('users').doc(userId).collection('tasks').doc();
        const taskData = {
          ...task,
          id: docRef.id,
          status: 'pending',
          sourceType: 'gmail',
          createdAt: new Date(),
          updatedAt: new Date(),
          driftVelocity: 1.0,
          actualMinutes: []
        };
        await docRef.set(taskData);
        savedTasks.push(taskData);
        
        // Optional: Mark email as read in Gmail or apply label so we don't process it again
        // We'll skip this to keep it simple for now, relying on 'is:unread' and users reading their emails.
      }
    }
    return Response.json({ success: true, tasks: savedTasks });
    
  } catch (error: any) {
    console.error('Gmail Sync Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
