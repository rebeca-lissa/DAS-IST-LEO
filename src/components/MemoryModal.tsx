import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Calendar, 
  Volume2, 
  Play, 
  Pause,
  ArrowLeft,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { MemoryItem } from '../types';
import { soundManager } from '../utils/audioHelper';

interface MemoryModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleReaction: (memoryId: string, emoji: string) => void;
  onLike: (memoryId: string) => void;
  onTagClick?: (tag: string) => void;
  allMemories?: MemoryItem[];
  onSelectOtherMemory?: (memory: MemoryItem) => void;
}

const AVAILABLE_REACTIONS = ['❤️', '🐒', '✨', '⛰️', '🎵', '🍻'];

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memory,
  onClose,
  onPrev,
  onNext,
  onToggleReaction,
  onLike,
  onTagClick,
  allMemories,
  onSelectOtherMemory,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: 'c1', author: 'Beca', text: 'Always in our hearts! ❤️', time: 'Just now' }
  ]);

  if (!memory) return null;

  // Derive previous / next index if allMemories is provided
  const currentIndex = allMemories ? allMemories.findIndex((m) => m.id === memory.id) : -1;
  const canGoPrev = onPrev || (allMemories && currentIndex > 0);
  const canGoNext = onNext || (allMemories && currentIndex >= 0 && currentIndex < allMemories.length - 1);

  const handlePrevClick = () => {
    if (onPrev) {
      onPrev();
    } else if (allMemories && onSelectOtherMemory && currentIndex > 0) {
      soundManager.playMemoryChime(0.9);
      onSelectOtherMemory(allMemories[currentIndex - 1]);
    }
  };

  const handleNextClick = () => {
    if (onNext) {
      onNext();
    } else if (allMemories && onSelectOtherMemory && currentIndex < allMemories.length - 1) {
      soundManager.playMemoryChime(1.1);
      onSelectOtherMemory(allMemories[currentIndex + 1]);
    }
  };

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      if (stopAudioFn) stopAudioFn();
      setIsPlayingAudio(false);
      setStopAudioFn(null);
    } else {
      soundManager.playMemoryChime(1.1);
      setIsPlayingAudio(true);
      const stop = soundManager.playSynthesizedVoiceNote(memory.title || memory.content, () => {
        setIsPlayingAudio(false);
        setStopAudioFn(null);
      });
      setStopAudioFn(() => stop);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    soundManager.playMemoryChime(1.3);
    setLocalComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'Friend',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0c0917]/90 overflow-y-auto animate-fadeIn select-none font-pixel">
      <div className="relative w-full max-w-xl pixel-box p-4 sm:p-5 my-4 space-y-3.5 shadow-2xl border-2 border-[#f59e0b] max-h-[92vh] overflow-y-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-[#3e2e5c] pb-2">
          <div className="flex items-center gap-1">
            {canGoPrev && (
              <button
                onClick={handlePrevClick}
                title="Previous story"
                className="p-1 bg-[#181328] border border-[#3e2e5c] text-[#cbd5e1] hover:text-white hover:border-[#f59e0b]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {canGoNext && (
              <button
                onClick={handleNextClick}
                title="Next story"
                className="p-1 bg-[#181328] border border-[#3e2e5c] text-[#cbd5e1] hover:text-white hover:border-[#f59e0b]"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-pixel-retro text-[8px] text-[#ffd285] uppercase tracking-wider ml-1">
              Memory Detail
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playMemoryChime(1.4);
                onLike(memory.id);
              }}
              className="px-2 py-0.5 bg-[#881337] border border-[#f43f5e] text-white text-[10px] flex items-center gap-1 font-bold"
            >
              <Heart className="w-3 h-3 fill-current text-[#fda4af]" />
              <span>{memory.likes}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 bg-[#181328] border border-[#3e2e5c] text-[#cbd5e1] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MEDIA DISPLAY (IF POLAROID OR HAS MEDIA) */}
        {memory.mediaUrl && (
          <div className="relative aspect-16/9 bg-[#0c0917] border border-[#573318] overflow-hidden">
            <img
              src={memory.mediaUrl}
              alt={memory.title || 'Memory'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover pixelated"
            />
            {memory.location && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#181328]/90 border border-[#ffd285] text-[#ffd285] text-[10px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#f43f5e]" />
                <span>{memory.location}</span>
              </div>
            )}
          </div>
        )}

        {/* VOICE PLAYBACK BAR IF AUDIO */}
        {memory.type === 'audio' && (
          <div className="p-3 bg-[#064e3b] border border-[#34d399] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#065f46] border border-[#34d399] flex items-center justify-center text-[#34d399]">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-pixel text-[11px] font-bold text-[#ecfdf5]">
                  Voice Message ({memory.audioDuration || 30}s)
                </div>
                <div className="font-pixel text-[9px] text-[#a7f3d0]">
                  Recorded with love for Leo
                </div>
              </div>
            </div>

            <button
              onClick={handleAudioToggle}
              className="pixel-btn px-3 py-1 bg-[#34d399] hover:bg-[#6ee7b7] text-[#022c22] font-bold text-xs flex items-center gap-1"
            >
              {isPlayingAudio ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              <span>{isPlayingAudio ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        )}

        {/* STORY CONTENT & INFO */}
        <div className="space-y-2">
          {memory.title && (
            <h2 className="text-sm sm:text-base font-bold text-[#ffd285] uppercase tracking-wide">
              {memory.title}
            </h2>
          )}

          <p className="font-pixel text-xs sm:text-[13px] text-[#f1f5f9] leading-relaxed bg-[#100d1c] p-3 border border-[#3e2e5c]">
            {memory.content}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#cbd5e1] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#ffd285]">From: {memory.author}</span>
              {memory.authorRelation && (
                <span className="text-[#94a3b8]">({memory.authorRelation})</span>
              )}
            </div>

            {memory.date && (
              <div className="flex items-center gap-1 text-[#94a3b8]">
                <Calendar className="w-3 h-3" />
                <span>{memory.date}</span>
              </div>
            )}
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-1 pt-1">
            {memory.tags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (onTagClick) onTagClick(t);
                  onClose();
                }}
                className="px-1.5 py-0.5 bg-[#181328] hover:bg-[#f59e0b] hover:text-[#1c120c] border border-[#3e2e5c] text-[#ffd285] text-[9px] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* EMOJI REACTION TRAY */}
        <div className="border-t border-[#3e2e5c] pt-2">
          <div className="text-[10px] text-[#cbd5e1] mb-1 font-bold">Leave a reaction for this story:</div>
          <div className="flex flex-wrap gap-1">
            {AVAILABLE_REACTIONS.map((emoji) => {
              const reaction = memory.reactions.find((r) => r.emoji === emoji);
              const count = reaction ? reaction.count : 0;
              const hasReacted = reaction ? reaction.userReacted : false;

              return (
                <button
                  key={emoji}
                  onClick={() => {
                    soundManager.playMemoryChime(1.2);
                    onToggleReaction(memory.id, emoji);
                  }}
                  className={`px-2 py-0.5 border text-xs flex items-center gap-1 transition-all ${
                    hasReacted
                      ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold shadow-[1px_1px_0_#451a03]'
                      : 'bg-[#181328] text-[#e2e8f0] border-[#3e2e5c] hover:border-[#f59e0b]'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="border-t border-[#3e2e5c] pt-2 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#ffd285]">
            <MessageCircle className="w-3 h-3 text-[#f59e0b]" />
            <span>Replies ({localComments.length})</span>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {localComments.map((c) => (
              <div key={c.id} className="bg-[#100d1c] p-1.5 border border-[#231b3b] text-[10px]">
                <span className="font-bold text-[#ffd285]">{c.author}: </span>
                <span className="text-[#f1f5f9]">{c.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a quick reply..."
              className="flex-1 bg-[#100d1c] border border-[#3e2e5c] px-2 py-1 text-[10px] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
            />
            <button
              type="submit"
              className="pixel-btn px-2.5 py-1 bg-[#f59e0b] text-[#1c120c] font-bold text-[10px]"
            >
              Reply
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
