import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

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
      className="relative rounded-2xl cozy-glass p-3.5 overflow-hidden bg-gradient-to-br from-[#FFFDF9]/95 via-[#FDF8F0]/90 to-[#FCE8E6]/50"
    >
      {/* Top Row: Quiet Companion Label + 1-Click Ambient Sound Toggle (FR-03) */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#4A5568]">
          <span className="font-semibold text-[#2D3748]">Lily</span>
          <span aria-hidden="true">·</span>
          <span>{isCheering ? 'Cheering you on' : 'Desk Companion'}</span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={isSoundPlaying}
          aria-label={
            isSoundPlaying ? 'Pause ambient sound' : 'Play ambient sound'
          }
          className={`inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
            isSoundPlaying
              ? 'bg-[#E5A93C] text-[#281900] shadow-[0_0_12px_rgba(229,169,60,0.35)] hover:bg-[#F4C472]'
              : 'bg-[#FFFDF9]/90 text-[#4A5568] border border-[#4A5568]/15 hover:text-[#0060AC] hover:border-[#79B4E8]/50'
          }`}
        >
          {isSoundPlaying ? (
            <Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>{isSoundPlaying ? 'Rain On' : 'Ambient'}</span>
        </button>
      </div>

      {/* Main Companion Area: Half-body 2D Portrait + Speech Bubble (FR-02) */}
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={onTapCompanion}
          title="Tap Lily for an encouraging word"
          className="relative w-[108px] h-[142px] shrink-0 rounded-xl overflow-hidden bg-gradient-to-b from-[#FDF8F0] to-[#FCE8E6]/60 border border-white/90 shadow-sm group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
        >
          {!imgError ? (
            <img
              src={activeImage}
              alt="Lily, your cozy anime productivity companion"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#FCE8E6] to-[#FFDEAD]/60">
              <Sparkles
                className="w-6 h-6 text-[#7E5700] mb-1"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#5E4000]">Lily</span>
            </div>
          )}
        </button>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0 pb-1">
          <div
            role="status"
            aria-live="polite"
            className={`relative rounded-2xl rounded-bl-sm px-3.5 py-3 text-[13px] leading-[1.45] transition-all duration-200 border ${
              isCheering
                ? 'bg-[#FFFDF9] border-[#E5A93C]/50 text-[#2D3748] shadow-[0_4px_14px_rgba(229,169,60,0.14)]'
                : 'bg-[#FFFDF9]/92 border-white/95 text-[#2D3748] shadow-[0_2px_10px_rgba(45,55,72,0.04)]'
            }`}
          >
            <p className="break-words">{dialogue}</p>
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
