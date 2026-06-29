
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { taskId, userId, serviceName, targetUrl } = await req.json();
    if (!taskId || !userId || !serviceName || !targetUrl) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const taskDoc = await adminDb.doc(`users/${userId}/tasks/${taskId}`).get();
    if (!taskDoc.exists) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    const task = taskDoc.data()!;

    // Mock Vault Fetch
    const vaultDocs = await adminDb.collection(`users/${userId}/vault_metadata`)
       .where('provider_name', '==', serviceName)
       .get();
    
    const credentialsContext = vaultDocs.docs.map((doc: any) => {
       const data = doc.data();
       return { type: data.credential_type, reference: data.kms_key_reference }; // In reality, we decrypt here
    });

    const prompt = `
System: You are an advanced AI Browser Automation Engineer. Your job is to convert a high-level user execution task into a precise sequence of automation steps using browser locator frameworks.

Context Provided:
- Target Task: ${task.title}
- Target URL/Service: ${targetUrl}
- User Decrypted Vault Secrets (Mock): ${JSON.stringify(credentialsContext)}
- Session Context: ${new Date().toISOString()}

Instructions:
1. Generate a structured sequence of actions (Navigation, Input, Click, Wait) to navigate to the exact checkout, payment, or confirmation portal.
2. Formulate dynamic CSS/XPath selectors based on standard web patterns for the target service.
3. CRITICAL SAFETY RULE: You must STOP execution immediately before clicking any button containing text like "Pay Now", "Submit Order", "Confirm Booking", or "Purchase". The final step must always be a 'hold_for_approval' action.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "task_id": "${taskId}",
  "can_execute_autonomously": true,
  "automation_steps": [
    {
      "step_number": 1,
      "action": "navigate",
      "target_url": "string"
    }
  ],
  "estimated_cost_or_amount": "string",
  "error_fallback_plan": "string"
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const executionPlan = JSON.parse(response.text || '{}');
    
    const sessionRef = adminDb.collection(`users/${userId}/delegation_sessions`).doc();
    await sessionRef.set({
      id: sessionRef.id,
      task_id: taskId,
      user_id: userId,
      service_name: serviceName,
      current_status: 'interactive_ready', // skipping 'queued' directly to 'interactive_ready' for mock purposes
      execution_plan: executionPlan,
      current_step_index: executionPlan.automation_steps ? executionPlan.automation_steps.length - 1 : 0,
      screenshot_url: 'https://storage.googleapis.com/vibeshift-mock/checkout_preview.png',
      final_amount_detected: executionPlan.estimated_cost_or_amount,
      created_at: new Date(),
      updated_at: new Date()
    });

    return NextResponse.json({ success: true, sessionId: sessionRef.id, plan: executionPlan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
