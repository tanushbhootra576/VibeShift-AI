const fs = require('fs');
const path = require('path');

const apiPath = path.join('G:', 'vibe2ship', 'vibeshift', 'src', 'app', 'api', 'v1');

// 1. Ingest Directories
fs.mkdirSync(path.join(apiPath, 'ingest', 'upload'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'ingest', 'email-webhook'), { recursive: true });

// 2. Ambient Directories
fs.mkdirSync(path.join(apiPath, 'ambient', 'stream'), { recursive: true });
fs.mkdirSync(path.join(apiPath, 'ambient', 'queue', '[id]', 'resolve'), { recursive: true });

// Part 1: INGEST UPLOAD
fs.writeFileSync(path.join(apiPath, 'ingest', 'upload', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId') as string;
    const sourceType = formData.get('source_type') as string;
    const file = formData.get('file') as File;

    if (!userId || !sourceType || !file) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Mock file upload to S3/Blob storage
    const fileStorageUrl = \`https://storage.mock/\${Date.now()}_\${file.name}\`;
    
    // Save to ingested_documents
    const docRef = adminDb.collection(\`users/\${userId}/ingested_documents\`).doc();
    await docRef.set({
      id: docRef.id,
      user_id: userId,
      source_type: sourceType,
      file_storage_url: fileStorageUrl,
      processing_status: 'uploaded',
      created_at: new Date()
    });

    // Mock OCR Text Extraction
    const documentExtractedText = "Mock extracted text from " + file.name;
    const currentYear = new Date().getFullYear();

    const prompt = \`
System: You are an Unstructured Document Ingestion Pipeline. Your task is to process text chunks extracted from multi-page documents and convert them into an array of actionable milestones, absolute deadlines, and metadata.

Context Provided:
- Document Raw Text Extraction: \${documentExtractedText}
- Current Year Context: \${currentYear}
- Ingestion Source Type: \${sourceType}

Instructions:
1. Parse every deadline, invoice due date, or milestone event. Deduce absolute UTC timestamps.
2. Filter out conversational text, generic descriptions, and legal boilerplates.
3. For academic syllabi, map grading weights to task priority. For invoices, map dollar amounts and payment links/portals.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "document_type": "\${sourceType}",
  "confidence_score": 0.98,
  "extracted_entities": {
    "organization_or_institution": "string",
    "total_amount_due": 0.00
  },
  "generated_tasks": [
    {
      "title": "string",
      "description": "string",
      "due_date_utc": "YYYY-MM-DDTHH:MM:SSZ",
      "priority_weight": "low | medium | high",
      "extracted_metadata": {}
    }
  ]
}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Save to ingestion_milestones
    const milestoneRef = adminDb.collection(\`users/\${userId}/ingestion_milestones\`).doc();
    await milestoneRef.set({
      id: milestoneRef.id,
      document_id: docRef.id,
      user_id: userId,
      computed_task_payload: parsedData,
      is_synchronized_to_calendar: false,
      created_at: new Date()
    });

    // Update document status
    await docRef.update({ processing_status: 'succeeded' });

    return NextResponse.json({ success: true, milestoneId: milestoneRef.id, payload: parsedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// INGEST EMAIL WEBHOOK
fs.writeFileSync(path.join(apiPath, 'ingest', 'email-webhook', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Simple mock of email parsing hitting the same logic as upload
  return NextResponse.json({ success: true, message: 'Email parsed and queued' });
}
`);


// Part 2: AMBIENT STREAM (Mocked as POST for chunk ingestion)
fs.writeFileSync(path.join(apiPath, 'ambient', 'stream', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, sessionId, liveTranscriptChunk, meetingTitle } = await req.json();
    if (!userId || !liveTranscriptChunk) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const currentTimeUtc = new Date().toISOString();

    const prompt = \`
System: You are an Ambient Audio Intelligence Streamer. You process streaming transcriptions originating from live meetings or study groups. Your task is to detect verbal agreements, explicit declarations of intent, or assigned deadlines, and formulate structured system task suggestions.

Context Provided:
- Live Transcript Chunk: \${liveTranscriptChunk}
- Meeting Metadata: \${meetingTitle || 'Focus Session'}, Current Time: \${currentTimeUtc}

Instructions:
1. Isolate instances where the account owner (\${userName || 'The User'}) explicitly says they will perform a task, or when someone assigns a task to them and they verbally accept it.
2. Disregard exploratory conversation, casual chatter, or ideas that do not result in a clear commitment.
3. Formulate a short, punchy task name, deduce the targeted completion timeframe, and clip the exact quote as context.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "action_item_detected": true,
  "confidence_rating": 0.91,
  "task_payload": {
    "title": "string",
    "implied_deadline": "YYYY-MM-DDTHH:MM:SSZ",
    "verbatim_context_quote": "string",
    "mentioned_collaborators": ["string"]
  }
}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = JSON.parse(response.text || '{}');

    if (parsedData.action_item_detected && parsedData.task_payload) {
      const queueRef = adminDb.collection(\`users/\${userId}/detected_action_queue\`).doc();
      await queueRef.set({
        id: queueRef.id,
        session_id: sessionId || null,
        user_id: userId,
        proposed_title: parsedData.task_payload.title,
        context_quote: parsedData.task_payload.verbatim_context_quote,
        target_deadline: new Date(parsedData.task_payload.implied_deadline),
        review_status: 'pending_review',
        created_at: new Date()
      });

      return NextResponse.json({ success: true, itemDetected: true, queueId: queueRef.id, payload: parsedData.task_payload });
    }

    return NextResponse.json({ success: true, itemDetected: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// RESOLVE QUEUE
fs.writeFileSync(path.join(apiPath, 'ambient', 'queue', '[id]', 'resolve', 'route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, action, override_title } = await req.json();
    if (!userId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const queueRef = adminDb.collection(\`users/\${userId}/detected_action_queue\`).doc(params.id);
    
    // Update review status
    await queueRef.update({
      review_status: action === 'accept' ? 'accepted' : action === 'discard' ? 'discarded' : 'modified',
      ...(override_title && { proposed_title: override_title })
    });

    if (action === 'accept') {
       // Ideally we map this to the core production tasks here
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

console.log("Created Ingestion and Ambient API routes successfully.");
