
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Simple mock of email parsing hitting the same logic as upload
  return NextResponse.json({ success: true, message: 'Email parsed and queued' });
}
