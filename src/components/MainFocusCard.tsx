import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { MainFocus } from '../types/lily';

interface MainFocusCardProps {
  mainFocus: MainFocus;
  onUpdateText: (text: string) => void;
  onToggleComplete: () => void;
}

export const MainFocusCard: React.FC<MainFocusCardProps> = ({
  mainFocus,
  onUpdateText,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState(!mainFocus.text.trim());
  const [draft, setDraft] = useState(mainFocus.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(mainFocus.text);
    if (!mainFocus.text.trim()) {
      setIsEditing(true);
    }
  }, [mainFocus.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const commitDraft = () => {
    const trimmed = draft.trim();
    onUpdateText(trimmed);
    if (trimmed) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Escape') {
      setDraft(mainFocus.text);
      if (mainFocus.text.trim()) {
        setIsEditing(false);
      }
    }
  };

  return (
    <section
      aria-label="Today's Main Focus"
      className="rounded-2xl cozy-glass px-3.5 py-3 border border-white/90 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7E5700]">
          <Target className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Today’s Main Focus</span>
        </div>

        {mainFocus.text.trim() && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit today's main focus"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#4A5568] hover:text-[#0060AC] px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-black/5"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={handleKeyDown}
            maxLength={120}
            placeholder="What is the one thing to finish today?"
            aria-label="Today's main focus input"
            className="w-full h-10 px-3.5 rounded-xl bg-[#FDF8F0]/95 border border-[#4A5568]/20 text-[14px] font-medium text-[#2D3748] placeholder:text-[#4A5568]/60 focus:outline-none focus:border-[#79B4E8] focus:ring-3 focus:ring-[#79B4E8]/25 transition-all"
          />
          <span className="text-[10px] text-[#4A5568]/70 px-1">
            Press <kbd className="font-mono bg-white/70 px-1 py-0.5 rounded border border-[#4A5568]/15">Enter</kbd> to save · <kbd className="font-mono bg-white/70 px-1 py-0.5 rounded border border-[#4A5568]/15">Esc</kbd> to cancel
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 -ml-1">
          <motion.button
            type="button"
            onClick={onToggleComplete}
            whileTap={{ scale: 0.9 }}
            role="checkbox"
            aria-checked={mainFocus.completed}
            aria-label={
              mainFocus.completed
                ? `Mark main focus "${mainFocus.text}" incomplete`
                : `Complete main focus "${mainFocus.text}"`
            }
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#4A90E2]"
          >
            <span
              className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center transition-all duration-200 shadow-xs ${
                mainFocus.completed
                  ? 'bg-[#4A90E2] border border-[#4A90E2] shadow-[0_0_10px_rgba(74,144,226,0.35)]'
                  : 'bg-[#FFFDF9] border-[1.5px] border-[#79B4E8] hover:border-[#4A90E2]'
              }`}
            >
              {mainFocus.completed && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check
                    className="w-3.5 h-3.5 text-white stroke-[2.75]"
                    aria-hidden="true"
                  />
                </motion.span>
              )}
            </span>
          </motion.button>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`flex-1 text-left text-[14.5px] font-semibold leading-snug py-1 pr-1 rounded-lg transition-all cursor-pointer break-words ${
              mainFocus.completed
                ? 'line-through text-[#4A5568]/60 italic'
                : 'text-[#2D3748] hover:text-[#0060AC]'
            }`}
          >
            {mainFocus.text}
          </button>
        </div>
      )}
    </section>
  );
};
