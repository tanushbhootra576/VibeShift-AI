const fs = require('fs');
const path = require('path');

const apiPath = path.join('G:', 'vibe2ship', 'vibeshift', 'src', 'app', 'api', 'v1', 'delegation');

fs.mkdirSync(path.join(apiPath, 'initialize'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'session', '[id]', 'state'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'session', '[id]', 'approve'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'session', '[id]', 'abort'), { recursive: true });

// 1. INITIALIZE
fs.writeFileSync(path.join(apiPath, 'initialize', 'route.ts'), `
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

    const taskDoc = await adminDb.doc(\`users/\${userId}/tasks/\${taskId}\`).get();
    if (!taskDoc.exists) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    const task = taskDoc.data()!;

    // Mock Vault Fetch
    const vaultDocs = await adminDb.collection(\`users/\${userId}/vault_metadata\`)
       .where('provider_name', '==', serviceName)
       .get();
    
    const credentialsContext = vaultDocs.docs.map(doc => {
       const data = doc.data();
       return { type: data.credential_type, reference: data.kms_key_reference }; // In reality, we decrypt here
    });

    const prompt = \`
System: You are an advanced AI Browser Automation Engineer. Your job is to convert a high-level user execution task into a precise sequence of automation steps using browser locator frameworks.

Context Provided:
- Target Task: \${task.title}
- Target URL/Service: \${targetUrl}
- User Decrypted Vault Secrets (Mock): \${JSON.stringify(credentialsContext)}
- Session Context: \${new Date().toISOString()}

Instructions:
1. Generate a structured sequence of actions (Navigation, Input, Click, Wait) to navigate to the exact checkout, payment, or confirmation portal.
2. Formulate dynamic CSS/XPath selectors based on standard web patterns for the target service.
3. CRITICAL SAFETY RULE: You must STOP execution immediately before clicking any button containing text like "Pay Now", "Submit Order", "Confirm Booking", or "Purchase". The final step must always be a 'hold_for_approval' action.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "task_id": "\${taskId}",
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
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const executionPlan = JSON.parse(response.text || '{}');
    
    const sessionRef = adminDb.collection(\`users/\${userId}/delegation_sessions\`).doc();
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
`);

// 2. GET STATE
fs.writeFileSync(path.join(apiPath, 'session', '[id]', 'state', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id');
    const sessionId = params.id;
    if (!userId || !sessionId) return NextResponse.json({ error: 'Unauthorized or missing params' }, { status: 400 });

    const sessionDoc = await adminDb.doc(\`users/\${userId}/delegation_sessions/\${sessionId}\`).get();
    if (!sessionDoc.exists) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      
    return NextResponse.json({ state: sessionDoc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// 3. APPROVE
fs.writeFileSync(path.join(apiPath, 'session', '[id]', 'approve', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, biometric_signature, confirmed_amount } = await req.json();
    const sessionId = params.id;
    if (!userId || !sessionId || !biometric_signature) {
      return NextResponse.json({ error: 'Missing biometric signature or params' }, { status: 400 });
    }

    const sessionRef = adminDb.doc(\`users/\${userId}/delegation_sessions/\${sessionId}\`);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    
    // In reality, we'd send an unblock signal to the suspended Playwright instance here.
    // We simulate the Playwright worker clicking the final button and capturing the receipt.
    
    await sessionRef.update({
      current_status: 'completed',
      screenshot_url: 'https://storage.googleapis.com/vibeshift-mock/receipt.png', // Final receipt
      updated_at: new Date()
    });

    const task_id = sessionDoc.data()?.task_id;
    if (task_id) {
      await adminDb.doc(\`users/\${userId}/tasks/\${task_id}\`).update({
        status: 'completed'
      });
    }

    return NextResponse.json({ success: true, message: 'Execution completed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// 4. ABORT
fs.writeFileSync(path.join(apiPath, 'session', '[id]', 'abort', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await req.json();
    const sessionId = params.id;
    if (!userId || !sessionId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const sessionRef = adminDb.doc(\`users/\${userId}/delegation_sessions/\${sessionId}\`);
    await sessionRef.update({
      current_status: 'failed',
      updated_at: new Date()
    });

    return NextResponse.json({ success: true, message: 'Session aborted and destroyed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

console.log("Created Delegation API routes successfully.");
