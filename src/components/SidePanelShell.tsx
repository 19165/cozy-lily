import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      className="w-full h-full flex flex-col gap-3 p-3.5 bg-[#FDF8F0] relative overflow-y-auto cozy-scroll"
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
        className="relative z-10 flex-1 flex flex-col rounded-2xl cozy-glass p-3 min-h-[300px] border border-white/90 shadow-sm"
      >
        <div
          role="tablist"
          aria-label="Workspace views"
          className="relative grid grid-cols-2 p-1 rounded-full bg-[#FDF8F0]/90 border border-[#4A5568]/12 mb-3"
        >
          {/* Tab 1: To-do */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'todo'}
            onClick={() => onChangeTab('todo')}
            className={`relative h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2] z-10 ${
              activeTab === 'todo'
                ? 'text-[#2D3748]'
                : 'text-[#4A5568] hover:text-[#2D3748]'
            }`}
          >
            {activeTab === 'todo' && (
              <motion.div
                layoutId="activeWorkspaceTabPill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(45,55,72,0.08)] border border-[#E5A93C]/35 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span>To-do</span>
            {incompleteCount > 0 && (
              <span
                aria-label={`${incompleteCount} remaining`}
                className={`font-mono tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                  activeTab === 'todo'
                    ? 'bg-[#E5A93C]/25 text-[#5E4000]'
                    : 'bg-[#4A5568]/12 text-[#4A5568]'
                }`}
              >
                {incompleteCount}
              </span>
            )}
          </button>

          {/* Tab 2: Schedule */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'schedule'}
            onClick={() => onChangeTab('schedule')}
            className={`relative h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4A90E2] z-10 ${
              activeTab === 'schedule'
                ? 'text-[#2D3748]'
                : 'text-[#4A5568] hover:text-[#2D3748]'
            }`}
          >
            {activeTab === 'schedule' && (
              <motion.div
                layoutId="activeWorkspaceTabPill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(45,55,72,0.08)] border border-[#79B4E8]/40 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span>Schedule</span>
          </button>
        </div>

        {/* Tab Content with AnimatePresence for smooth slide/fade */}
        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'todo' ? (
              <motion.div
                key="todo"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="flex-1 flex flex-col h-full"
              >
                <TodoWorkspace
                  todos={todos}
                  onAddTodo={onAddTodo}
                  onToggleTodo={onToggleTodo}
                  onDeleteTodo={onDeleteTodo}
                />
              </motion.div>
            ) : (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="flex-1 flex flex-col h-full"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </aside>
  );
};
