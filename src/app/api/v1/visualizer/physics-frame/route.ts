import { adminDb } from '@/lib/firebase-admin';
import { genAI } from '@/lib/gemini';

const SYSTEM_PROMPT = `
System: You are a UI Physics Engine Configuration Coordinator. Your task is to ingest a collection of calendar tasks and translate their real-world time-tracking parameters into an absolute physics property state array to drive a 2D Canvas vector simulation.

Instructions:
1. Map task duration directly to spatial radius and mass: Radius = Math.sqrt(duration_minutes) * scaling_factor.
2. Calculate the gravity pull variable based on deadline proximity. Scale the urgency multiplier exponentially as T-minus approaches zero.
3. Determine visual grid line distortion parameters. If tasks are stacked closely, calculate a 'collision_warning' state.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "viewport_y_scale_ratio": 1.5,
  "nodes": [
    {
      "task_id": "string_uuid",
      "initial_x": 150,
      "anchor_y": 420,
      "mass": 45.0,
      "radius": 30,
      "gravitational_charge": 8.5,
      "spring_constant_k": 0.12,
      "color_gradient": {
        "start": "#FF4D4D",
        "end": "#990000"
      },
      "requires_collision_warning": true
    }
  ],
  "global_grid_warp_threshold": 0.65
}
`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const viewportHeight = searchParams.get('viewportHeight') || '800';

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch tasks
    const snapshot = await adminDb.collection('users').doc(userId).collection('tasks').get();
    const tasks = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.data().title,
      estimatedMinutes: doc.data().estimatedMinutes || 30,
      deadline: doc.data().deadline?.toDate?.()?.toISOString() || doc.data().deadline || null,
      status: doc.data().status
    })).filter((t: any) => t.status !== 'completed');

    // Context for LLM
    const prompt = `${SYSTEM_PROMPT}\n\nContext Provided:
- Active Task Collection: ${JSON.stringify(tasks, null, 2)}
- Current App Viewport Height: ${viewportHeight} (representing 24 hours)
- Timeline Axis Direction: Vertical Y-Axis (0 = Midnight, Max = 11:59 PM)`;

    // Call Gemini
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let config;
    try {
      config = JSON.parse(response.text || '{}');
    } catch (e) {
      // Fallback simple calc if LLM fails
      config = {
        viewport_y_scale_ratio: 1.0,
        nodes: tasks.map((t: any, i: number) => ({
          task_id: t.id,
          initial_x: 200,
          anchor_y: 100 + i * 100,
          mass: t.estimatedMinutes || 30,
          radius: Math.sqrt(t.estimatedMinutes || 30) * 5,
          gravitational_charge: 5,
          spring_constant_k: 0.1,
          requires_collision_warning: false
        })),
        global_grid_warp_threshold: 0.5
      };
    }

    return Response.json({ success: true, data: config });

  } catch (error: any) {
    console.error('Visualizer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
