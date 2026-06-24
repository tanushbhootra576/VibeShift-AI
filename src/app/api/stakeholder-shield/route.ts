import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { findFreeSlots } from '@/lib/calendar-server';
import { Task, User } from '@/types';

export async function POST(request: Request) {
  try {
    const { taskId, userId } = await request.json(); // Usually userId comes from session

    if (!taskId || !userId) {
      return Response.json({ error: 'Missing taskId or userId' }, { status: 400 });
    }

    const taskDoc = await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) return Response.json({ error: 'Task not found' }, { status: 404 });
    const task = taskDoc.data() as Task;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const user = userDoc.data() as User;

    // Find best available slot after current deadline
    const newSlotOptions = await findFreeSlots(userId, task.estimatedMinutes, 120); // 5 days
    const proposedSlot = newSlotOptions.length > 0 ? newSlotOptions[0] : null;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Draft a professional, warm email requesting a deadline extension.
Tone: Accountable, proactive, solution-focused. Never make excuses.
Length: 4–6 sentences. Professional but human.

Details:
- Sender: ${user.displayName || 'Me'}
- Recipient: ${task.stakeholderEmail || 'the stakeholder'}
- Task/Project: ${task.title}
- Current deadline: ${task.deadline ? new Date((task.deadline as any).seconds * 1000).toLocaleDateString('en-IN') : 'Unknown'}
- Proposed new deadline: ${proposedSlot ? new Date(proposedSlot.start).toLocaleDateString('en-IN') : '[NEW DATE]'}
- Context: task is at high risk of missing deadline due to unexpected friction, but we are actively executing on a recovery plan.

Return ONLY valid JSON:
{
  "subject": "string",
  "body": "string — use \\n for line breaks",
  "proposedDeadlineISO": "string"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    
    try {
      const email = JSON.parse(clean);
      return Response.json({
        ...email,
        toEmail: task.stakeholderEmail,
        taskId,
      });
    } catch {
      return Response.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
