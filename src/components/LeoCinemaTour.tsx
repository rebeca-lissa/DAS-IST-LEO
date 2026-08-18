import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  Heart, 
  MapPin, 
  Calendar,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { MemoryItem } from '../types';
import { soundManager } from '../utils/audioHelper';
import { SootSprite } from './SootSprite';

interface LeoCinemaTourProps {
  memories: MemoryItem[];
  onClose: () => void;
  onSelectMemory?: (memory: MemoryItem) => void;
  onOpenAddStory?: () => void;
}

export const LeoCinemaTour: React.FC<LeoCinemaTourProps> = ({
  memories,
  onClose,
  onOpenAddStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const progressTimerRef = useRef<number | null>(null);

  const activeMemory = memories[currentIndex] || memories[0];

  // Start ambient chiptune music on tour mount
  useEffect(() => {
    if (!isAudioMuted && memories.length > 0) {
      soundManager.startAmbientTourSound();
    }
    return () => {
      soundManager.stopAmbientTourSound();
    };
  }, [isAudioMuted, memories.length]);

  // Handle slide auto-advance
  useEffect(() => {
    if (isPlaying && memories.length > 0) {
      progressTimerRef.current = window.setTimeout(() => {
        handleNext();
      }, 7500); // 7.5s per memory scene
    } else {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    }
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, [currentIndex, isPlaying, memories.length]);

  // Typewriter effect for story text
  useEffect(() => {
    setTypedChars(0);
    const content = activeMemory ? activeMemory.content : '';
    const interval = setInterval(() => {
      setTypedChars((prev) => {
        if (prev < content.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [activeMemory]);

  const handleNext = () => {
    soundManager.playMemoryChime(1.1);
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const handlePrev = () => {
    soundManager.playMemoryChime(0.9);
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const togglePlayPause = () => {
    soundManager.playMemoryChime(1.0);
    setIsPlaying(!isPlaying);
  };

  const toggleAudio = () => {
    if (isAudioMuted) {
      soundManager.startAmbientTourSound();
      setIsAudioMuted(false);
    } else {
      soundManager.stopAmbientTourSound();
      setIsAudioMuted(true);
    }
  };

  // EMPTY STATE IF NO STORIES
  if (memories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0917]/95 flex flex-col justify-center items-center p-6 select-none animate-fadeIn font-pixel text-center">
        <div className="max-w-md pixel-box p-8 space-y-4">
          <div className="text-4xl">🎬</div>
          <h3 className="text-lg font-bold text-[#ffd285] uppercase">
            Kino Tour is Empty
          </h3>
          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            No memories or photos have been added yet. Add stories first, then watch them glide across the Alpine cinema!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="pixel-btn px-4 py-2 bg-[#1e1b2e] text-[#cbd5e1] hover:text-white text-xs font-bold"
            >
              Back to Map
            </button>
            {onOpenAddStory && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddStory();
                }}
                className="pixel-btn px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Story</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0917]/95 flex flex-col justify-between p-4 md:p-6 select-none animate-fadeIn">
      
      {/* 1. TOP CINEMA BAR */}
      <div className="flex items-center justify-between z-20 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="pixel-box px-3 py-1 bg-[#181328] border-2 border-[#f59e0b] flex items-center gap-2">
            <span className="text-sm">🎬</span>
            <span className="font-pixel text-xs font-bold text-[#ffd285] uppercase">
              Kino • Story {currentIndex + 1} of {memories.length}
            </span>
          </div>

          <button
            onClick={toggleAudio}
            className="p-1.5 bg-[#181328] border-2 border-[#3e2e5c] text-[#cbd5e1] hover:text-[#ffd285] font-pixel text-xs"
            title={isAudioMuted ? 'Unmute chiptune ambient' : 'Mute music'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-[#f43f5e]" /> : <Volume2 className="w-4 h-4 text-[#34d399] animate-pulse" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="pixel-btn px-3 py-1 bg-[#f43f5e] hover:bg-[#fb7185] text-white font-pixel text-xs font-bold flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
          <span>Exit Kino</span>
        </button>
      </div>

      {/* 2. MAIN CINEMA STAGE */}
      <div className="relative flex-1 max-w-5xl w-full mx-auto my-3 flex flex-col justify-center items-center overflow-hidden">
        
        <div className="relative w-full max-w-3xl pixel-box p-4 md:p-6 bg-[#181328] border-4 border-[#d97706] shadow-[0_12px_32px_rgba(0,0,0,0.8)]">
          
          <SootSprite x={20} y={15} size={30} holdingItem="star-candy" label="Leo’s story" />
          <SootSprite x={620} y={15} size={32} holdingItem="cake" label="Happy Birthday!" />

          {/* MEDIA DISPLAY IF POLAROID OR AUDIO */}
          {activeMemory.mediaUrl ? (
            <div className="relative w-full h-64 md:h-80 bg-[#0a0814] border-2 border-[#573318] mb-4 overflow-hidden flex items-center justify-center">
              <img
                src={activeMemory.mediaUrl}
                alt={activeMemory.title || 'Memory'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pixelated"
              />
              {activeMemory.location && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#181328]/90 border border-[#ffd285] text-[#ffd285] font-pixel text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#f43f5e]" />
                  <span>{activeMemory.location}</span>
                </div>
              )}
            </div>
          ) : activeMemory.type === 'audio' ? (
            <div className="w-full h-40 bg-[#064e3b] border-2 border-[#34d399] mb-4 flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 bg-[#065f46] border-2 border-[#34d399] flex items-center justify-center text-[#6ee7b7] mb-2">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="font-pixel text-xs text-[#ecfdf5] font-bold">
                🎙️ Voice Note from {activeMemory.author}
              </div>
              <div className="font-pixel text-[10px] text-[#a7f3d0] mt-1">
                Duration: ~{activeMemory.audioDuration || 30} seconds
              </div>
            </div>
          ) : null}

          {/* RETRO DIALOGUE BOX */}
          <div className="p-4 bg-[#100d1c] border-2 border-[#3e2e5c] space-y-2">
            <div className="flex items-center justify-between font-pixel">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-[#451a03] text-[#ffd285] border border-[#f59e0b] text-[11px] font-bold">
                  {activeMemory.author} {activeMemory.authorRelation ? `(${activeMemory.authorRelation})` : ''}
                </div>
                {activeMemory.title && (
                  <span className="text-xs font-bold text-[#ffd285] uppercase">
                    • {activeMemory.title}
                  </span>
                )}
              </div>

              {activeMemory.date && (
                <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#38bdf8]" />
                  <span>{activeMemory.date}</span>
                </span>
              )}
            </div>

            <p className="font-pixel text-xs md:text-sm text-[#f1f5f9] leading-relaxed min-h-[50px]">
              “{activeMemory.content.slice(0, typedChars)}”
              {typedChars < activeMemory.content.length && (
                <span className="inline-block w-2 h-3.5 bg-[#ffd285] ml-0.5 animate-pulse" />
              )}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#3e2e5c] font-pixel text-[10px]">
              <div className="flex items-center gap-1">
                {activeMemory.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 bg-[#181328] text-[#cbd5e1] border border-[#3e2e5c]">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[#f43f5e]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{activeMemory.likes} loves</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. TIMELINE & CONTROLS */}
      <div className="w-full max-w-5xl mx-auto space-y-2 z-20">
        <div className="flex items-center justify-center gap-1.5 py-1">
          {memories.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                soundManager.playMemoryChime(1.0);
                setCurrentIndex(idx);
              }}
              className={`h-2 transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-[#f59e0b] border border-[#fbbf24]'
                  : 'w-2 bg-[#3e2e5c] hover:bg-[#6366f1]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between font-pixel">
          <button
            onClick={handlePrev}
            className="pixel-btn px-3 py-1.5 bg-[#181328] text-[#cbd5e1] hover:text-white text-xs font-bold flex items-center gap-1"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>◀ Prev</span>
          </button>

          <button
            onClick={togglePlayPause}
            className="pixel-btn px-5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] text-xs font-bold flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Slideshow'}</span>
          </button>

          <button
            onClick={handleNext}
            className="pixel-btn px-3 py-1.5 bg-[#181328] text-[#cbd5e1] hover:text-white text-xs font-bold flex items-center gap-1"
          >
            <span>Next ▶</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
