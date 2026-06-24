import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/calendar?error=no_code', request.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback'
    );

    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Normally you would save these tokens to your database for the user here
    // Example: await db.collection('users').doc(userId).update({ googleTokens: tokens });

    // Fetch initial calendar events to sync
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    console.log("Synced events from Google Calendar:", events?.length);

    // Redirect back to calendar with success status
    return NextResponse.redirect(new URL('/dashboard/calendar?sync=success', request.url));
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect(new URL('/dashboard/calendar?error=sync_failed', request.url));
  }
}
