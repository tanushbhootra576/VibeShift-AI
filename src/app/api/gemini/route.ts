import { GoogleGenerativeAI } from '@google/generative-ai';
import { tools } from '@/lib/gemini';
import { executeTool } from '@/lib/gemini-executor';
import { adminDb } from '@/lib/firebase-admin';
import { User, Task } from '@/types';
// In a real app, import getServerSession. For hackathon, we assume userId is passed or mock it.

function buildSystemPrompt(user: User, tasks: Task[]): string {
  const now = new Date().toLocaleString('en-IN', { timeZone: user?.preferences?.timezone || 'Asia/Kolkata' });
  const overdue = tasks.filter(t => new Date(t.deadline.toDate()) < new Date());
  const critical = tasks.filter(t => t.driftVelocity < -0.5);

  return `
You are VibeShift AI, an autonomous productivity agent for ${user?.displayName || 'User'}.

## Current Context
- Time: ${now}
- User timezone: ${user?.preferences?.timezone || 'Asia/Kolkata'}
- Work hours: ${user?.preferences?.workStartHour || 9}:00 – ${user?.preferences?.workEndHour || 18}:00
- Active tasks: ${tasks.length}
- Overdue tasks: ${overdue.length} (${overdue.map(t => t.title).join(', ')})
- Critical drift tasks (DDV < -0.5): ${critical.length} (${critical.map(t => t.title).join(', ')})
- Current streak: ${user?.streak || 0} days

## Your Behavior Rules
1. ALWAYS prefer action over advice. If a task needs to be rescheduled, call rescheduleTask() — don't just suggest it.
2. Chain tool calls when needed. After analyzeTaskLoad(), you may immediately call rescheduleTask() if the load is critical.
3. Be concise in text responses. Users are busy. 1–2 sentences max unless they explicitly ask for more.
4. Communicate what you DID, not what you WILL do. After calling a tool, tell the user what you just did.
5. Never ask for confirmation before taking autonomous actions — but always mention that they can undo.
6. If fetchContextDoc() is relevant to the user's task, call it proactively.
7. Prioritize tasks by: (a) deadline proximity, (b) DDV severity, (c) user-set priority.

Always respond in the user's language. Be their proactive partner, not their assistant.
`.trim();
}

export async function POST(request: Request) {
  try {
    const { messages, context, userId } = await request.json();
    
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const userDoc = await adminDb.collection('users').doc(userId).get();
    const user = userDoc.data() as User;
    
    const tasksSnap = await adminDb.collection('users').doc(userId).collection('tasks').where('status', '!=', 'completed').get();
    const tasks = tasksSnap.docs.map((d: any) => d.data() as Task);

    const systemPrompt = buildSystemPrompt(user, tasks);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // Using latest version
      tools,
      systemInstruction: systemPrompt,
    });

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Fire and forget loop so response returns stream immediately
    runGeminiLoop(model, messages, userId, writer, encoder).catch(console.error);

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function runGeminiLoop(model: any, messages: any[], userId: string, writer: any, encoder: any) {
  try {
    const chat = model.startChat({ history: messages.slice(0, -1) });
    let continueLoop = true;
    let currentMessage = messages[messages.length - 1].content;

    while (continueLoop) {
      const result = await chat.sendMessageStream(currentMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
        }
      }

      const response = await result.response;
      const functionCalls = response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        continueLoop = false;
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } else {
        const toolResults = await Promise.all(
          functionCalls.map(async (fc: any) => {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'tool_start', tool: fc.name })}\n\n`));
            const output = await executeTool(fc.name, fc.args, userId);
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'tool_end', tool: fc.name, result: output })}\n\n`));
            return { functionResponse: { name: fc.name, response: { output } } };
          })
        );

        // In Gemini API, we send the function responses back as the next message
        currentMessage = toolResults as any; 
      }
    }
  } catch (err: any) {
    console.error('Gemini loop error:', err);
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`));
  } finally {
    await writer.close();
  }
}
