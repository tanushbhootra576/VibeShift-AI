import { adminDb } from '@/lib/firebase-admin';
import { genAI } from '@/lib/gemini';

const SIMULATION_SYSTEM_PROMPT = `
System: You are a Predictive Schedule Simulation Engine. Your task is to compute the chronological ripple effect of a user procrastinating a task, and predict exactly which future personal or weekend blocks will be overwritten as a consequence.

Instructions:
1. Shift the target task by the designated delta.
2. Chronologically re-evaluate all subsequent flexible tasks. If they collide with fixed events, cascade them to the next available open working hour block.
3. If the total workload overflows past standard working hours, allocate the remaining time directly into the user's Sacred/Personal Boundaries.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "simulation_triggered": true,
  "has_cascading_conflict": true,
  "total_spillover_minutes": 120,
  "modified_shadow_events": [
    {
      "original_event_id": "string_uuid",
      "title": "string",
      "shadowTimeSlotString": "string (e.g., Sat 10:00 AM - 12:00 PM)",
      "shadow_start_time": "YYYY-MM-DDTHH:MM:SSZ",
      "shadow_end_time": "YYYY-MM-DDTHH:MM:SSZ",
      "status_change": "shifted | encroached | safe",
      "visual_severity_weight": 0.85,
      "impact_explanation": "Shifting your presentation work forces your coding assignment into your Saturday Sleep-in slot."
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, dragged_task_id, new_proposed_start, delta_hours = 2 } = body;

    if (!userId || !dragged_task_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock fetching baseline calendar events and sacred boundaries
    const snapshot = await adminDb.collection('users').doc(userId).collection('tasks').limit(10).get();
    const tasks = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.data().title,
      estimatedMinutes: doc.data().estimatedMinutes || 60,
      deadline: doc.data().deadline?.toDate?.()?.toISOString() || doc.data().deadline || null,
    }));

    const sacredBoundariesSnap = await adminDb.collection('users').doc(userId).collection('sacred_boundaries').get();
    let sacredBoundaries = sacredBoundariesSnap.docs.map((doc: any) => doc.data());
    
    if (sacredBoundaries.length === 0) {
      sacredBoundaries = [
        { blockName: "Saturday Sleep-in", dayOfWeek: 6, startTimeLocal: "08:00", endTimeLocal: "12:00" },
        { blockName: "Gym Time", dayOfWeek: 3, startTimeLocal: "18:00", endTimeLocal: "19:30" }
      ];
    }

    const contextPrompt = `
Context Provided:
- Complete 7-Day Calendar Baseline Matrix: ${JSON.stringify(tasks)}
- The Task Being Modified: ${dragged_task_id}
- User's Tentative Modification: Postponed by ${delta_hours} hours.
- Defined Sacred/Personal Boundaries: ${JSON.stringify(sacredBoundaries)}
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: SIMULATION_SYSTEM_PROMPT + '\n' + contextPrompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch (e) {
      // Fallback
      result = {
        simulation_triggered: true,
        has_cascading_conflict: true,
        total_spillover_minutes: 60,
        modified_shadow_events: [
          {
            original_event_id: dragged_task_id,
            title: "Cascaded Task",
            shadowTimeSlotString: "Sat 10:00 AM",
            shadow_start_time: new Date().toISOString(),
            shadow_end_time: new Date(Date.now() + 3600000).toISOString(),
            status_change: "encroached",
            visual_severity_weight: 0.9,
            impact_explanation: "Forced into sacred boundary due to delay."
          }
        ]
      };
    }

    return Response.json({ success: true, data: result });

  } catch (error: any) {
    console.error('Cascade Simulation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
