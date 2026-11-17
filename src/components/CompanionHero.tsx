import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompanionHeroProps {
  dialogue: string;
  isCheering: boolean;
  isSoundPlaying: boolean;
  soundNotice: string | null;
  onToggleSound: () => void;
  onTapCompanion: () => void;
  onDismissSoundNotice: () => void;
}

const LILY_DEFAULT_IMG =
  '/src/assets/images/lily_companion_default_1794917560001.jpg';
const LILY_CHEER_IMG =
  '/src/assets/images/lily_companion_cheer_1794917560543.jpg';

export const CompanionHero: React.FC<CompanionHeroProps> = ({
  dialogue,
  isCheering,
  isSoundPlaying,
  soundNotice,
  onToggleSound,
  onTapCompanion,
  onDismissSoundNotice,
}) => {
  const [imgError, setImgError] = useState(false);

  const activeImage = isCheering ? LILY_CHEER_IMG : LILY_DEFAULT_IMG;

  return (
    <section
      aria-label="Lily companion"
      className="relative rounded-2xl cozy-glass p-3.5 overflow-hidden bg-gradient-to-br from-[#FFFDF9]/95 via-[#FDF8F0]/90 to-[#FCE8E6]/50 border border-white/90 shadow-sm"
    >
      {/* Top Row: Quiet Companion Label + 1-Click Ambient Sound Toggle (FR-03) */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#4A5568]">
          <span className="font-semibold text-[#2D3748]">Lily</span>
          <span aria-hidden="true">·</span>
          <span className="transition-colors duration-200">
            {isCheering ? '✨ Cheering you on!' : 'Desk Companion'}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={isSoundPlaying}
          aria-label={
            isSoundPlaying ? 'Pause ambient sound' : 'Play ambient sound'
          }
          className={`inline-flex items-center gap-2 px-3 min-h-[36px] rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] active:scale-[0.97] ${
            isSoundPlaying
              ? 'bg-[#E5A93C] text-[#281900] shadow-[0_0_14px_rgba(229,169,60,0.38)] border border-[#F4C472]/60 hover:bg-[#F4C472]'
              : 'bg-[#FFFDF9]/95 text-[#4A5568] border border-[#4A5568]/15 hover:text-[#0060AC] hover:border-[#79B4E8]/50 hover:bg-white'
          }`}
        >
          {isSoundPlaying ? (
            <>
              {/* Mini animated equalizer bars */}
              <div
                className="flex items-end gap-0.5 h-3 w-3 shrink-0"
                aria-hidden="true"
              >
                <span className="w-0.5 h-full bg-[#281900] rounded-full sound-bar-1" />
                <span className="w-0.5 h-full bg-[#281900] rounded-full sound-bar-2" />
                <span className="w-0.5 h-full bg-[#281900] rounded-full sound-bar-3" />
              </div>
              <span>Rain On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Ambient</span>
            </>
          )}
        </button>
      </div>

      {/* Main Companion Area: Half-body 2D Portrait + Speech Bubble (FR-02) */}
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={onTapCompanion}
          title="Tap Lily for an encouraging word"
          className="relative w-[108px] h-[142px] shrink-0 rounded-xl overflow-hidden bg-gradient-to-b from-[#FDF8F0] to-[#FCE8E6]/60 border border-white/95 shadow-sm group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] transition-transform active:scale-95"
        >
          {!imgError ? (
            <div className="w-full h-full animate-lily-float">
              <img
                src={activeImage}
                alt="Lily, your cozy anime productivity companion"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-top transition-transform duration-250 group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#FCE8E6] to-[#FFDEAD]/60">
              <Sparkles
                className="w-6 h-6 text-[#7E5700] mb-1 animate-spin"
                style={{ animationDuration: '6s' }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#5E4000]">Lily</span>
            </div>
          )}
        </button>

        {/* Speech Bubble with AnimatePresence for smooth cross-fading (BR-01) */}
        <div className="flex-1 min-w-0 pb-1">
          <div
            role="status"
            aria-live="polite"
            className={`relative rounded-2xl rounded-bl-sm px-3.5 py-3 text-[13px] leading-[1.48] transition-all duration-200 border min-h-[72px] flex flex-col justify-center ${
              isCheering
                ? 'bg-[#FFFDF9] border-[#E5A93C]/60 text-[#2D3748] shadow-[0_4px_16px_rgba(229,169,60,0.18)] ring-1 ring-[#E5A93C]/20'
                : 'bg-[#FFFDF9]/95 border-white/95 text-[#2D3748] shadow-[0_2px_10px_rgba(45,55,72,0.04)]'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={dialogue}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="break-words font-normal"
              >
                {dialogue}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={onTapCompanion}
              className="text-[11px] font-medium text-[#4A5568] hover:text-[#0060AC] transition-colors cursor-pointer whitespace-nowrap"
            >
              Tap Lily for encouragement
            </button>
          </div>
        </div>
      </div>

      {/* Friendly Audio Fallback Notice if custom stream fails */}
      {soundNotice && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-[#FFEFEF] border border-[#E5A93C]/30 px-3 py-2 text-xs text-[#5E4000]">
          <span>{soundNotice}</span>
          <button
            type="button"
            onClick={onDismissSoundNotice}
            className="font-semibold text-[#7E5700] hover:underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
};
