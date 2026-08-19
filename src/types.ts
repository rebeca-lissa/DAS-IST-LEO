export type MemoryType = 'polaroid' | 'audio' | 'letter' | 'quote' | 'sticky';

export interface MemoryReaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface MemoryItem {
  id: string;
  type: MemoryType;
  title?: string;
  content: string;
  author: string;
  authorRelation?: string;
  authorAvatar?: string;
  date?: string;
  location?: string;
  mediaUrl?: string;
  audioUrl?: string;
  audioDuration?: number; // in seconds
  tags: string[];
  promptId?: string;
  position: {
    x: number;
    y: number;
    rotation?: number; // subtle angle in degrees e.g. -4 to 4
  };
  colorTheme?: 'amber' | 'rose' | 'emerald' | 'cyan' | 'indigo' | 'warmParchment';
  likes: number;
  reactions: MemoryReaction[];
  createdAt: string;
  isFavorite?: boolean;
}

export interface PromptWave {
  id: string;
  question: string;
  description?: string;
  creator: string;
  tag: string;
  iconName?: string;
  color: string;
  createdAt: string;
  responsesCount?: number;
}

export interface TagInfo {
  name: string;
  count: number;
  color: string;
  description?: string;
}

export type CanvasViewMode = 'map' | 'collective' | 'tour';

export type WeavingDiagramMode = 'decentralized' | 'centralized' | 'tag_clusters' | 'authors' | 'off';
