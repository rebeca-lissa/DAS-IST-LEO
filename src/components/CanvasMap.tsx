import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Move,
  Network,
  Share2,
  Sparkles,
  Layers,
  CircleDot,
  Radio,
  Tag as TagIcon,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { MemoryItem, PromptWave, WeavingDiagramMode } from '../types';
import { MemoryCard } from './MemoryCard';
import { SootSprite } from './SootSprite';
import { soundManager } from '../utils/audioHelper';

interface CanvasMapProps {
  memories: MemoryItem[];
  prompts: PromptWave[];
  selectedMemory: MemoryItem | null;
  onSelectMemory: (memory: MemoryItem) => void;
  onTagClick: (tag: string) => void;
  onToggleReaction: (memoryId: string, emoji: string) => void;
  onLike: (memoryId: string) => void;
  onUpdateMemoryPosition: (id: string, newPos: { x: number; y: number }) => void;
  selectedTag: string | null;
  searchQuery: string;
  showConstellations?: boolean;
  onOpenAddStory?: () => void;
}

const TAG_COLORS: Record<string, string> = {
  '#Leo': '#f59e0b',
  '#CivilMonkey': '#ffd285',
  '#Ecosystem': '#34d399',
  '#Art': '#f43f5e',
  '#Community': '#a855f7',
  '#Music': '#38bdf8',
  '#Travel': '#fb923c',
  '#Friendship': '#f472b6',
  '#Subcult': '#06b6d4',
  '#Default': '#fbbf24'
};

export const CanvasMap: React.FC<CanvasMapProps> = ({
  memories,
  prompts,
  selectedMemory,
  onSelectMemory,
  onTagClick,
  onToggleReaction,
  onLike,
  onUpdateMemoryPosition,
  selectedTag,
  searchQuery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Transform state: pan & zoom
  const [pan, setPan] = useState({ x: -40, y: -20 });
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 0.7 : 0.85));
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Weaving Diagram Mode state: 'decentralized' | 'centralized' | 'tag_clusters' | 'authors' | 'off'
  const [diagramMode, setDiagramMode] = useState<WeavingDiagramMode>('decentralized');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredTagCluster, setHoveredTagCluster] = useState<string | null>(null);

  // Dragging a specific card state
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });

  // Touch tracking for pinch-to-zoom & single-finger pan
  const touchStartDistRef = useRef<number | null>(null);
  const initialTouchZoomRef = useRef<number>(0.85);

  // Mouse Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.memory-card-wrapper') || (e.target as HTMLElement).closest('.hud-interactive')) {
      return;
    }
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggingCardId) {
      const canvasRect = containerRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const worldX = (e.clientX - canvasRect.left - pan.x) / zoom - cardDragOffset.x;
        const worldY = (e.clientY - canvasRect.top - pan.y) / zoom - cardDragOffset.y;
        onUpdateMemoryPosition(draggingCardId, {
          x: Math.round(worldX),
          y: Math.round(worldY),
        });
      }
    }
  }, [isPanning, dragStart, pan, zoom, draggingCardId, cardDragOffset, onUpdateMemoryPosition]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingCardId(null);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.memory-card-wrapper') || (e.target as HTMLElement).closest('.hud-interactive')) {
      return;
    }
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      initialTouchZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(0.35, initialTouchZoomRef.current * scale), 1.6);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchStartDistRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(0.35, zoom * zoomFactor), 1.6);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
      setPan({ x: newPanX, y: newPanY });
    }
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    soundManager.playMemoryChime(1.1);
    setZoom((prev) => Math.min(prev + 0.15, 1.6));
  };
  const handleZoomOut = () => {
    soundManager.playMemoryChime(0.9);
    setZoom((prev) => Math.max(prev - 0.15, 0.35));
  };
  const handleResetView = () => {
    soundManager.playMemoryChime(1.0);
    setPan({ x: 20, y: 20 });
    setZoom(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.7 : 0.85);
  };
  const handleFitAll = () => {
    soundManager.playMemoryChime(1.2);
    setPan({ x: 40, y: 30 });
    setZoom(0.5);
  };

  const isMemoryMatching = (mem: MemoryItem) => {
    if (selectedTag && !mem.tags.includes(selectedTag)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title?.toLowerCase().includes(q);
      const matchContent = mem.content.toLowerCase().includes(q);
      const matchAuthor = mem.author.toLowerCase().includes(q);
      const matchTag = mem.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchAuthor || matchTag;
    }
    return true;
  };

  // Central hub coordinate for Centralized Topology
  const centralHub = useMemo(() => {
    if (memories.length === 0) return { x: 700, y: 550 };
    const sumX = memories.reduce((acc, m) => acc + m.position.x + 130, 0);
    const sumY = memories.reduce((acc, m) => acc + m.position.y + 110, 0);
    return {
      x: Math.round(sumX / memories.length),
      y: Math.round(sumY / memories.length) - 40,
    };
  }, [memories]);

  // Distinct tags and their centroids for Tag Cluster Topology
  const tagClusters = useMemo(() => {
    const map = new Map<string, { tag: string; count: number; color: string; sumX: number; sumY: number; memoryIds: string[] }>();
    
    memories.forEach((m) => {
      m.tags.forEach((tag) => {
        const existing = map.get(tag) || {
          tag,
          count: 0,
          color: TAG_COLORS[tag] || TAG_COLORS['#Default'],
          sumX: 0,
          sumY: 0,
          memoryIds: [],
        };
        existing.count += 1;
        existing.sumX += m.position.x + 130;
        existing.sumY += m.position.y + 110;
        existing.memoryIds.push(m.id);
        map.set(tag, existing);
      });
    });

    return Array.from(map.values())
      .filter((tc) => tc.count >= 1)
      .map((tc) => ({
        ...tc,
        centerX: Math.round(tc.sumX / tc.count),
        centerY: Math.round(tc.sumY / tc.count),
      }));
  }, [memories]);

  // Compute connections count for stats display
  const totalConnectionLinesCount = useMemo(() => {
    if (diagramMode === 'off') return 0;
    if (diagramMode === 'centralized') return memories.length;
    if (diagramMode === 'tag_clusters') {
      return tagClusters.reduce((acc, tc) => acc + tc.memoryIds.length, 0);
    }
    if (diagramMode === 'authors') {
      let count = 0;
      const authorMap = new Map<string, number>();
      memories.forEach((m) => authorMap.set(m.author, (authorMap.get(m.author) || 0) + 1));
      authorMap.forEach((c) => {
        if (c > 1) count += (c * (c - 1)) / 2;
      });
      return count;
    }
    // Decentralized Mesh count
    let count = 0;
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const m1 = memories[i];
        const m2 = memories[j];
        const sharedTags = m1.tags.filter((t) => m2.tags.includes(t));
        const sharedPrompt = m1.promptId && m1.promptId === m2.promptId;
        if (sharedTags.length > 0 || sharedPrompt) count++;
      }
    }
    return count;
  }, [diagramMode, memories, tagClusters]);

  // RENDER DIAGRAM TOPOLOGY LINES
  const renderDiagramLines = () => {
    if (diagramMode === 'off' || memories.length === 0) return null;

    const lines: React.ReactNode[] = [];
    const activeSelectedId = selectedMemory?.id || hoveredNodeId;

    // 1. CENTRALIZED TOPOLOGY (HUB & SPOKE / CORE WEAVING)
    if (diagramMode === 'centralized') {
      memories.forEach((m) => {
        const x1 = centralHub.x;
        const y1 = centralHub.y;
        const x2 = m.position.x + 130;
        const y2 = m.position.y + 110;

        const isHighlighted = activeSelectedId === m.id || (selectedTag && m.tags.includes(selectedTag));
        const tagColor = m.tags[0] ? TAG_COLORS[m.tags[0]] || '#f59e0b' : '#f59e0b';

        // Control point for smooth curved ray
        const cx = (x1 + x2) / 2 + (x2 > x1 ? 20 : -20);
        const cy = (y1 + y2) / 2 - 25;

        lines.push(
          <g key={`central-${m.id}`} className="transition-all duration-300">
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke={isHighlighted ? '#fbbf24' : tagColor}
              strokeWidth={isHighlighted ? 3.5 : 1.8}
              strokeOpacity={isHighlighted ? 0.95 : 0.45}
              strokeDasharray={isHighlighted ? 'none' : '4 4'}
              className="pointer-events-none"
            />
            {/* Pulsing energy dot on line */}
            <circle
              cx={(x1 + x2) / 2}
              cy={cy}
              r={isHighlighted ? 3.5 : 2}
              fill={isHighlighted ? '#fde047' : tagColor}
              className="animate-pulse pointer-events-none"
            />
          </g>
        );
      });
    }

    // 2. TAG CLUSTERS TOPOLOGY (TOPIC CONSTELLATIONS)
    else if (diagramMode === 'tag_clusters') {
      tagClusters.forEach((tc) => {
        const isClusterActive = hoveredTagCluster === tc.tag || selectedTag === tc.tag;

        tc.memoryIds.forEach((memId) => {
          const mem = memories.find((m) => m.id === memId);
          if (!mem) return;

          const x1 = tc.centerX;
          const y1 = tc.centerY;
          const x2 = mem.position.x + 130;
          const y2 = mem.position.y + 110;

          const isLineActive = isClusterActive || activeSelectedId === mem.id;
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2 - 20;

          lines.push(
            <g key={`cluster-${tc.tag}-${mem.id}`}>
              <path
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                fill="none"
                stroke={isLineActive ? '#fde047' : tc.color}
                strokeWidth={isLineActive ? 3 : 1.5}
                strokeOpacity={isLineActive ? 0.95 : 0.4}
                strokeDasharray={isLineActive ? 'none' : '5 3'}
                className="pointer-events-none transition-all duration-300"
              />
            </g>
          );
        });
      });
    }

    // 3. AUTHORS / COMMUNITY WEAVING TOPOLOGY
    else if (diagramMode === 'authors') {
      const authorMap = new Map<string, MemoryItem[]>();
      memories.forEach((m) => {
        const list = authorMap.get(m.author) || [];
        list.push(m);
        authorMap.set(m.author, list);
      });

      authorMap.forEach((mems, author) => {
        if (mems.length < 2) return;
        for (let i = 0; i < mems.length; i++) {
          for (let j = i + 1; j < mems.length; j++) {
            const m1 = mems[i];
            const m2 = mems[j];
            const x1 = m1.position.x + 130;
            const y1 = m1.position.y + 110;
            const x2 = m2.position.x + 130;
            const y2 = m2.position.y + 110;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 - 30;

            const isHighlighted = activeSelectedId === m1.id || activeSelectedId === m2.id;

            lines.push(
              <g key={`author-${author}-${m1.id}-${m2.id}`}>
                <path
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  fill="none"
                  stroke={isHighlighted ? '#f43f5e' : '#a855f7'}
                  strokeWidth={isHighlighted ? 3 : 1.8}
                  strokeOpacity={isHighlighted ? 0.95 : 0.5}
                  strokeDasharray="6 4"
                  className="pointer-events-none transition-all duration-300"
                />
              </g>
            );
          }
        }
      });
    }

    // 4. DECENTRALIZED MESH TOPOLOGY (PEER-TO-PEER ECOSYSTEM WEAVING)
    else if (diagramMode === 'decentralized') {
      const processedPairs = new Set<string>();

      for (let i = 0; i < memories.length; i++) {
        for (let j = i + 1; j < memories.length; j++) {
          const m1 = memories[i];
          const m2 = memories[j];

          const pairKey = `${m1.id}-${m2.id}`;
          if (processedPairs.has(pairKey)) continue;

          const sharedPrompt = m1.promptId && m1.promptId === m2.promptId;
          const sharedTags = m1.tags.filter((t) => m2.tags.includes(t));
          const hasActiveTag = selectedTag && m1.tags.includes(selectedTag) && m2.tags.includes(selectedTag);

          if (sharedPrompt || sharedTags.length > 0 || hasActiveTag) {
            processedPairs.add(pairKey);

            const x1 = m1.position.x + 130;
            const y1 = m1.position.y + 110;
            const x2 = m2.position.x + 130;
            const y2 = m2.position.y + 110;

            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 - (hasActiveTag ? 35 : 20);

            const isHighlightedLine = hasActiveTag || (activeSelectedId && (activeSelectedId === m1.id || activeSelectedId === m2.id));
            const primaryTag = sharedTags[0] || m1.tags[0] || '#Leo';
            const threadColor = TAG_COLORS[primaryTag] || '#f59e0b';

            lines.push(
              <g key={pairKey} className="transition-all duration-300">
                <path
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  fill="none"
                  stroke={
                    isHighlightedLine
                      ? '#fde047'
                      : sharedPrompt
                      ? '#f43f5e'
                      : threadColor
                  }
                  strokeWidth={isHighlightedLine ? 3.5 : 1.8}
                  strokeOpacity={isHighlightedLine ? 0.95 : 0.45}
                  strokeDasharray={isHighlightedLine ? 'none' : '5 4'}
                  className="pointer-events-none"
                />

                {/* Pulsing mid-point weaving node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHighlightedLine ? 3.5 : 2}
                  fill={isHighlightedLine ? '#fde047' : threadColor}
                  className="animate-pulse pointer-events-none"
                />
              </g>
            );
          }
        }
      }
    }

    return lines;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className={`relative w-full h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] overflow-hidden bg-alpen-twilight select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* TOP-LEFT STATUS HELPER */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-40 flex flex-col gap-1.5 max-w-[220px] sm:max-w-xs pointer-events-auto">
        <div className="pixel-box p-2 sm:p-2.5 text-stone-100 hud-interactive font-pixel text-[10px] sm:text-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-[#ffd285] uppercase">Canvas Map</span>
            <span className="text-[9px] text-[#cbd5e1]">{memories.length} {memories.length === 1 ? 'item' : 'items'}</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-[#cbd5e1] leading-tight">
            Drag to pan. Tap any memory or switch weaving diagrams on the right.
          </p>
        </div>
      </div>

      {/* TOP-RIGHT WEAVING & DIAGRAM TOPOLOGY CONTROLS */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-40 flex flex-col items-end gap-1.5 pointer-events-auto hud-interactive">
        
        {/* MAIN DIAGRAM MODE SELECTOR BAR */}
        <div className="bg-[#181328]/95 border-2 border-[#3e2e5c] p-1 shadow-[0_3px_0_#0a0814] flex items-center gap-0.5 font-pixel text-[10px]">
          
          <div className="px-1.5 py-0.5 text-[9px] font-bold text-[#ffd285] hidden md:flex items-center gap-1 border-r border-[#3e2e5c] mr-0.5">
            <Network className="w-3 h-3 text-[#f59e0b]" />
            <span>Weave:</span>
          </div>

          {/* Decentralized Mesh Mode */}
          <button
            onClick={() => {
              soundManager.playMemoryChime(1.1);
              setDiagramMode('decentralized');
            }}
            title="Decentralized Peer-to-Peer Mesh (Topic & Tag Weaving)"
            className={`px-2 py-0.8 flex items-center gap-1 border transition-all ${
              diagramMode === 'decentralized'
                ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] font-bold shadow-[0_1px_0_#78350f]'
                : 'bg-[#100d1c] text-[#cbd5e1] hover:text-white border-[#3e2e5c]'
            }`}
          >
            <Share2 className="w-2.5 h-2.5" />
            <span>Mesh</span>
          </button>

          {/* Centralized Hub Mode */}
          <button
            onClick={() => {
              soundManager.playMemoryChime(1.2);
              setDiagramMode('centralized');
            }}
            title="Centralized Hub & Spoke (Leo Civil Monkey Nexus)"
            className={`px-2 py-0.8 flex items-center gap-1 border transition-all ${
              diagramMode === 'centralized'
                ? 'bg-[#f43f5e] text-white border-[#fda4af] font-bold shadow-[0_1px_0_#881337]'
                : 'bg-[#100d1c] text-[#cbd5e1] hover:text-white border-[#3e2e5c]'
            }`}
          >
            <Radio className="w-2.5 h-2.5" />
            <span>Central</span>
          </button>

          {/* Tag Clusters Mode */}
          <button
            onClick={() => {
              soundManager.playMemoryChime(1.3);
              setDiagramMode('tag_clusters');
            }}
            title="Topic & Tag Clusters (Constellation Hubs)"
            className={`px-2 py-0.8 flex items-center gap-1 border transition-all ${
              diagramMode === 'tag_clusters'
                ? 'bg-[#10b981] text-[#052e16] border-[#34d399] font-bold shadow-[0_1px_0_#064e3b]'
                : 'bg-[#100d1c] text-[#cbd5e1] hover:text-white border-[#3e2e5c]'
            }`}
          >
            <TagIcon className="w-2.5 h-2.5" />
            <span>Clusters</span>
          </button>

          {/* Authors / Community Network Mode */}
          <button
            onClick={() => {
              soundManager.playMemoryChime(1.0);
              setDiagramMode('authors');
            }}
            title="Community & Author Network"
            className={`px-2 py-0.8 hidden sm:flex items-center gap-1 border transition-all ${
              diagramMode === 'authors'
                ? 'bg-[#a855f7] text-white border-[#c084fc] font-bold shadow-[0_1px_0_#581c87]'
                : 'bg-[#100d1c] text-[#cbd5e1] hover:text-white border-[#3e2e5c]'
            }`}
          >
            <Users className="w-2.5 h-2.5" />
            <span>Friends</span>
          </button>

          {/* Toggle Lines On/Off */}
          <button
            onClick={() => {
              soundManager.playMemoryChime(0.9);
              setDiagramMode(diagramMode === 'off' ? 'decentralized' : 'off');
            }}
            title={diagramMode === 'off' ? 'Show Weaving Lines' : 'Hide Weaving Lines'}
            className={`px-1.5 py-0.8 flex items-center gap-0.5 border text-[9px] transition-all ml-0.5 ${
              diagramMode === 'off'
                ? 'bg-[#ef4444] text-white border-[#f87171] font-bold'
                : 'bg-[#1e1b2e] text-[#94a3b8] hover:text-white border-[#3e2e5c]'
            }`}
          >
            {diagramMode === 'off' ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
            <span className="hidden sm:inline">{diagramMode === 'off' ? 'Off' : 'Hide'}</span>
          </button>
        </div>

        {/* TOPOLOGY INFO PILL */}
        {diagramMode !== 'off' && (
          <div className="bg-[#120e20]/90 border border-[#3e2e5c] px-2 py-0.5 text-[9px] text-[#ffd285] font-pixel flex items-center gap-1.5 shadow-[1px_1px_0_#000]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping" />
            <span>
              {diagramMode === 'decentralized' && `Mesh: ${totalConnectionLinesCount} links weaving topics`}
              {diagramMode === 'centralized' && `Central Core: ${totalConnectionLinesCount} rays radiating`}
              {diagramMode === 'tag_clusters' && `Clusters: ${tagClusters.length} topic constellations`}
              {diagramMode === 'authors' && `Community: ${totalConnectionLinesCount} author paths`}
            </span>
          </div>
        )}
      </div>

      {/* FLOATING ZOOM CONTROLS */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 flex items-center gap-0.5 bg-[#181328] border border-[#3e2e5c] p-1 shadow-[0_2px_0_#0a0814] hud-interactive">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1 text-[#cbd5e1] hover:text-[#ffd285] hover:bg-[#282142] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="font-pixel-retro text-[8px] text-[#ffd285] px-1 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1 text-[#cbd5e1] hover:text-[#ffd285] hover:bg-[#282142] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-[#3e2e5c] mx-0.5" />
        <button
          onClick={handleResetView}
          title="Reset Camera"
          className="p-1 text-[#cbd5e1] hover:text-white hover:bg-[#282142] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFitAll}
          title="Fit All"
          className="p-1 text-[#cbd5e1] hover:text-white hover:bg-[#282142] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MINI-RADAR OVERVIEW MAP (DESKTOP ONLY) */}
      {memories.length > 0 && (
        <div className="absolute bottom-4 right-4 z-40 hidden md:block bg-[#181328] border border-[#3e2e5c] p-1.5 shadow-[0_2px_0_#0a0814] w-36 hud-interactive">
          <div className="text-[9px] font-pixel text-[#ffd285] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Radar</span>
            <Move className="w-2.5 h-2.5 text-[#64748b]" />
          </div>
          <div className="relative w-full h-16 bg-[#0c0917] border border-[#3e2e5c] overflow-hidden">
            {memories.map((m) => {
              const radarX = (m.position.x / 2800) * 100;
              const radarY = (m.position.y / 2000) * 100;
              const matches = isMemoryMatching(m);
              return (
                <div
                  key={`radar-${m.id}`}
                  style={{
                    left: `${Math.min(92, Math.max(4, radarX))}%`,
                    top: `${Math.min(92, Math.max(4, radarY))}%`,
                  }}
                  className={`absolute w-1 h-1 -translate-x-1/2 -translate-y-1/2 ${
                    matches ? 'bg-[#f59e0b]' : 'bg-[#64748b]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* THE SCALED & PANNED PIXEL WORLD */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning || draggingCardId ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="absolute top-0 left-0 w-[3200px] h-[2400px] pointer-events-none"
      >
        {/* PARALLAX PIXEL ART AUSTRIAN ALPS SCENERY (SVG BACKGROUND) */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible', imageRendering: 'pixelated' }}
        >
          <defs>
            <linearGradient id="snowPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#ffd8d8" />
              <stop offset="100%" stopColor="#e2a0b8" />
            </linearGradient>

            <linearGradient id="alpenGlowRidge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a345b" />
              <stop offset="50%" stopColor="#431e40" />
              <stop offset="100%" stopColor="#20112b" />
            </linearGradient>

            <linearGradient id="forePine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15362a" />
              <stop offset="100%" stopColor="#0b1a14" />
            </linearGradient>

            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd285" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* LAYER 1: Distant Jagged Austrian Mountain Peaks */}
          <polygon
            points="0,600 200,380 340,490 520,310 700,460 900,240 1100,450 1350,220 1600,420 1850,260 2100,480 2350,290 2600,470 2900,280 3200,560 3200,1200 0,1200"
            fill="#2c163b"
            opacity="0.9"
          />
          {/* Snowcap highlights on peaks */}
          <polygon points="520,310 470,360 570,360" fill="url(#snowPeak)" opacity="0.95" />
          <polygon points="900,240 840,310 960,310" fill="url(#snowPeak)" opacity="0.95" />
          <polygon points="1350,220 1280,300 1420,300" fill="url(#snowPeak)" opacity="0.95" />
          <polygon points="1850,260 1790,330 1910,330" fill="url(#snowPeak)" opacity="0.95" />
          <polygon points="2350,290 2290,350 2410,350" fill="url(#snowPeak)" opacity="0.95" />
          <polygon points="2900,280 2840,340 2960,340" fill="url(#snowPeak)" opacity="0.95" />

          {/* LAYER 2: Midground Ridges */}
          <polygon
            points="0,780 180,680 400,740 680,610 950,710 1200,590 1500,690 1800,570 2150,680 2450,560 2800,690 3200,590 3200,1600 0,1600"
            fill="url(#alpenGlowRidge)"
            opacity="0.85"
          />

          {/* LAYER 3: Dark Fir Forest */}
          <polygon
            points="0,1050 150,990 300,1030 500,970 720,1020 980,950 1240,1010 1520,940 1800,1000 2100,930 2400,990 2700,940 3000,990 3200,950 3200,2400 0,2400"
            fill="url(#forePine)"
            opacity="0.75"
          />

          {/* CONSTELLATION STARS IN SKY */}
          {[
            [120, 150], [380, 80], [640, 190], [920, 110], [1200, 170], [1480, 90],
            [1750, 180], [2050, 120], [2350, 160], [2680, 95], [2980, 160],
            [220, 290], [500, 240], [800, 270], [1080, 230], [1390, 280], [1650, 240],
            [1950, 280], [2250, 230], [2550, 270], [2850, 220], [3100, 260]
          ].map(([sx, sy], sIdx) => (
            <g key={sIdx} className="animate-pulse" style={{ animationDelay: `${(sIdx % 5) * 0.4}s` }}>
              <rect x={sx} y={sy} width="4" height="4" fill="#ffd285" opacity="0.8" />
              <rect x={sx - 2} y={sy + 1} width="8" height="2" fill="#ffd285" opacity="0.5" />
              <rect x={sx + 1} y={sy - 2} width="2" height="8" fill="#ffd285" opacity="0.5" />
            </g>
          ))}

          {/* TOPOLOGY DIAGRAM CONNECTION LINES OVERLAY */}
          {renderDiagramLines()}
        </svg>

        {/* CENTRALIZED HUB NODE (WHEN IN CENTRALIZED MODE) */}
        {diagramMode === 'centralized' && (
          <div
            style={{
              position: 'absolute',
              left: `${centralHub.x - 70}px`,
              top: `${centralHub.y - 70}px`,
            }}
            className="w-36 h-36 flex flex-col items-center justify-center pointer-events-auto z-30 group"
          >
            {/* Glowing radial aura */}
            <div className="absolute inset-0 bg-[#ffd285]/20 rounded-full animate-ping pointer-events-none" />
            <div className="w-20 h-20 bg-[#291e45] border-3 border-[#ffd285] shadow-[0_0_25px_#f59e0b] flex flex-col items-center justify-center text-center p-1 pixel-box">
              <span className="text-2xl animate-bounce">🐒</span>
              <span className="font-pixel text-[8px] font-bold text-[#ffd285] uppercase leading-tight">
                LEO CORE
              </span>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-[#451a03] border border-[#f59e0b] text-[#fde047] font-pixel text-[8px] font-bold shadow">
              Central Nexus
            </div>
          </div>
        )}

        {/* FLOATING TOPIC TAG CLUSTER HUBS (WHEN IN TAG CLUSTER MODE) */}
        {diagramMode === 'tag_clusters' && tagClusters.map((tc) => (
          <div
            key={`hub-${tc.tag}`}
            style={{
              position: 'absolute',
              left: `${tc.centerX - 40}px`,
              top: `${tc.centerY - 40}px`,
            }}
            onMouseEnter={() => setHoveredTagCluster(tc.tag)}
            onMouseLeave={() => setHoveredTagCluster(null)}
            onClick={() => onTagClick(tc.tag)}
            className="pointer-events-auto z-30 cursor-pointer group"
          >
            <div
              style={{
                borderColor: tc.color,
                boxShadow: `0 0 16px ${tc.color}66`,
              }}
              className="px-2.5 py-1 bg-[#181328] border-2 flex items-center gap-1 text-[10px] font-pixel font-bold text-[#ffd285] hover:scale-110 transition-transform shadow-[2px_2px_0_#0a0814]"
            >
              <TagIcon className="w-3 h-3" style={{ color: tc.color }} />
              <span>{tc.tag}</span>
              <span className="text-[8px] opacity-80">({tc.count})</span>
            </div>
          </div>
        ))}

        {/* CUTE PIXEL SPRITES */}
        <SootSprite x={160} y={480} size={28} holdingItem="star-candy" label="Leo's Realm" />
        <SootSprite x={980} y={640} size={30} holdingItem="heart" label="Community ❤️" />
        <SootSprite x={1820} y={520} size={28} holdingItem="star" label="Civil Monkey" />
        <SootSprite x={2620} y={620} size={30} holdingItem="flower" label="Made with love" />

        {/* MEMORY ITEMS (CARDS) */}
        {memories.map((mem) => {
          const isSelected = selectedMemory?.id === mem.id;
          const isHighlighted = isMemoryMatching(mem);

          return (
            <div
              key={mem.id}
              style={{
                position: 'absolute',
                left: `${mem.position.x}px`,
                top: `${mem.position.y}px`,
                opacity: isHighlighted ? 1 : 0.35,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={() => setHoveredNodeId(mem.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="memory-card-wrapper pointer-events-auto"
            >
              <MemoryCard
                memory={mem}
                isSelected={isSelected}
                isHighlighted={isHighlighted && (!!searchQuery || !!selectedTag || hoveredNodeId === mem.id)}
                onSelect={(m) => {
                  soundManager.playMemoryChime(1.2);
                  onSelectMemory(m);
                }}
                onTagClick={onTagClick}
                onToggleReaction={onToggleReaction}
                onLike={onLike}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
