import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Calendar, 
  Play, 
  Pause, 
  Tag as TagIcon, 
  Sparkles
} from 'lucide-react';
import { MemoryItem } from '../types';
import { soundManager } from '../utils/audioHelper';

interface MemoryModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
  onLike: (memoryId: string) => void;
  onToggleReaction: (memoryId: string, emoji: string) => void;
  onTagClick: (tag: string) => void;
  allMemories: MemoryItem[];
  onSelectOtherMemory: (memory: MemoryItem) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memory,
  onClose,
  onLike,
  onToggleReaction,
  onTagClick,
  allMemories,
  onSelectOtherMemory,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);

  if (!memory) return null;

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

  const relatedMemories = allMemories.filter(
    (m) => m.id !== memory.id && m.tags.some((t) => memory.tags.includes(t))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0917]/90 overflow-y-auto animate-fadeIn select-none font-pixel">
      <div className="relative w-full max-w-2xl pixel-box p-5 md:p-6 my-6 space-y-4">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b-2 border-[#3e2e5c] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#ffd285] uppercase">
              {memory.type === 'polaroid' ? '📸 Photo' : memory.type === 'audio' ? '🎙️ Voice Note' : memory.type === 'letter' ? '💌 Letter' : '📝 Note'}
            </span>
          </div>

          <button
            onClick={() => {
              if (stopAudioFn) stopAudioFn();
              onClose();
            }}
            className="p-1.5 bg-[#181328] border-2 border-[#3e2e5c] text-[#cbd5e1] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* PHOTO IF POLAROID */}
          {memory.mediaUrl && (
            <div className="w-full max-h-96 overflow-hidden bg-[#0a0814] border-2 border-[#573318] flex items-center justify-center">
              <img
                src={memory.mediaUrl}
                alt={memory.title || 'Memory'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pixelated"
              />
            </div>
          )}

          {/* AUDIO PLAYER IF AUDIO CAPSULE */}
          {memory.type === 'audio' && (
            <div className="p-4 pixel-box-green flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAudioToggle}
                  className={`p-3 border-2 transition-all ${
                    isPlayingAudio
                      ? 'bg-[#34d399] text-[#022c22] border-[#a7f3d0] font-bold'
                      : 'bg-[#065f46] text-[#ecfdf5] border-[#34d399] hover:bg-[#10b981]'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-[#ecfdf5]">
                    {isPlayingAudio ? 'Playing voice note...' : 'Listen to Voice Note'}
                  </h4>
                  <p className="text-[10px] text-[#a7f3d0]">
                    Duration: ~{memory.audioDuration || 30} seconds
                  </p>
                </div>
              </div>

              {/* Pixel Equalizer waveform */}
              <div className="h-8 px-2 bg-[#064e3b] border-2 border-[#047857] flex items-center gap-1">
                {[30, 80, 45, 100, 60, 90, 40, 75, 50, 95, 35, 85].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: isPlayingAudio ? `${Math.max(20, h * (0.4 + Math.sin(Date.now() / 150 + i) * 0.6))}%` : `${h * 0.4}%`,
                      transition: 'height 0.15s ease',
                    }}
                    className={`w-1 ${isPlayingAudio ? 'bg-[#34d399]' : 'bg-[#059669]'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TITLE & CONTENT */}
          <div className="p-4 bg-[#100d1c] border-2 border-[#3e2e5c] space-y-2">
            {memory.title && (
              <h3 className="text-sm md:text-base font-bold text-[#ffd285] uppercase">
                {memory.title}
              </h3>
            )}
            <p className="text-xs md:text-sm text-[#f1f5f9] leading-relaxed whitespace-pre-line">
              {memory.content}
            </p>
          </div>

          {/* METADATA: AUTHOR, DATE, LOCATION */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#100d1c] border-2 border-[#3e2e5c] text-xs">
            <div className="flex items-center gap-2">
              {memory.authorAvatar ? (
                <img
                  src={memory.authorAvatar}
                  alt={memory.author}
                  className="w-7 h-7 border border-[#f59e0b] object-cover pixelated"
                />
              ) : (
                <div className="w-7 h-7 bg-[#451a03] border border-[#f59e0b] flex items-center justify-center text-[#ffd285] font-bold text-xs">
                  {memory.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-[#ffd285]">{memory.author}</div>
                {memory.authorRelation && (
                  <div className="text-[10px] text-[#cbd5e1]">{memory.authorRelation}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#cbd5e1]">
              {memory.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>{memory.location}</span>
                </div>
              )}
              {memory.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{memory.date}</span>
                </div>
              )}
            </div>
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <TagIcon className="w-3.5 h-3.5 text-[#f59e0b] mr-1" />
            {memory.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onTagClick(tag);
                  onClose();
                }}
                className="text-[10px] px-2 py-0.5 bg-[#100d1c] hover:bg-[#f59e0b] text-[#cbd5e1] hover:text-[#1c120c] border border-[#3e2e5c] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* REACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[#3e2e5c]">
            <div className="flex items-center gap-1">
              {['❤️', '✨', '🎂', '😂', '🥺', '🥂'].map((emoji) => {
                const reaction = memory.reactions.find((r) => r.emoji === emoji);
                const hasReacted = reaction?.userReacted;
                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      soundManager.playMemoryChime(1.3);
                      onToggleReaction(memory.id, emoji);
                    }}
                    className={`text-xs px-2 py-1 border transition-all ${
                      hasReacted
                        ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold'
                        : 'bg-[#100d1c] text-[#cbd5e1] border-[#3e2e5c] hover:border-[#f59e0b]'
                    }`}
                  >
                    <span>{emoji}</span>
                    {reaction && reaction.count > 0 && (
                      <span className="text-[10px] ml-1 font-mono">{reaction.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                soundManager.playMemoryChime(1.5);
                onLike(memory.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#881337] hover:bg-[#f43f5e] text-[#ffe4e6] hover:text-white border border-[#fb7185] text-xs font-bold transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{memory.likes} Loves</span>
            </button>
          </div>

          {/* RELATED MEMORIES */}
          {relatedMemories.length > 0 && (
            <div className="pt-3 border-t-2 border-[#3e2e5c] space-y-2">
              <span className="text-xs font-bold text-[#ffd285] flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Related Stories ({relatedMemories.length})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedMemories.slice(0, 4).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectOtherMemory(rel)}
                    className="p-2.5 bg-[#100d1c] border border-[#3e2e5c] hover:border-[#ffd285] cursor-pointer transition-all"
                  >
                    <div className="text-[9px] text-[#f59e0b] font-medium capitalize">
                      {rel.type} by {rel.author}
                    </div>
                    <div className="text-xs font-semibold text-[#f1f5f9] line-clamp-1">
                      {rel.title || rel.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
