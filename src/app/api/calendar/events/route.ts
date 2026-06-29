import { getValidAccessToken } from '@/lib/google-auth';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    const accessToken = await getValidAccessToken(userId);
    const timeMin = new Date().toISOString();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Calendar API Error: ${err.error?.message || JSON.stringify(err)}`);
    }    const data = await res.json();
    return Response.json({ success: true, events: data.items || [] });
  } catch (error: any) {
    console.error('Calendar Fetch Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
