
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
    const fileStorageUrl = `https://storage.mock/${Date.now()}_${file.name}`;
    
    // Save to ingested_documents
    const docRef = adminDb.collection(`users/${userId}/ingested_documents`).doc();
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

    const prompt = `
System: You are an Unstructured Document Ingestion Pipeline. Your task is to process text chunks extracted from multi-page documents and convert them into an array of actionable milestones, absolute deadlines, and metadata.

Context Provided:
- Document Raw Text Extraction: ${documentExtractedText}
- Current Year Context: ${currentYear}
- Ingestion Source Type: ${sourceType}

Instructions:
1. Parse every deadline, invoice due date, or milestone event. Deduce absolute UTC timestamps.
2. Filter out conversational text, generic descriptions, and legal boilerplates.
3. For academic syllabi, map grading weights to task priority. For invoices, map dollar amounts and payment links/portals.
4. Output your response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "document_type": "${sourceType}",
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
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Save to ingestion_milestones
    const milestoneRef = adminDb.collection(`users/${userId}/ingestion_milestones`).doc();
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
