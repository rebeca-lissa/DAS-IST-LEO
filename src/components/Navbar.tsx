import React, { useState } from 'react';
import { 
  Plus, 
  Share2, 
  Search, 
  Filter,
  Tv,
  ExternalLink,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Cloud,
  CloudCheck
} from 'lucide-react';
import { CanvasViewMode } from '../types';
import { soundManager } from '../utils/audioHelper';
import { triggerCelebrationConfetti } from '../utils/confettiHelper';

interface NavbarProps {
  currentMode: CanvasViewMode;
  onModeChange: (mode: CanvasViewMode) => void;
  onOpenAddModal: () => void;
  onOpenShareModal: () => void;
  onOpenSplash: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onClearTag: () => void;
  totalMemoriesCount: number;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenAddModal,
  onOpenShareModal,
  onOpenSplash,
  isMuted,
  onToggleSound,
  searchQuery,
  onSearchChange,
  selectedTag,
  onClearTag,
  totalMemoriesCount,
  isCloudSynced = true,
}) => {
  const [crtMode, setCrtMode] = useState(false);

  const handleTitleClick = () => {
    soundManager.playLevelUpFanfare();
    triggerCelebrationConfetti();
  };

  const toggleCrt = () => {
    soundManager.playMemoryChime(1.2);
    const body = document.body;
    if (!crtMode) {
      body.classList.add('scanlines');
      setCrtMode(true);
    } else {
      body.classList.remove('scanlines');
      setCrtMode(false);
    }
  };

  return (
    <header className="relative z-40 w-full bg-[#181328] border-b-2 sm:border-b-4 border-[#3e2e5c] px-2.5 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 select-none shadow-[0_4px_0_#0a0814]">
      
      {/* ROW 1: BRAND TITLE & ARTIZEN LINK */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleTitleClick}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#291e45] border-2 border-[#f59e0b] shadow-[1px_1px_0_#451a03] flex items-center justify-center text-sm sm:text-base group-hover:scale-105 transition-transform shrink-0">
            🐵
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-pixel text-xs sm:text-sm font-bold tracking-wide text-[#ffd285] uppercase drop-shadow-[0_1px_0_#451a03] group-hover:text-[#fde047] transition-colors leading-tight">
                Das ist Leo
              </h1>
              <span className="text-[9px] font-pixel text-[#94a3b8] hidden md:inline">civil monkey</span>
            </div>
            <div className="flex items-center gap-1.5 font-pixel text-[9px] sm:text-[10px] text-[#c4b5fd] leading-tight">
              <span>Living canvas</span>
              <span className="text-[#f43f5e]">❤️</span>
              <span className="text-[#ffd285]">{totalMemoriesCount} {totalMemoriesCount === 1 ? 'story' : 'stories'}</span>
              
              {/* LIVE CLOUD SYNC BADGE */}
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[8px] text-[#34d399] bg-[#064e3b]/80 border border-[#059669] px-1 py-0.2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                <span>Live Sync</span>
              </span>
            </div>
          </div>
        </div>

        {/* ARTIZEN BOOST BADGE */}
        <a
          href="https://artizen.fund/index/p/civil-monkey-ecosystem-weaving?season=7"
          target="_blank"
          rel="noopener noreferrer"
          title="Boost Leo's Civil Monkey project on Artizen"
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#451a03] hover:bg-[#b45309] text-[#fde047] border border-[#f59e0b] font-pixel text-[10px] font-bold transition-all shadow-[1px_1px_0_#0a0814]"
        >
          <Sparkles className="w-3 h-3 text-[#fbbf24] animate-pulse" />
          <span className="hidden sm:inline">Boost Artizen</span>
          <span className="sm:hidden">Artizen</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* ROW 2 ON MOBILE / CENTER ON DESKTOP: 3 TABS (MAP | WAVES | KINO) */}
      <div className="flex items-center justify-center w-full sm:w-auto">
        <div className="flex items-center bg-[#100d1c] p-0.5 border border-[#3e2e5c] gap-0.5 shadow-inner font-pixel text-[11px]">
          <button
            id="tab-map-view"
            onClick={() => {
              soundManager.playMemoryChime(1.0);
              onModeChange('map');
            }}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1 font-bold transition-all ${
              currentMode === 'map'
                ? 'bg-[#f59e0b] text-[#1c120c] border border-[#fbbf24] shadow-[0_1px_0_#78350f]'
                : 'text-[#e2e8f0] hover:text-[#ffd285] hover:bg-[#231b3b]'
            }`}
          >
            <span>MAP</span>
          </button>

          <button
            id="tab-collective-view"
            onClick={() => {
              soundManager.playMemoryChime(1.1);
              onModeChange('collective');
            }}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1 font-bold transition-all ${
              currentMode === 'collective'
                ? 'bg-[#f59e0b] text-[#1c120c] border border-[#fbbf24] shadow-[0_1px_0_#78350f]'
                : 'text-[#e2e8f0] hover:text-[#ffd285] hover:bg-[#231b3b]'
            }`}
          >
            <span>WAVES</span>
          </button>

          <button
            id="tab-tour-view"
            onClick={() => {
              soundManager.playMemoryChime(1.2);
              onModeChange('tour');
            }}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1 font-bold transition-all ${
              currentMode === 'tour'
                ? 'bg-[#f43f5e] text-white border border-[#fda4af] shadow-[0_1px_0_#881337]'
                : 'text-[#e2e8f0] hover:text-[#fda4af] hover:bg-[#231b3b]'
            }`}
          >
            <span>KINO</span>
          </button>
        </div>
      </div>

      {/* ROW 3 / RIGHT ON DESKTOP: SEARCH & ACTION BUTTONS */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
        {/* Search */}
        <div className="relative flex-1 sm:w-32 md:w-40">
          <Search className="w-3 h-3 text-[#94a3b8] absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#100d1c] border border-[#3e2e5c] pl-6 pr-2 py-0.5 text-[11px] text-[#f1f5f9] placeholder-[#64748b] font-pixel focus:outline-none focus:border-[#f59e0b]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-[10px] px-1 font-pixel"
            >
              ×
            </button>
          )}
        </div>

        {/* Selected Tag Filter */}
        {selectedTag && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#451a03] border border-[#f59e0b] text-[#ffd285] text-[10px] font-pixel animate-fadeIn shrink-0">
            <Filter className="w-2.5 h-2.5 text-[#f59e0b]" />
            <span className="truncate max-w-[60px]">{selectedTag}</span>
            <button
              onClick={onClearTag}
              className="hover:text-white ml-0.5 font-bold text-xs"
              title="Clear filter"
            >
              ×
            </button>
          </div>
        )}

        {/* Help / Splash Welcome Card Button */}
        <button
          onClick={() => {
            soundManager.playMemoryChime(1.1);
            onOpenSplash();
          }}
          title="About this canvas"
          className="p-1 bg-[#1e1b2e] border border-[#3e2e5c] text-[#e2e8f0] hover:text-[#ffd285] hover:border-[#ffd285] font-pixel text-xs transition-all shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Sound Enable/Mute Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute sound effects & chiptunes' : 'Mute sound'}
          className={`p-1 border text-xs font-pixel transition-all shrink-0 ${
            !isMuted
              ? 'bg-[#065f46] border-[#34d399] text-[#a7f3d0] hover:bg-[#10b981]'
              : 'bg-[#1e1b2e] border-[#3e2e5c] text-stone-400'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#34d399]" />}
        </button>

        {/* CRT Scanlines Toggle */}
        <button
          onClick={toggleCrt}
          title={crtMode ? 'Disable CRT Scanlines' : 'Enable 16-Bit CRT Scanlines'}
          className={`p-1 border text-xs font-pixel transition-all hidden sm:inline-flex shrink-0 ${
            crtMode
              ? 'bg-[#10b981] border-[#34d399] text-[#052e16] font-bold'
              : 'bg-[#1e1b2e] border-[#3e2e5c] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            soundManager.playMemoryChime(1.0);
            onOpenShareModal();
          }}
          title="Share link with friends"
          className="flex items-center gap-1 px-2 py-1 bg-[#1e1b2e] border border-[#3e2e5c] text-[#e2e8f0] hover:text-white font-pixel text-[11px] transition-all shrink-0"
        >
          <Share2 className="w-3 h-3" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Primary Action: + Add Story */}
        <button
          id="btn-add-story-nav"
          onClick={() => {
            soundManager.playMemoryChime(1.3);
            onOpenAddModal();
          }}
          className="pixel-btn flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-pixel text-[11px] font-bold shrink-0"
        >
          <Plus className="w-3 h-3 stroke-[3]" />
          <span>+ Add</span>
        </button>
      </div>

    </header>
  );
};
