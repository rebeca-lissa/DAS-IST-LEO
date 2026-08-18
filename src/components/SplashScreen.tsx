import React from 'react';
import { Sparkles, Heart, PlusCircle, Volume2, VolumeX, ArrowRight, ExternalLink } from 'lucide-react';
import { triggerBirthdayConfetti } from '../utils/confettiHelper';
import { soundManager } from '../utils/audioHelper';

interface SplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddStory: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  memoriesCount: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isOpen,
  onClose,
  onOpenAddStory,
  isMuted,
  onToggleSound,
  memoriesCount,
}) => {
  if (!isOpen) return null;

  const handleEnter = () => {
    soundManager.playLevelUpFanfare();
    triggerBirthdayConfetti();
    onClose();
  };

  const handleAddStoryDirect = () => {
    soundManager.playMemoryChime(1.4);
    triggerBirthdayConfetti();
    onClose();
    onOpenAddStory();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0713]/95 backdrop-blur-sm select-none font-pixel animate-fadeIn">
      <div className="relative w-full max-w-xl pixel-box p-6 md:p-8 space-y-6 text-center shadow-2xl border-4 border-[#f59e0b]">
        
        {/* TOP CORNER SOUND TOGGLE */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onToggleSound}
            title={isMuted ? 'Enable Sound' : 'Mute Sound'}
            className="p-1.5 bg-[#181328] hover:bg-[#282142] border-2 border-[#3e2e5c] text-[#ffd285] text-[10px] flex items-center gap-1.5 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#34d399]" />}
            <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>

        {/* PIXEL AVATAR / BIRTHDAY ICON */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative">
            <div className="w-20 h-20 bg-[#451a03] border-4 border-[#ffd285] flex items-center justify-center shadow-lg transform -rotate-1">
              <span className="text-4xl">🐵</span>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#881337] border-2 border-[#fb7185] flex items-center justify-center text-lg animate-bounce">
              🎂
            </div>
          </div>
        </div>

        {/* TITLE & DEDICATION */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#ffd285] tracking-wide uppercase">
            DAS IST LEO, the civil monkey.
          </h1>
          
          <div className="p-4 bg-[#100d1c] border-2 border-[#3e2e5c] text-stone-200 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            This is a collective birthday gift for <span className="text-[#ffd285] font-bold">LEO</span>, so he can open this canvas and feel hugged by a beautiful community that surrounds himself.
          </div>

          {memoriesCount > 0 ? (
            <p className="text-[11px] text-[#34d399] font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd285]" />
              <span>{memoriesCount} birthday memories already planted!</span>
            </p>
          ) : (
            <p className="text-[11px] text-[#94a3b8]">
              Be among the first to drop a photo, note, or voice message for Leo!
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleAddStoryDirect}
            className="w-full sm:w-auto px-5 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-bold text-xs flex items-center justify-center gap-2 border-2 border-[#a7f3d0] shadow-md transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plant a Memory for Leo</span>
          </button>

          <button
            onClick={handleEnter}
            className="w-full sm:w-auto px-5 py-3 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs flex items-center justify-center gap-2 border-2 border-[#ffd285] shadow-md transition-transform active:scale-95"
          >
            <span>Explore the Canvas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* FOOTNOTE */}
        <div className="pt-3 text-[10px] text-[#94a3b8] flex flex-col sm:flex-row items-center justify-center gap-1.5 border-t border-[#2d2144]">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#f43f5e] fill-current" />
            <span>made with love of prototypes by</span>
          </div>
          <a
            href="https://artizen.fund/index/p/debolso?season=7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ffd285] hover:text-[#fbbf24] font-bold underline flex items-center gap-0.5"
          >
            <span>beca, from Debolso</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </a>
        </div>

      </div>
    </div>
  );
};
