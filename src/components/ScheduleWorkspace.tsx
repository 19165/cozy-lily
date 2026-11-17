import React from 'react';
import {
  Calendar,
  ExternalLink,
  MapPin,
  RefreshCw,
  Video,
} from 'lucide-react';
import { CalendarEventItem } from '../types/lily';
import { formatEventTimeRange } from '../services/calendar';

interface ScheduleWorkspaceProps {
  needsAuth: boolean;
  isLoggingIn: boolean;
  userEmail: string | null;
  events: CalendarEventItem[];
  isLoading: boolean;
  error: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onRefresh: () => void;
}

export const ScheduleWorkspace: React.FC<ScheduleWorkspaceProps> = ({
  needsAuth,
  isLoggingIn,
  userEmail,
  events,
  isLoading,
  error,
  onSignIn,
  onSignOut,
  onRefresh,
}) => {
  const nowMs = Date.now();

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-7 px-4 rounded-xl bg-[#FDF8F0]/65 border border-[#4A5568]/10 h-full">
        <div className="w-11 h-11 rounded-full bg-[#D4E3FF]/70 flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5 text-[#0060AC]" aria-hidden="true" />
        </div>
        <h3 className="text-[14px] font-semibold text-[#2D3748]">
          Sync Today’s Schedule
        </h3>
        <p className="text-xs text-[#4A5568] mt-1.5 mb-4 max-w-[260px] leading-relaxed">
          Connect your Google Calendar to view today’s events (00:00 – 23:59) in
          a calm read-only timeline.
        </p>

        <button
          type="button"
          onClick={onSignIn}
          disabled={isLoggingIn}
          className="gsi-material-button shadow-xs"
        >
          <span className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="block w-full h-full"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </span>
          <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        {error && (
          <p className="mt-3 text-xs text-[#BA1A1A] bg-[#FFDAD6]/60 rounded-lg px-3 py-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connected Header & Refresh Control */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#4A5568]/10">
        <div className="min-w-0 flex items-center gap-1.5 text-xs text-[#4A5568]">
          <span className="truncate max-w-[170px] font-medium" title={userEmail || undefined}>
            {userEmail || 'Google Calendar'}
          </span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onSignOut}
            className="text-[#4A5568] hover:text-[#BA1A1A] font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign out
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh today's schedule"
          className="inline-flex items-center gap-1.5 px-2.5 h-7.5 rounded-full bg-[#FDF8F0] hover:bg-[#D4E3FF]/50 border border-[#4A5568]/15 text-xs font-medium text-[#2D3748] hover:text-[#0060AC] transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-2.5 rounded-xl bg-[#FFDAD6]/55 border border-[#BA1A1A]/20 px-3 py-2 text-xs text-[#93000A] flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="font-semibold underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && events.length === 0 ? (
        <div className="space-y-2 py-1" aria-label="Loading schedule">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="rounded-xl bg-white/60 border border-[#4A5568]/10 px-3 py-2.5 animate-pulse"
            >
              <div className="h-3 w-20 bg-[#D9E3F9] rounded mb-1.5" />
              <div className="h-3.5 w-40 bg-[#E7EEFF] rounded" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-7 px-4 rounded-xl bg-[#FDF8F0]/55 border border-[#4A5568]/10">
          <Calendar
            className="w-6 h-6 text-[#79B4E8] mb-1.5"
            aria-hidden="true"
          />
          <p className="text-[13px] font-semibold text-[#2D3748]">
            No events scheduled today
          </p>
          <p className="text-xs text-[#4A5568] mt-0.5 max-w-[235px]">
            Your calendar is open today—enjoy the peaceful uninterrupted focus time.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-2 overflow-y-auto cozy-scroll pr-1 max-h-[300px]">
          {events.map((event) => {
            const startMs = new Date(event.startTime).getTime();
            const endMs = new Date(event.endTime).getTime();
            const isHappeningNow =
              !event.isAllDay &&
              !Number.isNaN(startMs) &&
              !Number.isNaN(endMs) &&
              nowMs >= startMs &&
              nowMs <= endMs;
            const isPast =
              !event.isAllDay && !Number.isNaN(endMs) && nowMs > endMs;

            return (
              <li
                key={event.id}
                className={`rounded-xl px-3 py-2.5 border transition-all ${
                  isHappeningNow
                    ? 'bg-[#FFFDF9] border-[#4A90E2]/50 shadow-[0_2px_12px_rgba(74,144,226,0.12)] ring-1 ring-[#4A90E2]/25'
                    : isPast
                      ? 'bg-[#FDF8F0]/55 border-[#4A5568]/10 opacity-65'
                      : 'bg-white/65 border-white/95 shadow-2xs hover:bg-white/85'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`font-mono tabular-nums text-[11px] font-medium ${
                      isHappeningNow ? 'text-[#0060AC]' : 'text-[#4A5568]'
                    }`}
                  >
                    {formatEventTimeRange(event)}
                  </span>

                  {isHappeningNow && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0060AC]">
                      <span className="w-2 h-2 rounded-full bg-[#0060AC] animate-live-pulse" />
                      <span>Happening now</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#2D3748] leading-snug break-words">
                    {event.summary}
                  </p>
                  {event.htmlLink && (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${event.summary} in Google Calendar`}
                      className="text-[#4A5568] hover:text-[#0060AC] p-1 rounded-md shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>

                {(event.location || event.hangoutLink) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#4A5568]">
                    {event.location && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[190px]">
                        <MapPin className="w-3 h-3 shrink-0 text-[#7E5700]" aria-hidden="true" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                    {event.hangoutLink && (
                      <a
                        href={event.hangoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0060AC]/10 text-[#0060AC] font-semibold text-[11px] hover:bg-[#0060AC]/20 transition-colors"
                      >
                        <Video className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>Join Meet</span>
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
