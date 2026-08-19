import React from 'react';
import { 
  Sparkles, 
  Map, 
  Heart, 
  Users, 
  ExternalLink,
  Compass,
  X,
  Plus
} from 'lucide-react';
import { soundManager } from '../utils/audioHelper';
import { triggerCelebrationConfetti } from '../utils/confettiHelper';

interface SplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter?: () => void;
  onOpenAddStory?: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
  memoriesCount?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  isOpen, 
  onClose, 
  onEnter,
  onOpenAddStory,
  memoriesCount 
}) => {
  if (!isOpen) return null;

  const handleEnter = () => {
    soundManager.playLevelUpFanfare();
    triggerCelebrationConfetti();
    if (onEnter) onEnter();
    if (onClose) onClose();
  };

  const handleAddStory = () => {
    soundManager.playMemoryChime(1.2);
    if (onClose) onClose();
    if (onOpenAddStory) onOpenAddStory();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 select-none font-pixel animate-fadeIn overflow-y-auto">
      
      {/* 16-BIT RETRO DIALOGUE BOX */}
      <div className="relative w-full max-w-lg pixel-box p-4 sm:p-6 text-center space-y-3.5 border-2 border-[#f59e0b] shadow-2xl my-auto">
        
        {/* CLOSE BUTTON TOP RIGHT */}
        <button
          onClick={handleEnter}
          className="absolute top-3 right-3 p-1 bg-[#181328] border border-[#3e2e5c] text-[#cbd5e1] hover:text-white"
          title="Close / Enter"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* PIXEL EMBLEM */}
        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-[#291e45] border-2 border-[#f59e0b] shadow-[2px_2px_0_#451a03] flex items-center justify-center text-2xl sm:text-3xl animate-bounce">
          🐒
        </div>

        {/* TITLE & SUBTITLE */}
        <div className="space-y-1">
          <div className="inline-block px-2.5 py-0.5 bg-[#451a03] border border-[#f59e0b] text-[#ffd285] text-[10px] font-bold shadow-[1px_1px_0_#0a0814]">
            CIVIL MONKEY LIVING CANVAS
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#ffd285] uppercase tracking-wide drop-shadow-[0_1px_0_#451a03]">
            Das ist Leo
          </h1>
          <p className="text-xs sm:text-[13px] text-[#cbd5e1] max-w-sm mx-auto leading-relaxed">
            A collaborative constellation of stories, voice notes, and memories celebrating Leo and the ecosystem he weaves.
          </p>
        </div>

        {/* 3 QUICK FEATURES PILLS */}
        <div className="grid grid-cols-3 gap-2 py-1 text-[10px]">
          <div className="p-2 bg-[#100d1c] border border-[#3e2e5c] space-y-0.5">
            <Map className="w-3.5 h-3.5 text-[#f59e0b] mx-auto" />
            <div className="font-bold text-[#ffd285]">Living Map</div>
            <div className="text-[9px] text-[#94a3b8]">Freely pan & explore</div>
          </div>
          <div className="p-2 bg-[#100d1c] border border-[#3e2e5c] space-y-0.5">
            <Heart className="w-3.5 h-3.5 text-[#f43f5e] mx-auto" />
            <div className="font-bold text-[#ffd285]">Plant Stories</div>
            <div className="text-[9px] text-[#94a3b8]">Photos, audio & letters</div>
          </div>
          <div className="p-2 bg-[#100d1c] border border-[#3e2e5c] space-y-0.5">
            <Users className="w-3.5 h-3.5 text-[#34d399] mx-auto" />
            <div className="font-bold text-[#ffd285]">Collective</div>
            <div className="text-[9px] text-[#94a3b8]">Answer waves</div>
          </div>
        </div>

        {/* ARTIZEN CAMPAIGN NOTICE */}
        <div className="p-2.5 bg-[#451a03]/60 border border-[#f59e0b] text-left space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#ffd285]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#f59e0b] animate-pulse" />
              <span>Civil Monkey Ecosystem Weaving</span>
            </span>
            <a
              href="https://artizen.fund/index/p/civil-monkey-ecosystem-weaving?season=7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fde047] hover:underline flex items-center gap-0.5 text-[9px]"
            >
              <span>Artizen Season 7</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <p className="text-[9px] sm:text-[10px] text-[#fef3c7] leading-tight">
            Support and boost Leo’s ongoing cultural and social weaving project on Artizen Fund!
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            id="btn-enter-canvas"
            onClick={handleEnter}
            className="pixel-btn flex-1 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_3px_0_#451a03]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Enter Living Canvas</span>
          </button>

          {onOpenAddStory && (
            <button
              onClick={handleAddStory}
              className="pixel-btn px-3 py-2 bg-[#291e45] hover:bg-[#451a03] text-[#ffd285] font-bold text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Story</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
