import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Tag as TagIcon, 
  Users, 
  Heart, 
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
    <div className="w-full min-h-[calc(100vh-65px)] bg-alpen-twilight text-[#f1f5f9] p-4 md:p-8 overflow-y-auto select-none font-pixel">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2 max-w-xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181328] border-2 border-[#f59e0b] text-[#ffd285] text-xs font-bold shadow-[2px_2px_0_#451a03]">
            <span>📜</span>
            <span>Questions & Prompts</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#ffd285] uppercase tracking-wider drop-shadow-[0_2px_0_#451a03]">
            Waves for Leo
          </h2>
          <p className="text-xs md:text-sm text-[#cbd5e1] leading-relaxed">
            Add a question or prompt for everyone to answer, or pick one below to share your story with Leo.
          </p>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 pixel-box text-center">
            <div className="text-xl md:text-2xl font-bold text-[#ffd285]">
              {totalContributors}
            </div>
            <div className="text-[11px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-[#f59e0b]" />
              <span>Friends Contributing</span>
            </div>
          </div>

          <div className="p-3 pixel-box text-center">
            <div className="text-xl md:text-2xl font-bold text-[#f43f5e]">
              {memories.length}
            </div>
            <div className="text-[11px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-[#f43f5e]" />
              <span>Stories Shared</span>
            </div>
          </div>

          <div className="p-3 pixel-box text-center">
            <div className="text-xl md:text-2xl font-bold text-[#38bdf8]">
              {prompts.length}
            </div>
            <div className="text-[11px] text-[#cbd5e1] mt-0.5 flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#38bdf8]" />
              <span>Active Questions</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: PROMPT WAVES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#ffd285] flex items-center gap-2 uppercase tracking-wide">
                <span>📜</span>
                <span>Active Questions & Prompts</span>
              </h3>
              <p className="text-xs text-[#cbd5e1]">
                Choose a question to answer or launch a new one
              </p>
            </div>

            <button
              onClick={() => setIsAddingPrompt(!isAddingPrompt)}
              className="pixel-btn px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add Question</span>
            </button>
          </div>

          {/* ADD PROMPT FORM */}
          {isAddingPrompt && (
            <form
              onSubmit={handleCreatePromptSubmit}
              className="p-5 pixel-box space-y-3 animate-fadeIn"
            >
              <div className="text-sm font-bold text-[#ffd285] uppercase">
                📜 Add a Question for Everyone to Answer
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                    Question / Prompt:
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. What is your favorite memory traveling with Leo?"
                    className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                    Tag / Topic:
                  </label>
                  <input
                    type="text"
                    required
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="#TravelWithLeo"
                    className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="w-1/2 max-w-xs">
                  <input
                    type="text"
                    required
                    value={newCreator}
                    onChange={(e) => setNewCreator(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPrompt(false)}
                    className="px-3 py-1 text-xs text-[#cbd5e1] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn px-4 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs"
                  >
                    Create Question
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PROMPTS GRID */}
          {prompts.length === 0 ? (
            <div className="p-8 pixel-box text-center space-y-2">
              <div className="text-2xl">✍️</div>
              <div className="text-sm font-bold text-[#ffd285]">No questions added yet</div>
              <p className="text-xs text-[#cbd5e1]">
                Be the first to add a question for friends to answer about Leo!
              </p>
              <button
                onClick={() => setIsAddingPrompt(true)}
                className="pixel-btn mt-2 px-3.5 py-1.5 bg-[#f59e0b] text-[#1c120c] text-xs font-bold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Question</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((prompt) => {
                const matchingMemories = memories.filter((m) => m.promptId === prompt.id || m.tags.includes(prompt.tag));
                
                return (
                  <div
                    key={prompt.id}
                    className="pixel-box p-4 flex flex-col justify-between group hover:border-[#ffd285] transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-[#451a03] text-[#ffd285] border border-[#f59e0b] text-[10px] font-bold">
                          {prompt.tag}
                        </span>
                        <span className="text-[#94a3b8] text-[10px]">By: {prompt.creator}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#ffd285] group-hover:text-white transition-colors uppercase">
                        {prompt.question}
                      </h4>

                      {prompt.description && (
                        <p className="text-[11px] text-[#cbd5e1] line-clamp-2">
                          {prompt.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t-2 border-[#3e2e5c] flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                        <MessageSquare className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>{matchingMemories.length} responses</span>
                      </div>

                      <button
                        onClick={() => {
                          soundManager.playMemoryChime(1.2);
                          onSelectPromptToAnswer(prompt.id);
                        }}
                        className="pixel-btn px-2.5 py-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] text-xs font-bold flex items-center gap-1"
                      >
                        <span>Answer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: TAGS & THEMES */}
        {tags.length > 0 && (
          <div className="space-y-4 pt-4 border-t-2 border-[#3e2e5c]">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#ffd285] flex items-center gap-2 uppercase tracking-wide">
                <span>🏷️</span>
                <span>Tags & Themes</span>
              </h3>
              <p className="text-xs text-[#cbd5e1]">
                Click any tag to see connected stories
              </p>
            </div>

            <div className="pixel-box p-5 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                {tags.map((tag) => {
                  const count = memories.filter((m) => m.tags.includes(tag.name)).length || tag.count;
                  const isSelected = selectedTagDetail === tag.name;

                  return (
                    <button
                      key={tag.name}
                      onClick={() => {
                        soundManager.playMemoryChime(1.1);
                        setSelectedTagDetail(isSelected ? null : tag.name);
                      }}
                      className={`border-2 text-xs px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold scale-105 shadow-[2px_2px_0_#451a03]'
                          : 'bg-[#181328] text-[#cbd5e1] hover:text-[#ffd285] border-[#3e2e5c] hover:border-[#f59e0b]'
                      }`}
                    >
                      <span>{tag.name}</span>
                      <span className={`text-[10px] px-1 py-0.2 ${isSelected ? 'bg-[#451a03] text-[#fde047]' : 'bg-[#100d1c] text-[#94a3b8]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedTagDetail && (
                <div className="mt-4 pt-3 border-t-2 border-[#3e2e5c] space-y-3 text-left animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#ffd285] font-bold">
                      Stories tagged with {selectedTagDetail} ({activeTagMemories.length})
                    </span>

                    <button
                      onClick={() => {
                        onTagClick(selectedTagDetail);
                        onJumpToMapView();
                      }}
                      className="pixel-btn px-2.5 py-1 bg-[#f59e0b] text-[#1c120c] text-xs font-bold flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeTagMemories.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onSelectMemory(m)}
                        className="p-3 bg-[#100d1c] border-2 border-[#3e2e5c] hover:border-[#ffd285] cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[#94a3b8] mb-1">
                          <span className="text-[#f59e0b] font-bold capitalize">{m.type}</span>
                          <span>{m.author}</span>
                        </div>
                        <h5 className="text-xs font-bold text-[#ffd285] line-clamp-1 mb-1">
                          {m.title || 'Story'}
                        </h5>
                        <p className="text-[11px] text-[#cbd5e1] line-clamp-2">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
