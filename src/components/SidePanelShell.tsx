import React from 'react';
import { CompanionHero } from './CompanionHero';
import { MainFocusCard } from './MainFocusCard';
import { TodoWorkspace } from './TodoWorkspace';
import { ScheduleWorkspace } from './ScheduleWorkspace';
import {
  CalendarEventItem,
  MainFocus,
  TodoItem,
  WorkspaceTab,
} from '../types/lily';

interface SidePanelShellProps {
  dialogue: string;
  isCheering: boolean;
  isSoundPlaying: boolean;
  soundNotice: string | null;
  mainFocus: MainFocus;
  todos: TodoItem[];
  activeTab: WorkspaceTab;
  needsAuth: boolean;
  isLoggingIn: boolean;
  userEmail: string | null;
  calendarEvents: CalendarEventItem[];
  calendarLoading: boolean;
  calendarError: string | null;
  onToggleSound: () => void;
  onTapCompanion: () => void;
  onDismissSoundNotice: () => void;
  onUpdateMainFocus: (text: string) => void;
  onToggleMainFocus: () => void;
  onChangeTab: (tab: WorkspaceTab) => void;
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onRefreshCalendar: () => void;
}

export const SidePanelShell: React.FC<SidePanelShellProps> = ({
  dialogue,
  isCheering,
  isSoundPlaying,
  soundNotice,
  mainFocus,
  todos,
  activeTab,
  needsAuth,
  isLoggingIn,
  userEmail,
  calendarEvents,
  calendarLoading,
  calendarError,
  onToggleSound,
  onTapCompanion,
  onDismissSoundNotice,
  onUpdateMainFocus,
  onToggleMainFocus,
  onChangeTab,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onSignIn,
  onSignOut,
  onRefreshCalendar,
}) => {
  const incompleteCount = todos.filter((t) => !t.completed).length;

  return (
    <aside
      aria-label="LILY Side Panel"
      className="w-full h-full flex flex-col gap-3 p-4 bg-[#FDF8F0] relative overflow-y-auto cozy-scroll"
    >
      {/* Subtle sunlit atmospheric ambient washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-14 w-56 h-56 rounded-full bg-[#E5A93C]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 -left-16 w-56 h-56 rounded-full bg-[#79B4E8]/12 blur-3xl"
      />

      {/* 1. Companion Hero Card (FR-02 + FR-03) */}
      <div className="relative z-10">
        <CompanionHero
          dialogue={dialogue}
          isCheering={isCheering}
          isSoundPlaying={isSoundPlaying}
          soundNotice={soundNotice}
          onToggleSound={onToggleSound}
          onTapCompanion={onTapCompanion}
          onDismissSoundNotice={onDismissSoundNotice}
        />
      </div>

      {/* 2. Today's Main Focus (FR-04) */}
      <div className="relative z-10">
        <MainFocusCard
          mainFocus={mainFocus}
          onUpdateText={onUpdateMainFocus}
          onToggleComplete={onToggleMainFocus}
        />
      </div>

      {/* 3. Dual-Tab Workspace: Segmented Switcher + Active Module (FR-05, FR-06, FR-07) */}
      <section
        aria-label="Today's workspace"
        className="relative z-10 flex-1 flex flex-col rounded-2xl cozy-glass p-3.5 min-h-[290px]"
      >
        <div
          role="tablist"
          aria-label="Workspace views"
          className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#FDF8F0]/90 border border-[#4A5568]/10 mb-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'todo'}
            onClick={() => onChangeTab('todo')}
            className={`h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2] ${
              activeTab === 'todo'
                ? 'bg-[#FFFDF9] text-[#2D3748] shadow-[0_2px_6px_rgba(45,55,72,0.06)] border border-[#E5A93C]/25'
                : 'text-[#4A5568] hover:text-[#2D3748]'
            }`}
          >
            <span>To-do</span>
            {incompleteCount > 0 && (
              <span
                aria-label={`${incompleteCount} remaining`}
                className={`font-mono tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                  activeTab === 'todo'
                    ? 'bg-[#E5A93C]/25 text-[#5E4000]'
                    : 'bg-[#4A5568]/10 text-[#4A5568]'
                }`}
              >
                {incompleteCount}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'schedule'}
            onClick={() => onChangeTab('schedule')}
            className={`h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2] ${
              activeTab === 'schedule'
                ? 'bg-[#FFFDF9] text-[#2D3748] shadow-[0_2px_6px_rgba(45,55,72,0.06)] border border-[#79B4E8]/35'
                : 'text-[#4A5568] hover:text-[#2D3748]'
            }`}
          >
            <span>Schedule</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'todo' ? (
            <TodoWorkspace
              todos={todos}
              onAddTodo={onAddTodo}
              onToggleTodo={onToggleTodo}
              onDeleteTodo={onDeleteTodo}
            />
          ) : (
            <ScheduleWorkspace
              needsAuth={needsAuth}
              isLoggingIn={isLoggingIn}
              userEmail={userEmail}
              events={calendarEvents}
              isLoading={calendarLoading}
              error={calendarError}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
              onRefresh={onRefreshCalendar}
            />
          )}
        </div>
      </section>
    </aside>
  );
};
