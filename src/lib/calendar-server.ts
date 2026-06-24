import { getValidAccessToken } from './google-auth';
import { adminDb } from './firebase-admin';

export interface CalendarEventInput {
  title: string;
  description: string;
  startISO: string;
  endISO: string;
  taskId: string;
  type: 'deadline' | 'focus_block';
  attendeeEmails?: string[];
}

export async function createCalendarEvent(
  userId: string,
  input: CalendarEventInput
): Promise<string> {
  const accessToken = await getValidAccessToken(userId);

  const event = {
    summary: input.type === 'deadline'
      ? `⚡ DEADLINE: ${input.title}`
      : `🎯 Focus: ${input.title}`,
    description: `${input.description}\n\n[VibeShift AI] taskId: ${input.taskId}`,
    start: { dateTime: input.startISO, timeZone: 'Asia/Kolkata' },
    end:   { dateTime: input.endISO,   timeZone: 'Asia/Kolkata' },
    colorId: input.type === 'deadline' ? '11' : '9', // red vs blue
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 5 },
      ],
    },
    attendees: input.attendeeEmails?.map(email => ({ email })),
    extendedProperties: {
      private: { vibeShiftTaskId: input.taskId, vibeShiftType: input.type },
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  const created = await response.json();
  if (!response.ok) {
    throw new Error('Failed to create calendar event: ' + JSON.stringify(created));
  }
  return created.id;
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  startISO: string,
  endISO: string
) {
  const accessToken = await getValidAccessToken(userId);
  
  // First get the event to keep other properties intact
  const getResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const event = await getResponse.json();

  event.start = { dateTime: startISO, timeZone: 'Asia/Kolkata' };
  event.end = { dateTime: endISO, timeZone: 'Asia/Kolkata' };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update calendar event');
  }
}

export async function findFreeSlots(
  userId: string,
  durationMinutes: number,
  withinHours: number = 48
): Promise<{ start: string; end: string }[]> {
  const accessToken = await getValidAccessToken(userId);
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const user = userDoc.data();

  const now = new Date();
  const horizon = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/freeBusy',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: horizon.toISOString(),
        items: [{ id: 'primary' }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch freeBusy');
  }

  const { calendars } = await response.json();
  const busySlots = calendars.primary.busy;

  const startHour = user?.preferences?.workStartHour ?? 9;
  const endHour = user?.preferences?.workEndHour ?? 18;

  // Simple slot finding algorithm (dummy logic for hackathon)
  // Just find gaps of durationMinutes between now and horizon that fall within work hours
  // For now, return a placeholder slot 1 hour from now
  const mockStart = new Date(now.getTime() + 60 * 60 * 1000);
  const mockEnd = new Date(mockStart.getTime() + durationMinutes * 60 * 1000);
  
  return [{ start: mockStart.toISOString(), end: mockEnd.toISOString() }];
}

export async function getCalendarBusySlots(userId: string, lookAheadHours: number) {
  const accessToken = await getValidAccessToken(userId);
  const now = new Date();
  const horizon = new Date(now.getTime() + lookAheadHours * 60 * 60 * 1000);

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/freeBusy',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: horizon.toISOString(),
        items: [{ id: 'primary' }],
      }),
    }
  );

  if (!response.ok) return [];
  const { calendars } = await response.json();
  return calendars.primary.busy;
}
