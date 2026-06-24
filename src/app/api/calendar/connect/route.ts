import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback'
);

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    // If no real credentials, redirect back to dashboard with a mock success flag
    return NextResponse.redirect(new URL('/dashboard/calendar?sync=mock_success', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }

  // Generate a url that asks permissions for Google Calendar scope
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return NextResponse.redirect(url);
}
