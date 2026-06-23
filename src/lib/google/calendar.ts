import { google } from "googleapis";

type FreeSlot = {
  start: string;
  end: string;
  durationMinutes: number;
};

/**
 * Initializes the Google Calendar API client using the user's access token.
 */
const getCalendarClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
};

/**
 * Gets free busy blocks for the user.
 */
export const getFreeBusyBlocks = async (
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<FreeSlot[]> => {
  const calendar = getCalendarClient(accessToken);
  
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: "primary" }],
    },
  });

  const calendars = res.data.calendars;
  if (!calendars || !calendars.primary || !calendars.primary.busy) {
    return [{
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      durationMinutes: Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    }];
  }

  const busySlots = calendars.primary.busy;
  const freeSlots: FreeSlot[] = [];
  
  let currentStart = startDate.getTime();

  for (const busy of busySlots) {
    if (!busy.start || !busy.end) continue;
    const busyStart = new Date(busy.start).getTime();
    const busyEnd = new Date(busy.end).getTime();

    if (busyStart > currentStart) {
      freeSlots.push({
        start: new Date(currentStart).toISOString(),
        end: new Date(busyStart).toISOString(),
        durationMinutes: Math.round((busyStart - currentStart) / 60000),
      });
    }
    currentStart = Math.max(currentStart, busyEnd);
  }

  if (currentStart < endDate.getTime()) {
    freeSlots.push({
      start: new Date(currentStart).toISOString(),
      end: endDate.toISOString(),
      durationMinutes: Math.round((endDate.getTime() - currentStart) / 60000),
    });
  }

  return freeSlots;
};

/**
 * Creates a Calendar Event.
 */
export const createCalendarEvent = async (
  accessToken: string,
  title: string,
  startTime: Date,
  endTime: Date
) => {
  const calendar = getCalendarClient(accessToken);

  const event = {
    summary: title,
    description: "Scheduled by VibeShift AI",
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "UTC",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return res.data;
};
