import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Tag as TagIcon, 
  Users, 
  Compass, 
  ArrowRight
} from 'lucide-react';
import { PromptWave, MemoryItem, TagInfo } from '../types';
import { soundManager } from '../utils/audioHelper';

interface CollectiveWavesViewProps {
  prompts: PromptWave[];
  memories: MemoryItem[];
  tags: TagInfo[];
  onSelectPromptToAnswer: (promptId: string) => void;
  onAddNewPrompt: (newPrompt: Omit<PromptWave, 'id' | 'createdAt' | 'responsesCount'>) => void;
  onTagClick: (tag: string) => void;
  onSelectMemory: (memory: MemoryItem) => void;
  onJumpToMapView: () => void;
}

export const CollectiveWavesView: React.FC<CollectiveWavesViewProps> = ({
  prompts,
  memories,
  tags,
  onSelectPromptToAnswer,
  onAddNewPrompt,
  onTagClick,
  onSelectMemory,
  onJumpToMapView,
}) => {
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newCreator, setNewCreator] = useState('');
  const [selectedTagDetail, setSelectedTagDetail] = useState<string | null>(null);

  const handleCreatePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newTag.trim() || !newCreator.trim()) return;

    soundManager.playLevelUpFanfare();
    const formattedTag = newTag.startsWith('#') ? newTag : `#${newTag}`;
    
    onAddNewPrompt({
      question: newQuestion.trim(),
      tag: formattedTag,
      creator: newCreator.trim(),
      color: ['#f59e0b', '#f43f5e', '#10b981', '#06b6d4', '#8b5cf6'][Math.floor(Math.random() * 5)],
    });

    setNewQuestion('');
    setNewTag('');
    setNewCreator('');
    setIsAddingPrompt(false);
  };

  const activeTagMemories = selectedTagDetail
    ? memories.filter((m) => m.tags.includes(selectedTagDetail))
    : [];

  const totalContributors = new Set(memories.map((m) => m.author)).size;

  return (
    <div className="w-full min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-65px)] bg-alpen-twilight text-[#f1f5f9] p-3 sm:p-6 md:p-8 overflow-y-auto select-none font-pixel">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-1.5 max-w-xl mx-auto pt-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#181328] border border-[#f59e0b] text-[#ffd285] text-[10px] sm:text-xs font-bold shadow-[1px_1px_0_#451a03]">
            <span>📜</span>
            <span>Questions & Prompts</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ffd285] uppercase tracking-wide drop-shadow-[0_1px_0_#451a03]">
            Waves for Leo
          </h2>
          <p className="text-[11px] sm:text-xs text-[#cbd5e1] leading-relaxed">
            Add a question or prompt for everyone to answer, or pick one below to share your story with Leo.
          </p>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 pixel-box text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#ffd285]">
              {totalContributors}
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#f59e0b]" />
              <span>Contributors</span>
            </div>
          </div>

          <div className="p-2 sm:p-3 pixel-box text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#f43f5e]">
              {memories.length}
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#f43f5e]" />
              <span>Total Stories</span>
            </div>
          </div>

          <div className="p-2 sm:p-3 pixel-box text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#34d399]">
              {prompts.length}
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#34d399]" />
              <span>Prompt Waves</span>
            </div>
          </div>
        </div>

        {/* PROMPTS GRID SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[#ffd285] uppercase tracking-wide flex items-center gap-1.5">
              <span>🌊</span>
              <span>Collective Prompts ({prompts.length})</span>
            </h3>

            <button
              onClick={() => {
                soundManager.playMemoryChime(1.1);
                setIsAddingPrompt(!isAddingPrompt);
              }}
              className="pixel-btn px-2.5 py-1 bg-[#291e45] text-[#ffd285] hover:bg-[#451a03] font-bold text-[10px] sm:text-[11px] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddingPrompt ? 'Cancel' : '+ New Question'}</span>
            </button>
          </div>

          {/* CREATE NEW PROMPT FORM */}
          {isAddingPrompt && (
            <form onSubmit={handleCreatePromptSubmit} className="pixel-box p-3.5 space-y-2.5 animate-fadeIn">
              <div className="font-pixel text-xs font-bold text-[#ffd285]">
                Ask a new question for everyone to answer for Leo:
              </div>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the most memorable conversation you've had with Leo?"
                className="w-full bg-[#100d1c] border border-[#3e2e5c] p-2 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag name (e.g. #LeoWisdom)"
                  className="bg-[#100d1c] border border-[#3e2e5c] px-2.5 py-1 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                />
                <input
                  type="text"
                  required
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  placeholder="Your Name (e.g. Beca)"
                  className="bg-[#100d1c] border border-[#3e2e5c] px-2.5 py-1 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="pixel-btn px-3 py-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs"
                >
                  Create Prompt
                </button>
              </div>
            </form>
          )}

          {/* PROMPTS LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((p) => {
              const matchingMemories = memories.filter((m) => m.tags.includes(p.tag) || m.promptId === p.id);

              return (
                <div
                  key={p.id}
                  className="pixel-box p-3 sm:p-3.5 space-y-2 flex flex-col justify-between"
                  style={{
                    borderColor: p.color || '#f59e0b',
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-1.5 py-0.2 text-[9px] font-bold border"
                        style={{
                          backgroundColor: `${p.color}22` || '#f59e0b22',
                          borderColor: p.color || '#f59e0b',
                          color: p.color || '#ffd285',
                        }}
                      >
                        {p.tag}
                      </span>
                      <span className="text-[9px] text-[#94a3b8]">by {p.creator}</span>
                    </div>

                    <h4 className="text-xs sm:text-[13px] font-bold text-[#f1f5f9] leading-snug">
                      {p.question}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-[#3e2e5c] flex items-center justify-between text-[10px]">
                    <span className="text-[#cbd5e1]">
                      {matchingMemories.length} {matchingMemories.length === 1 ? 'response' : 'responses'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          soundManager.playMemoryChime(1.2);
                          onSelectPromptToAnswer(p.id);
                        }}
                        className="pixel-btn px-2 py-0.5 bg-[#f59e0b] text-[#1c120c] font-bold text-[10px] flex items-center gap-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Answer</span>
                      </button>

                      {matchingMemories.length > 0 && (
                        <button
                          onClick={() => {
                            soundManager.playMemoryChime(1.0);
                            onTagClick(p.tag);
                            onJumpToMapView();
                          }}
                          className="px-1.5 py-0.5 bg-[#181328] hover:bg-[#291e45] text-[#ffd285] border border-[#3e2e5c] text-[10px] flex items-center gap-0.5"
                        >
                          <Compass className="w-2.5 h-2.5" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAG CLOUD */}
        <div className="pixel-box p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#ffd285] uppercase tracking-wide flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-[#f59e0b]" />
              <span>Ecosystem Constellation Tags</span>
            </h3>
            <span className="text-[9px] text-[#94a3b8]">{tags.length} themes</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  soundManager.playMemoryChime(1.1);
                  setSelectedTagDetail(selectedTagDetail === t.name ? null : t.name);
                }}
                className={`px-2 py-1 text-[10px] border flex items-center gap-1 transition-all ${
                  selectedTagDetail === t.name
                    ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold shadow-[1px_1px_0_#451a03]'
                    : 'bg-[#100d1c] text-[#cbd5e1] border-[#3e2e5c] hover:border-[#f59e0b]'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[9px] opacity-75">({t.count})</span>
              </button>
            ))}
          </div>

          {/* ACTIVE TAG STORIES ACCORDION */}
          {selectedTagDetail && (
            <div className="mt-3 pt-3 border-t border-[#3e2e5c] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#ffd285]">
                <span>Stories tagged with {selectedTagDetail}:</span>
                <button
                  onClick={() => {
                    onTagClick(selectedTagDetail);
                    onJumpToMapView();
                  }}
                  className="text-[10px] text-[#34d399] hover:underline flex items-center gap-0.5"
                >
                  <span>Filter map canvas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTagMemories.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMemory(m)}
                    className="p-2 bg-[#100d1c] hover:bg-[#1f1738] border border-[#3e2e5c] cursor-pointer text-[10px] transition-colors"
                  >
                    <div className="font-bold text-[#fde047] line-clamp-1">
                      {m.title || m.content.slice(0, 30)}
                    </div>
                    <div className="text-[#94a3b8] flex justify-between mt-1 text-[9px]">
                      <span>by {m.author}</span>
                      <span>❤️ {m.likes}</span>
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
