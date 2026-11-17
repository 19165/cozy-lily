import { CalendarEventItem } from '../types/lily';

interface GoogleCalendarApiItem {
  id?: string;
  summary?: string;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
  status?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

export class CalendarAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarAuthError';
  }
}

/**
 * Fetches read-only Google Calendar events for Today (00:00:00 to 23:59:59 local time).
 */
export async function fetchTodayCalendarEvents(
  accessToken: string,
  referenceDate: Date = new Date()
): Promise<CalendarEventItem[]> {
  const startOfDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    23,
    59,
    59,
    999
  );

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new CalendarAuthError(
      'Your Google Calendar session expired. Please sign in again to refresh today’s schedule.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `Unable to reach Google Calendar right now (status ${response.status}).`
    );
  }

  const payload = (await response.json()) as { items?: GoogleCalendarApiItem[] };
  const rawItems = payload.items || [];

  return rawItems
    .filter((item) => item.status !== 'cancelled')
    .map((item, idx): CalendarEventItem => {
      const isAllDay = Boolean(item.start?.date && !item.start?.dateTime);
      const startTime =
        item.start?.dateTime || item.start?.date || startOfDay.toISOString();
      const endTime =
        item.end?.dateTime || item.end?.date || endOfDay.toISOString();

      return {
        id: item.id || `evt_${idx}`,
        summary: item.summary?.trim() || 'Untitled event',
        startTime,
        endTime,
        isAllDay,
        location: item.location,
        hangoutLink: item.hangoutLink,
        htmlLink: item.htmlLink,
        status: item.status,
      };
    });
}

export function formatEventTimeRange(event: CalendarEventItem): string {
  if (event.isAllDay) {
    return 'All day';
  }
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Scheduled';
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return `${fmt(start)} - ${fmt(end)}`;
}
