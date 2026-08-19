import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CanvasMap } from './components/CanvasMap';
import { CollectiveWavesView } from './components/CollectiveWavesView';
import { LeoCinemaTour } from './components/LeoCinemaTour';
import { AddStoryModal } from './components/AddStoryModal';
import { MemoryModal } from './components/MemoryModal';
import { ShareModal } from './components/ShareModal';
import { SplashScreen } from './components/SplashScreen';
import { Footer } from './components/Footer';
import { INITIAL_MEMORIES, INITIAL_PROMPT_WAVES, INITIAL_TAGS } from './data/initialData';
import { MemoryItem, PromptWave, TagInfo, CanvasViewMode } from './types';
import { soundManager } from './utils/audioHelper';
import { triggerCelebrationConfetti, triggerMiniSparkle } from './utils/confettiHelper';

const STORAGE_MEMORIES_KEY = 'das_ist_leo_civil_monkey_memories_v2';
const STORAGE_PROMPTS_KEY = 'das_ist_leo_civil_monkey_prompts_v2';
const SESSION_SPLASH_SEEN_KEY = 'das_ist_leo_splash_seen_v2';

export default function App() {
  // State: Memories (starts blank unless user added items)
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEMORIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_MEMORIES;
  });

  // State: Prompts (starts blank)
  const [prompts, setPrompts] = useState<PromptWave[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROMPTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROMPT_WAVES;
  });

  // Sound Mute State
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());

  // Splash Screen State (shows on first visit)
  const [isSplashOpen, setIsSplashOpen] = useState<boolean>(() => {
    try {
      const seen = sessionStorage.getItem(SESSION_SPLASH_SEEN_KEY);
      return seen !== 'true';
    } catch {
      return true;
    }
  });

  const handleCloseSplash = () => {
    setIsSplashOpen(false);
    try {
      sessionStorage.setItem(SESSION_SPLASH_SEEN_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playMemoryChime(1.2);
      triggerMiniSparkle(0.9, 0.1);
    }
  };

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMORIES_KEY, JSON.stringify(memories));
    } catch {
      // localStorage quota
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROMPTS_KEY, JSON.stringify(prompts));
    } catch {
      // ignore
    }
  }, [prompts]);

  // View mode: 'map' | 'collective' (WAVES) | 'tour' (KINO)
  const [currentMode, setCurrentMode] = useState<CanvasViewMode>('map');

  // Search and Tag filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [preselectedPromptId, setPreselectedPromptId] = useState<string | undefined>(undefined);

  // Compute live tags dynamically from real memories
  const allTags: TagInfo[] = useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    memories.forEach((m) => {
      m.tags.forEach((t) => {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      });
    });

    INITIAL_TAGS.forEach((it) => {
      if (!tagCountMap[it.name]) {
        tagCountMap[it.name] = it.count;
      }
    });

    const colors = ['#f59e0b', '#f43f5e', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    return Object.entries(tagCountMap).map(([name, count], idx) => ({
      name,
      count,
      color: colors[idx % colors.length],
    }));
  }, [memories]);

  // Handlers
  const handleAddMemory = (newMemoryData: Omit<MemoryItem, 'id' | 'createdAt' | 'likes' | 'reactions'>) => {
    const newMemory: MemoryItem = {
      ...newMemoryData,
      id: `mem-${Date.now()}`,
      likes: 1,
      reactions: [{ emoji: '❤️', count: 1, userReacted: true }],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setMemories((prev) => [newMemory, ...prev]);
    setSelectedMemory(newMemory);
    setCurrentMode('map');

    // Celebratory effects on planting a memory!
    soundManager.playLevelUpFanfare();
    triggerCelebrationConfetti();
  };

  const handleAddNewPrompt = (newPromptData: Omit<PromptWave, 'id' | 'createdAt' | 'responsesCount'>) => {
    const newPrompt: PromptWave = {
      ...newPromptData,
      id: `prompt-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      responsesCount: 0,
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    soundManager.playMemoryChime(1.3);
    triggerMiniSparkle(0.5, 0.5);
  };

  const handleToggleReaction = (memoryId: string, emoji: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id !== memoryId) return m;
        const existingReaction = m.reactions.find((r) => r.emoji === emoji);
        let updatedReactions = [...m.reactions];

        if (existingReaction) {
          if (existingReaction.userReacted) {
            updatedReactions = updatedReactions
              .map((r) => (r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), userReacted: false } : r))
              .filter((r) => r.count > 0);
          } else {
            updatedReactions = updatedReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
            );
            triggerMiniSparkle(0.5, 0.5);
          }
        } else {
          updatedReactions.push({ emoji, count: 1, userReacted: true });
          triggerMiniSparkle(0.5, 0.5);
        }

        return { ...m, reactions: updatedReactions };
      })
    );

    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory((prev) => {
        if (!prev) return null;
        const existingReaction = prev.reactions.find((r) => r.emoji === emoji);
        let updatedReactions = [...prev.reactions];
        if (existingReaction) {
          if (existingReaction.userReacted) {
            updatedReactions = updatedReactions
              .map((r) => (r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), userReacted: false } : r))
              .filter((r) => r.count > 0);
          } else {
            updatedReactions = updatedReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
            );
          }
        } else {
          updatedReactions.push({ emoji, count: 1, userReacted: true });
        }
        return { ...prev, reactions: updatedReactions };
      });
    }
  };

  const handleLike = (memoryId: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === memoryId ? { ...m, likes: m.likes + 1 } : m))
    );
    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
    triggerMiniSparkle(0.5, 0.5);
  };

  const handleUpdateMemoryPosition = (id: string, newPos: { x: number; y: number }) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, position: { ...m.position, ...newPos } } : m))
    );
  };

  const handleTagClick = (tag: string) => {
    soundManager.playMemoryChime(1.1);
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  const handleSelectPromptToAnswer = (promptId: string) => {
    setPreselectedPromptId(promptId);
    setIsAddModalOpen(true);
  };

  const handleImportData = (data: { memories: MemoryItem[]; prompts: PromptWave[] }) => {
    if (data.memories) {
      setMemories(data.memories);
    }
    if (data.prompts) {
      setPrompts(data.prompts);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f141c] text-stone-100 flex flex-col font-sans">
      {/* NAVBAR */}
      <Navbar
        currentMode={currentMode}
        onModeChange={(mode) => {
          setCurrentMode(mode);
        }}
        onOpenAddModal={() => {
          setPreselectedPromptId(undefined);
          setIsAddModalOpen(true);
        }}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenSplash={() => setIsSplashOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onClearTag={() => setSelectedTag(null)}
        totalMemoriesCount={memories.length}
      />

      {/* MAIN VIEWPORT */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* MODE 1: MAP */}
        {currentMode === 'map' && (
          <CanvasMap
            memories={memories}
            prompts={prompts}
            selectedMemory={selectedMemory}
            onSelectMemory={(m) => setSelectedMemory(m)}
            onTagClick={handleTagClick}
            onToggleReaction={handleToggleReaction}
            onLike={handleLike}
            onUpdateMemoryPosition={handleUpdateMemoryPosition}
            selectedTag={selectedTag}
            searchQuery={searchQuery}
            showConstellations={true}
            onOpenAddStory={() => setIsAddModalOpen(true)}
          />
        )}

        {/* MODE 2: WAVES */}
        {currentMode === 'collective' && (
          <CollectiveWavesView
            prompts={prompts}
            memories={memories}
            tags={allTags}
            onSelectPromptToAnswer={handleSelectPromptToAnswer}
            onAddNewPrompt={handleAddNewPrompt}
            onTagClick={handleTagClick}
            onSelectMemory={(m) => setSelectedMemory(m)}
            onJumpToMapView={() => setCurrentMode('map')}
          />
        )}

        {/* MODE 3: KINO */}
        {currentMode === 'tour' && (
          <LeoCinemaTour
            memories={memories}
            onClose={() => setCurrentMode('map')}
            onSelectMemory={(m) => setSelectedMemory(m)}
            onOpenAddStory={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenSplash={() => setIsSplashOpen(true)}
        onOpenAddStory={() => setIsAddModalOpen(true)}
      />

      {/* SPLASH SCREEN MODAL */}
      <SplashScreen
        isOpen={isSplashOpen}
        onClose={handleCloseSplash}
        onOpenAddStory={() => setIsAddModalOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        memoriesCount={memories.length}
      />

      {/* MODAL: ADD STORY */}
      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
        prompts={prompts}
        defaultPromptId={preselectedPromptId}
        currentMemoriesCount={memories.length}
      />

      {/* MODAL: MEMORY SPOTLIGHT DETAIL */}
      <MemoryModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onLike={handleLike}
        onToggleReaction={handleToggleReaction}
        onTagClick={handleTagClick}
        allMemories={memories}
        onSelectOtherMemory={(m) => setSelectedMemory(m)}
      />

      {/* MODAL: SHARE & EXPORT/IMPORT */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        memories={memories}
        prompts={prompts}
        tags={allTags}
        onImportData={handleImportData}
      />
    </div>
  );
}
