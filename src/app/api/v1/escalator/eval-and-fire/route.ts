import { adminDb } from '@/lib/firebase-admin';
import { genAI } from '@/lib/gemini';
import { triggerVoiceEscalation } from '@/services/escalatorVoiceService';

const MICRO_NUDGE_PROMPT = `
System: You are an assertive behavioral intervention coach. The user is actively procrastinating on a critical assignment by browsing distracting sites. Generate an ultra-short, persuasive overlay micro-nudge designed to bypass resistance and guide them to a 3-minute entry action. Do not use generic placeholders.

Output Format (Strict JSON):
{
  "headline": "string (e.g., 'Hold on, Alex.')",
  "subheading": "string (e.g., 'You have a pitch deck due in 90 minutes. Let’s spend just 3 minutes setting up the template.')",
  "cta_text": "string (e.g., 'Start 3-Minute Sprint')"
}
`;

export async function POST(request: Request) {
  try {
    const { userId, taskId, phoneOverride } = await request.json();

    if (!userId || !taskId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Task Info
    const taskDoc = await adminDb.collection('users').doc(userId).collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) return Response.json({ error: 'Task not found' }, { status: 404 });
    const task = taskDoc.data();
    
    // 2. Fetch User Info (for phone and name)
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const user = userDoc.data() || { displayName: 'Operator' };
    const userName = user.displayName?.split(' ')[0] || 'Operator';
    const userPhone = phoneOverride || user.phoneNumber || '+1234567890'; // Use override if provided for demo

    // 3. Fetch or Create Escalation Record
    const escQuery = await adminDb.collection('users').doc(userId).collection('task_escalations')
      .where('taskId', '==', taskId)
      .limit(1)
      .get();
      
    let escalationRef;
    let currentLevel = 0;

    if (escQuery.empty) {
      escalationRef = adminDb.collection('users').doc(userId).collection('task_escalations').doc();
      await escalationRef.set({
        taskId,
        userId,
        currentLevel: 0,
        lastEscalatedAt: new Date(),
        isResolved: false
      });
    } else {
      escalationRef = escQuery.docs[0].ref;
      currentLevel = escQuery.docs[0].data().currentLevel;
    }

    // 4. Calculate Time Remaining (Assume deadline is provided in task)
    let minutesLeft = 120; // Default mock
    if (task?.deadline) {
      const deadlineDate = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
      minutesLeft = Math.floor((deadlineDate.getTime() - Date.now()) / 60000);
    }
    
    // Force testing boundaries
    if (minutesLeft > 120) minutesLeft = 90; 

    // 5. Evaluate Next Level
    let newLevel = currentLevel;
    let actionPayload: any = { type: 'NONE' };

    if (currentLevel < 1 && minutesLeft <= 120) {
      // Level 1: Nudge
      newLevel = 1;
      actionPayload = {
        type: 'NUDGE',
        message: `Your task "${task?.title}" is due soon. Open the workspace now?`
      };
    } else if (currentLevel < 2 && minutesLeft <= 90) {
      // Level 2: Distraction Hijack
      newLevel = 2;
      
      const context = `Context:\n- User Name: ${userName}\n- Overwhelming Task: ${task?.title}\n- Time Remaining: ${minutesLeft} minutes`;
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: MICRO_NUDGE_PROMPT + '\n' + context,
        config: { responseMimeType: 'application/json' }
      });
      
      let hijackData = {};
      try {
        hijackData = JSON.parse(response.text || '{}');
      } catch (e) {
        hijackData = { headline: `Hold on, ${userName}.`, subheading: `You have ${task?.title} due.`, cta_text: `Start Sprint` };
      }

      actionPayload = {
        type: 'HIJACK',
        data: hijackData
      };
    } else if (currentLevel < 3 && minutesLeft <= 30) {
      // Level 3: Twilio Voice Call
      newLevel = 3;
      const twilioRes = await triggerVoiceEscalation(userPhone, userName, task?.title || 'task', minutesLeft);
      
      actionPayload = {
        type: 'VOICE_CALL',
        status: twilioRes
      };
    } else if (currentLevel === 3) {
      actionPayload = { type: 'MAX_ESCALATION_REACHED' };
    }

    // Update level if changed
    if (newLevel !== currentLevel) {
      await escalationRef.update({
        currentLevel: newLevel,
        lastEscalatedAt: new Date()
      });
    }

    return Response.json({ 
      success: true, 
      previousLevel: currentLevel, 
      newLevel, 
      action: actionPayload 
    });

  } catch (error: any) {
    console.error('Escalator Engine Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
