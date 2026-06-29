
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

    // 1. Cross-reference coordinates against `user_context_zones`
    const zonesSnap = await adminDb.collection(`users/${userId}/user_context_zones`).get();
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
      await adminDb.collection(`users/${userId}/user_context_history_ledger`).add({
        user_id: userId,
        detected_zone_id: matchedZone.id,
        entered_at: new Date(timestamp),
        exited_at: null
      });

      // 2. Mock: Checks linked calendar to compute empty block duration
      const freeTimeMinutes = 120; // Hardcoded mock for free time

      // Query Pending Task Database
      const tasksSnap = await adminDb.collection(`users/${userId}/tasks`)
        .where('status', '==', 'pending')
        .limit(10)
        .get();
        
      const pendingTasks = tasksSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      if (pendingTasks.length === 0) {
        return NextResponse.json({ message: 'No pending tasks to hook.' });
      }

      // 3. Ambient Context Router Prompt
      const prompt = `
System: You are an Ambient Context Router. Your job is to match a user's live physical/digital environment parameters against their highest priority tasks to find perfect "windows of opportunity." You turn dead time into productive momentum without nagging.

Context Provided:
- Current Trigger Event: Location Boundary Breach (Geofence Enter)
- Live Location Details: ${matchedZone.zone_name}
- Available Time Window before next block: ${freeTimeMinutes} minutes
- Pending Task Pipeline: ${JSON.stringify(pendingTasks)}

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
      `;

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
      const ledgerSnap = await adminDb.collection(`users/${userId}/user_context_history_ledger`)
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
