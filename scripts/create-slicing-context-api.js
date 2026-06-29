const fs = require('fs');
const path = require('path');

const apiPath = path.join('G:', 'vibe2ship', 'vibeshift', 'src', 'app', 'api', 'v1');

// Slicing Directories
fs.mkdirSync(path.join(apiPath, 'slicing', 'slice-task'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'slicing', '[id]', 'track-engagement'), { recursive: true });

// Context Directories
fs.mkdirSync(path.join(apiPath, 'context', 'geofence-breach'), { recursive: true });

// 1. SLICE TASK
fs.writeFileSync(path.join(apiPath, 'slicing', 'slice-task', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, taskId, taskTitle, taskDescription, workspaceTool } = await req.json();
    if (!userId || !taskId || !taskTitle) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const prompt = \`
System: You are a Behavioral Psychology Copilot. Your job is to defeat user procrastination caused by task-induced cognitive overwhelm. You take a massive, ambiguous project title and extract a singular, low-friction "Micro-Slice" action that takes less than 5 minutes to complete.

Context Provided:
- Overwhelming Task: \${taskTitle}
- Task Context/Notes: \${taskDescription || 'None'}
- Associated Workspace Tool: \${workspaceTool || 'Unknown'}
- User Procrastination Factor: High

Instructions:
1. Strip away the intimidating scope of the project. Do NOT suggest a multi-step milestone.
2. Isolate the absolute FIRST physical or digital friction-free action.
3. Formulate a direct, ultra-low-barrier notification prompt using psychological momentum design.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "task_id": "\${taskId}",
  "micro_slice_action": "string",
  "psychological_nudge_text": "string",
  "target_deep_link_url": "string",
  "estimated_time_seconds": 300,
  "momentum_follow_up_prompt": "string"
}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const sliceData = JSON.parse(response.text || '{}');

    const sliceRef = adminDb.collection(\`users/\${userId}/task_micro_slices\`).doc();
    await sliceRef.set({
      id: sliceRef.id,
      parent_task_id: taskId,
      user_id: userId,
      micro_slice_action: sliceData.micro_slice_action,
      nudge_text: sliceData.psychological_nudge_text,
      workspace_url: sliceData.target_deep_link_url,
      execution_status: 'untriggered',
      created_at: new Date()
    });

    return NextResponse.json({ success: true, slice: sliceData, sliceId: sliceRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// 2. TRACK ENGAGEMENT
fs.writeFileSync(path.join(apiPath, 'slicing', '[id]', 'track-engagement', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, interaction_type } = await req.json();
    if (!userId || !interaction_type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const sliceRef = adminDb.collection(\`users/\${userId}/task_micro_slices\`).doc(params.id);
    
    const updateData: any = {
      execution_status: interaction_type,
    };
    
    if (interaction_type === 'completed') {
      updateData.completed_at = new Date();
    }

    await sliceRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// 3. GEOFENCE BREACH
fs.writeFileSync(path.join(apiPath, 'context', 'geofence-breach', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Math utility to calculate distance between two coordinates in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, latitude, longitude, event_type, timestamp } = await req.json();
    if (!userId || !latitude || !longitude || !event_type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Cross-reference coordinates against \`user_context_zones\`
    const zonesSnap = await adminDb.collection(\`users/\${userId}/user_context_zones\`).get();
    let matchedZone = null;
    
    for (const doc of zonesSnap.docs) {
      const zone = doc.data();
      const dist = getDistanceInMeters(latitude, longitude, zone.latitude, zone.longitude);
      if (dist <= (zone.radius_meters || 100)) {
        matchedZone = { id: doc.id, ...zone };
        break;
      }
    }

    if (!matchedZone) {
      return NextResponse.json({ message: 'No matching context zones found for location.' });
    }

    // Process Ledger
    if (event_type === 'enter') {
      await adminDb.collection(\`users/\${userId}/user_context_history_ledger\`).add({
        user_id: userId,
        detected_zone_id: matchedZone.id,
        entered_at: new Date(timestamp),
        exited_at: null
      });

      // 2. Mock: Checks linked calendar to compute empty block duration
      const freeTimeMinutes = 120; // Hardcoded mock for free time

      // Query Pending Task Database
      const tasksSnap = await adminDb.collection(\`users/\${userId}/tasks\`)
        .where('status', '==', 'pending')
        .limit(10)
        .get();
        
      const pendingTasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (pendingTasks.length === 0) {
        return NextResponse.json({ message: 'No pending tasks to hook.' });
      }

      // 3. Ambient Context Router Prompt
      const prompt = \`
System: You are an Ambient Context Router. Your job is to match a user's live physical/digital environment parameters against their highest priority tasks to find perfect "windows of opportunity." You turn dead time into productive momentum without nagging.

Context Provided:
- Current Trigger Event: Location Boundary Breach (Geofence Enter)
- Live Location Details: \${matchedZone.zone_name}
- Available Time Window before next block: \${freeTimeMinutes} minutes
- Pending Task Pipeline: \${JSON.stringify(pendingTasks)}

Instructions:
1. Filter the task pipeline for items that match the current environment context.
2. Ensure the task can be safely wrapped within the user's available time.
3. Draft a conversational, highly localized action hook.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "should_hook_user": true,
  "matched_task_id": "string_uuid",
  "hook_notification_title": "string",
  "hook_notification_body": "string",
  "urgency_weight": 0.92
}
      \`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const hookData = JSON.parse(response.text || '{}');

      // 4. Return push notification payload if should_hook_user
      if (hookData.should_hook_user) {
         // Log the hook creation or fire real push notification to mobile OS
         return NextResponse.json({ success: true, hooked: true, hookData });
      }

    } else if (event_type === 'exit') {
      // Find the active ledger and close it
      const ledgerSnap = await adminDb.collection(\`users/\${userId}/user_context_history_ledger\`)
        .where('detected_zone_id', '==', matchedZone.id)
        .where('exited_at', '==', null)
        .limit(1)
        .get();

      if (!ledgerSnap.empty) {
        const ledgerDoc = ledgerSnap.docs[0];
        await ledgerDoc.ref.update({ exited_at: new Date(timestamp) });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

console.log("Created Micro-Slicing and Contextual Hooking API routes successfully.");
