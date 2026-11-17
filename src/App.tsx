import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Music,
  RotateCcw,
  Sun,
} from 'lucide-react';
import { SidePanelShell } from './components/SidePanelShell';
import {
  CalendarEventItem,
  ENCOURAGEMENT_DIALOGUES,
  LilyStorageData,
  PRAISE_DIALOGUES,
  TodoItem,
  WorkspaceTab,
  getTimeGreeting,
} from './types/lily';
import {
  applyMidnightResetIfNeeded,
  createInitialStorageData,
  getLocalDateKey,
  loadStorageData,
  saveStorageData,
} from './services/storage';
import {
  clearCachedToken,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from './services/auth';
import {
  CalendarAuthError,
  fetchTodayCalendarEvents,
  formatEventTimeRange,
} from './services/calendar';
import { ambientSoundEngine } from './services/ambientAudio';

function pickNonRepeating(pool: string[], current: string): string {
  const candidates = pool.filter((line) => line !== current);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export default function App() {
  const [data, setData] = useState<LilyStorageData>(() =>
    createInitialStorageData()
  );
  const [hydrated, setHydrated] = useState(false);

  // Companion dialogue & animation state (FR-02, BR-01)
  const [dialogue, setDialogue] = useState<string>(() => getTimeGreeting());
  const [isCheering, setIsCheering] = useState(false);
  const cheerTimeoutRef = useRef<number | null>(null);

  // Ambient sound state (FR-03)
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);
  const [audioUrlDraft, setAudioUrlDraft] = useState('');

  // Workspace tab state (FR-05)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('todo');

  // Google Calendar auth & events state (FR-07)
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Desktop studio preview state
  const [panelOnlyView, setPanelOnlyView] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  // Load persisted data on mount
  useEffect(() => {
    let mounted = true;
    loadStorageData().then((loaded) => {
      if (!mounted) return;
      setData(loaded);
      setAudioUrlDraft(loaded.settings?.ambientAudioUrl || '');
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist data changes whenever hydrated
  useEffect(() => {
    if (!hydrated) return;
    void saveStorageData(data);
  }, [data, hydrated]);

  // Trigger BR-01 Dynamic Praise
  const triggerPraise = useCallback(() => {
    setDialogue((prev) => pickNonRepeating(PRAISE_DIALOGUES, prev));
    setIsCheering(true);
    if (cheerTimeoutRef.current !== null) {
      window.clearTimeout(cheerTimeoutRef.current);
    }
    cheerTimeoutRef.current = window.setTimeout(() => {
      setIsCheering(false);
      cheerTimeoutRef.current = null;
    }, 4500);
  }, []);

  // Tap Lily for calm encouragement
  const handleTapCompanion = useCallback(() => {
    setDialogue((prev) => pickNonRepeating(ENCOURAGEMENT_DIALOGUES, prev));
    setIsCheering(false);
  }, []);

  // Load Google Calendar events for today (00:00 - 23:59)
  const loadCalendar = useCallback(async (overrideToken?: string) => {
    const token = overrideToken || (await getAccessToken());
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setCalendarLoading(true);
    setCalendarError(null);
    try {
      const events = await fetchTodayCalendarEvents(token, new Date());
      setCalendarEvents(events);
    } catch (err) {
      if (err instanceof CalendarAuthError) {
        clearCachedToken();
        setNeedsAuth(true);
        setCalendarError(err.message);
      } else {
        setCalendarError(
          err instanceof Error
            ? err.message
            : 'Could not load today’s Google Calendar events.'
        );
      }
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setUserEmail(user.email || user.displayName || null);
        void loadCalendar(token);
      },
      (user) => {
        setNeedsAuth(true);
        setUserEmail(user?.email || null);
        setCalendarEvents([]);
      }
    );
    return () => {
      unsubscribe();
      ambientSoundEngine.stop();
      if (cheerTimeoutRef.current !== null) {
        window.clearTimeout(cheerTimeoutRef.current);
      }
    };
  }, [loadCalendar]);

  // BR-02: Midnight Daily Reset watcher + live clock tick
  useEffect(() => {
    const checkMidnightReset = () => {
      const current = new Date();
      setNow(current);

      setData((prev) => {
        const result = applyMidnightResetIfNeeded(prev, current);
        if (result.didReset) {
          setCalendarEvents([]);
          setDialogue(getTimeGreeting(current));
          setIsCheering(false);
          void getAccessToken().then((token) => {
            if (token) void loadCalendar(token);
          });
          return result.data;
        }
        return prev;
      });
    };

    const intervalId = window.setInterval(checkMidnightReset, 30000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkMidnightReset();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadCalendar]);

  const handleSimulateMidnightReset = () => {
    setData((prev) => {
      const result = applyMidnightResetIfNeeded(prev, new Date(), true);
      return result.data;
    });
    setCalendarEvents([]);
    setDialogue(
      'Fresh new day! I cleared yesterday’s completed items so we can start lightly.'
    );
    setIsCheering(false);
    void getAccessToken().then((token) => {
      if (token) void loadCalendar(token);
    });
  };

  // Ambient Sound Toggle (FR-03)
  const handleToggleSound = async () => {
    if (isSoundPlaying) {
      ambientSoundEngine.stop();
      setIsSoundPlaying(false);
      return;
    }

    setSoundNotice(null);
    await ambientSoundEngine.start(data.settings.ambientAudioUrl, (notice) => {
      setSoundNotice(notice);
    });
    setIsSoundPlaying(true);
  };

  const handleSaveAudioUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = audioUrlDraft.trim();
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ambientAudioUrl: trimmed,
      },
    }));
    if (isSoundPlaying) {
      ambientSoundEngine.stop();
      setIsSoundPlaying(false);
      void ambientSoundEngine
        .start(trimmed, (notice) => setSoundNotice(notice))
        .then(() => setIsSoundPlaying(true));
    }
  };

  // Main Focus handlers (FR-04)
  const handleUpdateMainFocus = (text: string) => {
    setData((prev) => ({
      ...prev,
      mainFocus: {
        text,
        completed: text ? prev.mainFocus.completed : false,
      },
    }));
  };

  const handleToggleMainFocus = () => {
    if (!data.mainFocus.text.trim()) return;
    const willComplete = !data.mainFocus.completed;
    setData((prev) => ({
      ...prev,
      mainFocus: {
        ...prev.mainFocus,
        completed: willComplete,
      },
    }));
    if (willComplete) {
      triggerPraise();
    }
  };

  // To-do handlers (FR-06)
  const handleAddTodo = (text: string) => {
    const newItem: TodoItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      todos: [newItem, ...prev.todos],
    }));
  };

  const handleToggleTodo = (id: string) => {
    let becameCompleted = false;
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((item) => {
        if (item.id !== id) return item;
        const nextCompleted = !item.completed;
        if (nextCompleted) becameCompleted = true;
        return { ...item, completed: nextCompleted };
      }),
    }));
    if (becameCompleted) {
      triggerPraise();
    }
  };

  const handleDeleteTodo = (id: string) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.filter((item) => item.id !== id),
    }));
  };

  // Google Auth handlers (FR-07)
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setCalendarError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        setUserEmail(result.user.email || result.user.displayName || null);
        await loadCalendar(result.accessToken);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google sign-in was cancelled.';
      setCalendarError(
        message.includes('popup-closed-by-user')
          ? 'Sign-in window was closed before completing.'
          : message
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setNeedsAuth(true);
    setUserEmail(null);
    setCalendarEvents([]);
    setCalendarError(null);
  };

  const completedTodos = data.todos.filter((t) => t.completed).length;
  const totalTodos = data.todos.length;
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const nextUpcomingEvent = calendarEvents.find((evt) => {
    if (evt.isAllDay) return true;
    const endMs = new Date(evt.endTime).getTime();
    return !Number.isNaN(endMs) && endMs >= now.getTime();
  });

  const sidePanelElement = (
    <SidePanelShell
      dialogue={dialogue}
      isCheering={isCheering}
      isSoundPlaying={isSoundPlaying}
      soundNotice={soundNotice}
      mainFocus={data.mainFocus}
      todos={data.todos}
      activeTab={activeTab}
      needsAuth={needsAuth}
      isLoggingIn={isLoggingIn}
      userEmail={userEmail}
      calendarEvents={calendarEvents}
      calendarLoading={calendarLoading}
      calendarError={calendarError}
      onToggleSound={handleToggleSound}
      onTapCompanion={handleTapCompanion}
      onDismissSoundNotice={() => setSoundNotice(null)}
      onUpdateMainFocus={handleUpdateMainFocus}
      onToggleMainFocus={handleToggleMainFocus}
      onChangeTab={setActiveTab}
      onAddTodo={handleAddTodo}
      onToggleTodo={handleToggleTodo}
      onDeleteTodo={handleDeleteTodo}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      onRefreshCalendar={() => void loadCalendar()}
    />
  );

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#2D3748]">
      {/* Narrow / Chrome Side Panel Viewport (< 900px) OR Panel-Only Focus Mode */}
      <div
        className={
          panelOnlyView
            ? 'min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FDF8F0] via-[#FFFDF9] to-[#FCE8E6]/35'
            : 'lg:hidden min-h-screen w-full max-w-[440px] mx-auto'
        }
      >
        {panelOnlyView ? (
          <div className="w-full max-w-[410px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-medium text-[#4A5568]">
                LILY · Chrome Side Panel (410px)
              </span>
              <button
                type="button"
                onClick={() => setPanelOnlyView(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 border border-[#4A5568]/15 text-xs font-semibold text-[#2D3748] hover:text-[#0060AC] transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show Desk View</span>
              </button>
            </div>
            <div className="h-[min(800px,calc(100vh-5rem))] rounded-2xl overflow-hidden border border-white/95 shadow-[0_14px_40px_-8px_rgba(45,55,72,0.12)]">
              {sidePanelElement}
            </div>
          </div>
        ) : (
          <div className="min-h-screen">{sidePanelElement}</div>
        )}
      </div>

      {/* Desktop Sunlit Desk Workspace + Docked Chrome Side Panel (>= 1024px) */}
      {!panelOnlyView && (
        <div className="hidden lg:flex min-h-screen max-w-[1360px] mx-auto px-8 py-6 gap-8 items-stretch">
          {/* Left Column: Sunlit Study Desk Overview */}
          <main className="flex-1 min-w-0 flex flex-col justify-between gap-6 py-2">
            {/* Clean Studio Header */}
            <header className="flex items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2D3748]">
                  LILY Study Desk
                </h1>
                <p className="text-sm text-[#4A5568] mt-0.5">
                  {formattedDate} ·{' '}
                  <span className="font-mono tabular-nums">{formattedTime}</span>{' '}
                  · Side Panel Companion
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPanelOnlyView(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDF9]/90 border border-[#4A5568]/15 text-xs font-semibold text-[#2D3748] hover:text-[#0060AC] hover:border-[#79B4E8]/60 transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Isolate Side Panel</span>
              </button>
            </header>

            {/* Desk Overview Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Today's Execution Card */}
              <div className="rounded-2xl cozy-glass p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7E5700]">
                  <Sun className="w-4 h-4" aria-hidden="true" />
                  <span>Daily Execution</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#2D3748] leading-snug break-words">
                    {data.mainFocus.text.trim()
                      ? data.mainFocus.text
                      : 'No main focus set yet'}
                  </p>
                  <p className="text-xs text-[#4A5568] mt-1">
                    {data.mainFocus.text.trim()
                      ? data.mainFocus.completed
                        ? 'Main focus completed today'
                        : 'Active main focus for today'
                      : 'Set one priority in the side panel on the right'}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#4A5568]/10 flex items-center justify-between text-xs text-[#4A5568]">
                  <span>To-do progress</span>
                  <span className="font-mono tabular-nums font-semibold text-[#2D3748]">
                    {completedTodos} / {totalTodos} completed
                  </span>
                </div>
              </div>

              {/* Next Schedule Snapshot Card */}
              <div className="rounded-2xl cozy-glass p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0060AC]">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Next on Calendar</span>
                </div>
                {needsAuth ? (
                  <div>
                    <p className="text-base font-semibold text-[#2D3748]">
                      Google Calendar not connected
                    </p>
                    <p className="text-xs text-[#4A5568] mt-1">
                      Open the Schedule tab in the side panel to sign in and
                      view today’s events.
                    </p>
                  </div>
                ) : nextUpcomingEvent ? (
                  <div>
                    <p className="font-mono tabular-nums text-xs font-semibold text-[#0060AC]">
                      {formatEventTimeRange(nextUpcomingEvent)}
                    </p>
                    <p className="text-lg font-semibold text-[#2D3748] mt-0.5 leading-snug break-words">
                      {nextUpcomingEvent.summary}
                    </p>
                    {nextUpcomingEvent.location && (
                      <p className="text-xs text-[#4A5568] mt-1 truncate">
                        {nextUpcomingEvent.location}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-base font-semibold text-[#2D3748]">
                      Clear schedule ahead
                    </p>
                    <p className="text-xs text-[#4A5568] mt-1">
                      No remaining calendar events for today.
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-[#4A5568]/10 flex items-center justify-between text-xs text-[#4A5568]">
                  <span>Today’s events</span>
                  <span className="font-mono tabular-nums font-semibold text-[#2D3748]">
                    {needsAuth ? '—' : calendarEvents.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Companion Audio Stream & Daily Reset Controls */}
            <div className="rounded-2xl cozy-glass p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2D3748]">
                  <Music className="w-4 h-4 text-[#7E5700]" aria-hidden="true" />
                  <span>Ambient Audio Source</span>
                </div>
                <span className="text-xs text-[#4A5568]">
                  {data.settings.ambientAudioUrl
                    ? 'Custom stream URL configured'
                    : 'Built-in Cozy Rain & Lo-Fi Pad'}
                </span>
              </div>

              <form
                onSubmit={handleSaveAudioUrl}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={audioUrlDraft}
                  onChange={(e) => setAudioUrlDraft(e.target.value)}
                  placeholder="Optional MP3 stream URL (leave blank for built-in Cozy Rain)"
                  aria-label="Custom ambient audio URL"
                  className="flex-1 h-10 px-3.5 rounded-xl bg-[#FDF8F0]/90 border border-[#4A5568]/15 text-xs text-[#2D3748] placeholder:text-[#4A5568]/60 focus:outline-none focus:border-[#79B4E8] focus:shadow-[0_0_0_3px_rgba(121,180,232,0.22)]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-[#FFFDF9] hover:bg-[#FCE8E6]/60 border border-[#4A5568]/15 text-xs font-semibold text-[#2D3748] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Save Stream
                </button>
              </form>

              <div className="pt-3 border-t border-[#4A5568]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#4A5568] flex items-center gap-1.5">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-[#4A90E2]"
                    aria-hidden="true"
                  />
                  <span>
                    Synced locally · Last daily reset:{' '}
                    <span className="font-mono tabular-nums font-medium text-[#2D3748]">
                      {data.lastResetDate || getLocalDateKey()}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateMidnightReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FCE8E6]/70 hover:bg-[#FCE8E6] border border-[#E5A93C]/25 text-xs font-semibold text-[#5E4000] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Simulate Midnight Reset</span>
                </button>
              </div>
            </div>
          </main>

          {/* Right Column: Docked 410px Chrome Side Panel Preview */}
          <div className="w-[410px] shrink-0 flex flex-col">
            <div className="flex-1 h-[calc(100vh-3rem)] max-h-[820px] rounded-2xl overflow-hidden border border-white/95 shadow-[0_14px_40px_-8px_rgba(45,55,72,0.12)]">
              {sidePanelElement}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
