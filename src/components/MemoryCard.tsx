import React, { useState } from 'react';
import { Play, Pause, Heart, MapPin, Sparkles, Volume2 } from 'lucide-react';
import { MemoryItem } from '../types';
import { soundManager } from '../utils/audioHelper';

interface MemoryCardProps {
  memory: MemoryItem;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onSelect: (memory: MemoryItem) => void;
  onTagClick?: (tag: string) => void;
  onToggleReaction: (memoryId: string, emoji: string) => void;
  onLike: (memoryId: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  isSelected,
  isHighlighted,
  onSelect,
  onTagClick,
  onToggleReaction,
  onLike,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playMemoryChime(1.4);
    onLike(memory.id);
  };

  const handleReaction = (e: React.MouseEvent, emoji: string) => {
    e.stopPropagation();
    soundManager.playMemoryChime(1.2);
    onToggleReaction(memory.id, emoji);
  };

  const rotationAngle = memory.position.rotation || 0;

  return (
    <div
      id={`memory-card-${memory.id}`}
      onClick={() => onSelect(memory)}
      style={{
        transform: `rotate(${rotationAngle}deg)`,
      }}
      className={`relative group cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? 'scale-105 z-40 ring-3 ring-[#ffd285] shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
          : isHighlighted
          ? 'scale-102 z-30 ring-2 ring-[#fbbf24] shadow-[0_6px_14px_rgba(0,0,0,0.7)]'
          : 'hover:scale-102 hover:z-20'
      }`}
    >
      {/* 16-BIT RETRO PIXEL TAPE / SEAL PIN */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
        {memory.type === 'polaroid' ? (
          <div className="w-12 h-2.5 bg-[#ffd285] border border-[#b45309] shadow-[1px_1px_0_#451a03] -rotate-2" />
        ) : memory.type === 'sticky' ? (
          <div className="w-3.5 h-3.5 bg-[#f43f5e] border border-[#881337] shadow-[1px_1px_0_#4c0519] flex items-center justify-center text-[8px] text-white font-bold">
            ★
          </div>
        ) : (
          <div className="w-10 h-2 bg-[#34d399] border border-[#065f46] shadow-[1px_1px_0_#022c22]" />
        )}
      </div>

      {/* 1. POLAROID PHOTO */}
      {memory.type === 'polaroid' && (
        <div className="w-64 sm:w-72 p-2.5 bg-[#f6e8cc] border-3 border-[#573318] shadow-[3px_4px_0_#2b170a] text-[#291d12]">
          {/* Photo Frame */}
          <div className="relative aspect-4/3 overflow-hidden bg-[#1c120c] mb-2 border border-[#573318]">
            {memory.mediaUrl ? (
              <img
                src={memory.mediaUrl}
                alt={memory.title || 'Memory for Leo'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pixelated"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#ffd285] gap-1">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-pixel text-[10px]">Photo with Leo</span>
              </div>
            )}
            {memory.location && (
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#1e1b2e]/90 border border-[#ffd285] text-[9px] text-[#ffd285] font-pixel flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#f43f5e]" />
                <span>{memory.location}</span>
              </div>
            )}
          </div>

          <div className="px-0.5">
            {memory.title && (
              <h3 className="font-pixel text-[10px] sm:text-[11px] font-bold text-[#451a03] mb-0.5 line-clamp-1 uppercase tracking-wide">
                {memory.title}
              </h3>
            )}
            <p className="font-handwriting text-[#3b2314] text-base sm:text-lg leading-snug line-clamp-3 mb-1.5 font-bold">
              “{memory.content}”
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#8d5b35]/30 text-[10px] font-pixel text-[#573318]">
              <div className="flex items-center gap-1">
                {memory.authorAvatar ? (
                  <img
                    src={memory.authorAvatar}
                    alt={memory.author}
                    className="w-3.5 h-3.5 rounded-none border border-[#573318] object-cover"
                  />
                ) : (
                  <span className="text-[10px]">👤</span>
                )}
                <span className="font-bold">{memory.author}</span>
              </div>
              {memory.date && <span className="text-[9px] text-[#78350f]">{memory.date}</span>}
            </div>
          </div>
        </div>
      )}

      {/* 2. VOICE CRYSTAL / CASSETTE */}
      {memory.type === 'audio' && (
        <div className="w-64 sm:w-72 p-3 pixel-box-green text-[#d1fae5]">
          <div className="flex items-start justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-[#065f46] border border-[#34d399] flex items-center justify-center text-[#6ee7b7] shadow-[1px_1px_0_#022c22]">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <span className="font-pixel-retro text-[7px] uppercase tracking-wider text-[#34d399]">
                  🎙️ VOICE
                </span>
                <h4 className="font-pixel text-[10px] sm:text-[11px] font-bold text-[#ecfdf5] line-clamp-1">
                  {memory.title || 'Voice message for Leo'}
                </h4>
              </div>
            </div>

            <button
              onClick={handleAudioToggle}
              id={`audio-play-btn-${memory.id}`}
              className={`p-1.5 border transition-all ${
                isPlayingAudio
                  ? 'bg-[#34d399] text-[#022c22] border-[#a7f3d0] font-bold'
                  : 'bg-[#065f46] text-[#ecfdf5] border-[#34d399] hover:bg-[#10b981]'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </button>
          </div>

          {/* EQUALIZER */}
          <div className="h-6 px-1.5 bg-[#064e3b] border border-[#047857] flex items-center justify-center gap-0.5 mb-1.5">
            {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85, 50].map((h, i) => (
              <div
                key={i}
                style={{
                  height: isPlayingAudio ? `${Math.max(20, (h * (0.5 + Math.sin(Date.now() / 200 + i) * 0.5)))}%` : `${h * 0.35}%`,
                  transition: 'height 0.1s ease',
                }}
                className={`w-0.5 ${isPlayingAudio ? 'bg-[#34d399]' : 'bg-[#059669]'}`}
              />
            ))}
          </div>

          <p className="font-pixel text-[10px] text-[#a7f3d0] italic mb-1.5 line-clamp-2">
            “{memory.content}”
          </p>

          <div className="flex items-center justify-between font-pixel text-[9px] text-[#6ee7b7] pt-1 border-t border-[#065f46]">
            <span className="font-bold">From: {memory.author}</span>
            <span className="text-[8px] text-[#34d399] font-mono">{memory.audioDuration || 30}s</span>
          </div>
        </div>
      )}

      {/* 3. PARCHMENT SCROLL / LETTER */}
      {memory.type === 'letter' && (
        <div className="w-68 sm:w-76 p-3 pixel-box-rose text-[#ffe4e6]">
          <div className="flex items-center justify-between mb-1.5 text-[#fb7185] font-pixel text-[10px]">
            <span className="uppercase font-bold text-[9px]">📜 Letter</span>
            {memory.date && <span className="text-[#fda4af] text-[9px]">{memory.date}</span>}
          </div>

          {memory.title && (
            <h3 className="font-pixel text-[11px] font-bold text-[#fff1f2] mb-1 uppercase">
              {memory.title}
            </h3>
          )}

          <p className="font-pixel text-[10px] text-[#ffe4e6] leading-relaxed line-clamp-4 italic mb-2">
            {memory.content}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[#881337] font-pixel text-[10px]">
            <span className="font-bold text-[#fff1f2]">{memory.author}</span>
            {memory.authorRelation && (
              <span className="text-[9px] text-[#fda4af]">({memory.authorRelation})</span>
            )}
          </div>
        </div>
      )}

      {/* 4. STICKY NOTE */}
      {memory.type === 'sticky' && (
        <div className="w-52 sm:w-60 p-3 pixel-box text-[#e0e7ff]">
          <div className="font-pixel text-[9px] font-bold text-[#ffd285] uppercase mb-0.5">
            💬 {memory.title || 'Note'}
          </div>
          <div className="font-handwriting text-lg sm:text-xl text-[#fef08a] leading-tight my-1 font-bold">
            {memory.content}
          </div>
          <div className="text-right font-pixel text-[9px] text-[#cbd5e1] mt-1.5 pt-0.5 border-t border-[#3e2e5c]">
            — {memory.author}
          </div>
        </div>
      )}

      {/* 5. QUOTE BOX */}
      {memory.type === 'quote' && (
        <div className="w-60 sm:w-68 p-3 pixel-box text-[#fef3c7]">
          <span className="font-pixel-retro text-lg text-[#f59e0b] leading-none">“</span>
          <p className="font-pixel text-[10px] sm:text-[11px] text-[#fef3c7] font-semibold italic my-0.5">
            {memory.content}
          </p>
          <div className="text-right font-pixel text-[9px] text-[#ffd285] mt-1.5 pt-0.5 border-t border-[#3e2e5c]">
            {memory.title ? `— ${memory.title}` : `— Leo, told by ${memory.author}`}
          </div>
        </div>
      )}

      {/* FOOTER TAGS & REACTIONS */}
      <div className="px-2 pb-1.5 pt-1 flex flex-wrap items-center justify-between gap-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-0.5">
          {memory.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="font-pixel text-[8px] sm:text-[9px] px-1 py-0.2 bg-[#120e1f] hover:bg-[#f59e0b] text-[#cbd5e1] hover:text-[#1c120c] border border-[#3e2e5c] transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Reaction Buttons */}
        <div className="flex items-center gap-0.5 ml-auto">
          {memory.reactions.slice(0, 2).map((r) => (
            <button
              key={r.emoji}
              onClick={(e) => handleReaction(e, r.emoji)}
              className={`font-pixel text-[9px] px-1 py-0.2 border flex items-center gap-0.5 transition-all ${
                r.userReacted
                  ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold'
                  : 'bg-[#120e1f] text-[#cbd5e1] border-[#3e2e5c] hover:border-[#f59e0b]'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.count}</span>
            </button>
          ))}

          <button
            onClick={handleLike}
            className="p-0.5 text-[#f43f5e] hover:scale-110 transition-transform flex items-center gap-0.5 font-pixel text-[9px]"
          >
            <Heart className="w-2.5 h-2.5 fill-current" />
            <span>{memory.likes}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
