import { adminDb } from '@/lib/firebase-admin';
import { genAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { userId, tasks } = await request.json();
    if (!userId || !tasks || tasks.length === 0) return Response.json({ success: true });

    const model = (genAI as any).models.generateContent;
    const prompt = `
      You are an elite productivity AI. I am going to give you a list of tasks. 
      Analyze their titles and descriptions. For each task, estimate realistic time (in minutes, e.g. 15, 30, 45, 60), 
      assign a priority (1 = Critical, 2 = High, 3 = Normal), and extract a short tag (e.g. "Work", "Errand", "Email").
      
      Tasks:
      ${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, description: t.description })))}
      
      Output ONLY a raw JSON array matching this exact schema:
      [
        { "id": "task_id", "estimatedMinutes": 30, "priority": 1, "tags": ["Urgent"] }
      ]
    `;

    const result = await model({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    let rawText = result.text.trim();
    if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    }

    const aiAnalysis = JSON.parse(rawText);

    // Update tasks in firestore
    const batch = adminDb.batch();
    aiAnalysis.forEach((analysis: any) => {
      const docRef = adminDb.collection('users').doc(userId).collection('tasks').doc(analysis.id);
      batch.update(docRef, {
        estimatedMinutes: analysis.estimatedMinutes,
        priority: analysis.priority,
        tags: analysis.tags,
        description: 'Analyzed by AI'
      });
    });

    await batch.commit();

    return Response.json({ success: true, updatedCount: aiAnalysis.length });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
