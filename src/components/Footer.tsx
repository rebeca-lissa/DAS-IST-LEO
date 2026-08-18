import React from 'react';
import { Heart, Sparkles, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { soundManager } from '../utils/audioHelper';
import { triggerBirthdayConfetti } from '../utils/confettiHelper';

interface FooterProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenSplash: () => void;
  onOpenAddStory: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isMuted,
  onToggleSound,
  onOpenSplash,
  onOpenAddStory,
}) => {
  const handleHeartClick = () => {
    soundManager.playLevelUpFanfare();
    triggerBirthdayConfetti();
  };

  return (
    <footer className="relative z-30 w-full bg-[#120e20]/95 border-t-2 border-[#2f2347] px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none font-pixel text-xs text-[#cbd5e1] shadow-[0_-4px_0_#0a0814]">
      {/* LEFT: MADE WITH LOVE OF PROTOTYPES BY BECA, FROM DEBOLSO */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span>made with love of prototypes by</span>
        <a
          href="https://artizen.fund/index/p/debolso?season=7"
          target="_blank"
          rel="noopener noreferrer"
          title="Debolso on Artizen"
          className="text-[#ffd285] hover:text-[#fbbf24] font-bold underline decoration-dotted decoration-[#f59e0b] hover:decoration-solid flex items-center gap-1 transition-colors"
        >
          <span>beca, from Debolso</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      </div>

      {/* CENTER: INTERACTIVE HEART / CONFETTI SPARKLE */}
      <div className="flex items-center gap-3 text-[11px]">
        <button
          onClick={handleHeartClick}
          title="Send birthday love & sparkles"
          className="flex items-center gap-1 px-2 py-0.5 bg-[#451a03] hover:bg-[#881337] border border-[#f59e0b] text-[#ffd285] hover:text-[#ffe4e6] text-[10px] font-bold transition-all active:scale-95 shadow-[1px_1px_0_#0a0814]"
        >
          <Heart className="w-3 h-3 text-[#f43f5e] fill-current animate-pulse" />
          <span>Send Sparkles ✨</span>
        </button>

        <button
          onClick={onOpenSplash}
          className="text-[#94a3b8] hover:text-[#ffd285] text-[10px] hidden sm:inline"
        >
          About Leo's Gift
        </button>
      </div>

      {/* RIGHT: SOUND STATUS & QUICK STORY TRIGGER */}
      <div className="flex items-center gap-2 text-[10px]">
        <button
          onClick={onToggleSound}
          className="flex items-center gap-1 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3 text-[#f43f5e]" />
              <span className="hidden sm:inline">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-[#34d399]" />
              <span className="hidden sm:inline">Sound On</span>
            </>
          )}
        </button>

        <span className="text-[#3e2e5c]">|</span>

        <button
          onClick={() => {
            soundManager.playMemoryChime(1.3);
            onOpenAddStory();
          }}
          className="text-[#38bdf8] hover:text-[#7dd3fc] font-bold"
        >
          + Add Memory
        </button>
      </div>
    </footer>
  );
};
