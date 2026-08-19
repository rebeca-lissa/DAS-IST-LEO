import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Sparkles,
  MapPin,
  Plus
} from 'lucide-react';
import { MemoryItem } from '../types';
import { soundManager } from '../utils/audioHelper';

interface LeoCinemaTourProps {
  memories: MemoryItem[];
  isOpen?: boolean;
  onClose: () => void;
  onSelectMemory: (mem: MemoryItem) => void;
  onOpenAddStory?: () => void;
}

export const LeoCinemaTour: React.FC<LeoCinemaTourProps> = ({
  memories,
  isOpen = true,
  onClose,
  onSelectMemory,
  onOpenAddStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeMem = memories[currentIndex] || memories[0];

  const handleNext = useCallback(() => {
    soundManager.playMemoryChime(1.1);
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  }, [memories.length]);

  const handlePrev = useCallback(() => {
    soundManager.playMemoryChime(0.9);
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  }, [memories.length]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!isOpen || !isPlaying || memories.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, memories.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !activeMem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07050d]/95 p-2 sm:p-4 select-none font-pixel animate-fadeIn">
      
      {/* CINEMA VIGNETTE FRAME */}
      <div className="relative w-full max-w-3xl pixel-box p-3 sm:p-5 flex flex-col justify-between border-2 border-[#f59e0b] shadow-2xl max-h-[94vh] overflow-y-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-[#3e2e5c] pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base">🎬</span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#ffd285] uppercase tracking-wide">
                Leo Cinema Tour
              </h2>
              <p className="text-[9px] sm:text-[10px] text-[#cbd5e1]">
                Story {currentIndex + 1} of {memories.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-0.5 border font-bold text-[10px] flex items-center gap-1 ${
                isPlaying ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24]' : 'bg-[#181328] text-white border-[#3e2e5c]'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Autoplay' : 'Paused'}</span>
            </button>

            {onOpenAddStory && (
              <button
                onClick={onOpenAddStory}
                className="pixel-btn px-2 py-0.5 bg-[#f59e0b] text-[#1c120c] text-[10px] font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">+ Add Story</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 bg-[#181328] border border-[#3e2e5c] text-[#cbd5e1] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CINEMA STAGE */}
        <div 
          onClick={() => onSelectMemory(activeMem)}
          className="relative aspect-16/9 bg-[#05030a] border border-[#3e2e5c] overflow-hidden flex items-center justify-center my-1 cursor-pointer group"
        >
          {activeMem.mediaUrl ? (
            <img
              src={activeMem.mediaUrl}
              alt={activeMem.title || 'Memory'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain pixelated transition-all duration-500 group-hover:scale-102"
            />
          ) : (
            <div className="p-4 sm:p-8 text-center space-y-2 max-w-lg">
              <span className="text-3xl">✨</span>
              <p className="font-pixel text-xs sm:text-sm text-[#fef08a] italic leading-relaxed">
                “{activeMem.content}”
              </p>
              <div className="text-[10px] text-[#ffd285]">— {activeMem.author}</div>
            </div>
          )}

          {activeMem.location && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#000000]/80 border border-[#ffd285] text-[9px] text-[#ffd285] flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#f43f5e]" />
              <span>{activeMem.location}</span>
            </div>
          )}
        </div>

        {/* DIALOGUE & CAPTION BOX */}
        <div className="bg-[#100d1c] border border-[#3e2e5c] p-2.5 sm:p-3 my-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#ffd285]">
            <span className="uppercase">{activeMem.title || 'Story for Leo'}</span>
            <span className="text-[#cbd5e1]">by {activeMem.author}</span>
          </div>

          <p className="text-[11px] sm:text-xs text-[#f1f5f9] leading-relaxed line-clamp-3">
            {activeMem.content}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[#251e3e] text-[9px] text-[#94a3b8]">
            <div className="flex gap-1">
              {activeMem.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[#ffd285]">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[#f43f5e]">
              <Heart className="w-2.5 h-2.5 fill-current" />
              <span>{activeMem.likes}</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrev}
            className="pixel-btn px-2.5 sm:px-3 py-1 bg-[#181328] hover:bg-[#291e45] text-[#ffd285] font-bold text-[10px] sm:text-xs flex items-center gap-1"
          >
            <SkipBack className="w-3 h-3" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {memories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playMemoryChime(1.0);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 border transition-all ${
                  idx === currentIndex
                    ? 'bg-[#f59e0b] border-[#fbbf24] scale-125'
                    : 'bg-[#291e45] border-[#3e2e5c] opacity-60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="pixel-btn px-2.5 sm:px-3 py-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-[10px] sm:text-xs flex items-center gap-1"
          >
            <span>Next</span>
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
