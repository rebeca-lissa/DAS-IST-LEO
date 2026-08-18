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
  HelpCircle
} from 'lucide-react';
import { CanvasViewMode } from '../types';
import { soundManager } from '../utils/audioHelper';
import { triggerBirthdayConfetti } from '../utils/confettiHelper';

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
}) => {
  const [crtMode, setCrtMode] = useState(false);

  const handleTitleClick = () => {
    soundManager.playLevelUpFanfare();
    triggerBirthdayConfetti();
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
    <header className="relative z-40 w-full bg-[#181328] border-b-4 border-[#3e2e5c] px-3.5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 select-none shadow-[0_6px_0_#0a0814]">
      {/* BRAND & DIRECT ARTIZEN BOOST LINK */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={handleTitleClick}>
          <div className="relative w-9 h-9 bg-[#291e45] border-2 border-[#f59e0b] shadow-[2px_2px_0_#451a03] flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
            🐵
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-base md:text-lg font-bold tracking-wider text-[#ffd285] uppercase drop-shadow-[0_2px_0_#451a03] group-hover:text-[#fde047] transition-colors">
                Das ist Leo, the Civil Monkey
              </h1>
            </div>
            <div className="flex items-center gap-2 font-pixel text-[11px] text-[#c4b5fd]">
              <span>A collective birthday gift</span>
              <span className="text-[#f43f5e]">❤️</span>
              <span className="text-[#ffd285]">{totalMemoriesCount} {totalMemoriesCount === 1 ? 'story' : 'stories'}</span>
            </div>
          </div>
        </div>

        {/* ARTIZEN PROJECT BOOST LINK */}
        <a
          href="https://artizen.fund/index/p/civil-monkey-ecosystem-weaving?season=7"
          target="_blank"
          rel="noopener noreferrer"
          title="Boost Leo's Civil Monkey project on Artizen"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#451a03] hover:bg-[#b45309] text-[#fde047] border-2 border-[#f59e0b] font-pixel text-xs font-bold transition-all shadow-[2px_2px_0_#0a0814]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] animate-pulse" />
          <span>Boost Artizen Project</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 3 TABS: MAP | WAVES | KINO */}
      <div className="flex items-center bg-[#100d1c] p-1 border-2 border-[#3e2e5c] gap-1 shadow-inner font-pixel text-xs">
        <button
          id="tab-map-view"
          onClick={() => {
            soundManager.playMemoryChime(1.0);
            onModeChange('map');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 font-bold transition-all ${
            currentMode === 'map'
              ? 'bg-[#f59e0b] text-[#1c120c] border-2 border-[#fbbf24] shadow-[0_2px_0_#78350f]'
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
          className={`flex items-center gap-1.5 px-4 py-1.5 font-bold transition-all ${
            currentMode === 'collective'
              ? 'bg-[#f59e0b] text-[#1c120c] border-2 border-[#fbbf24] shadow-[0_2px_0_#78350f]'
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
          className={`flex items-center gap-1.5 px-4 py-1.5 font-bold transition-all ${
            currentMode === 'tour'
              ? 'bg-[#f43f5e] text-white border-2 border-[#fda4af] shadow-[0_2px_0_#881337]'
              : 'text-[#e2e8f0] hover:text-[#fda4af] hover:bg-[#231b3b]'
          }`}
        >
          <span>KINO</span>
        </button>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Search */}
        <div className="relative flex-1 md:w-36 lg:w-44">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories..."
            className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] pl-8 pr-3 py-1 text-xs text-[#f1f5f9] placeholder-[#64748b] font-pixel focus:outline-none focus:border-[#f59e0b]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs px-1 font-pixel"
            >
              ×
            </button>
          )}
        </div>

        {/* Selected Tag Filter */}
        {selectedTag && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#451a03] border-2 border-[#f59e0b] text-[#ffd285] text-xs font-pixel animate-fadeIn">
            <Filter className="w-3 h-3 text-[#f59e0b]" />
            <span>{selectedTag}</span>
            <button
              onClick={onClearTag}
              className="hover:text-white ml-1 font-bold text-sm"
              title="Clear filter"
            >
              ×
            </button>
          </div>
        )}

        {/* About / Splash Welcome Card Button */}
        <button
          onClick={() => {
            soundManager.playMemoryChime(1.1);
            onOpenSplash();
          }}
          title="About this gift & welcome screen"
          className="p-1.5 bg-[#1e1b2e] border-2 border-[#3e2e5c] text-[#e2e8f0] hover:text-[#ffd285] hover:border-[#ffd285] font-pixel text-xs transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sound Enable/Mute Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute sound effects & chiptunes' : 'Mute sound'}
          className={`p-1.5 border-2 text-xs font-pixel transition-all ${
            !isMuted
              ? 'bg-[#065f46] border-[#34d399] text-[#a7f3d0] hover:bg-[#10b981] hover:text-[#022c22]'
              : 'bg-[#1e1b2e] border-[#3e2e5c] text-stone-400 hover:text-stone-200'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* CRT Scanlines */}
        <button
          onClick={toggleCrt}
          title={crtMode ? 'Disable CRT Scanlines' : 'Enable 16-Bit CRT Arcade Scanlines'}
          className={`p-1.5 border-2 text-xs font-pixel transition-all ${
            crtMode
              ? 'bg-[#10b981] border-[#34d399] text-[#052e16] font-bold'
              : 'bg-[#1e1b2e] border-[#3e2e5c] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            soundManager.playMemoryChime(1.0);
            onOpenShareModal();
          }}
          title="Share link with friends"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1e1b2e] border-2 border-[#3e2e5c] text-[#e2e8f0] hover:text-white hover:border-[#6366f1] font-pixel text-xs transition-all shadow-[2px_2px_0_#0f0c1b]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Primary Action: + Add Story */}
        <button
          id="btn-add-story-nav"
          onClick={() => {
            soundManager.playMemoryChime(1.3);
            onOpenAddModal();
          }}
          className="pixel-btn flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-pixel text-xs font-bold shadow-[2px_2px_0_#451a03]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Add Story</span>
        </button>
      </div>
    </header>
  );
};
