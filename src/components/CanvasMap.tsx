import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Move,
  Plus
} from 'lucide-react';
import { MemoryItem, PromptWave } from '../types';
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
  showConstellations = true,
  onOpenAddStory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Transform state: pan & zoom
  const [pan, setPan] = useState({ x: -100, y: -50 });
  const [zoom, setZoom] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Dragging a specific card state
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [cardDragOffset, setCardDragOffset] = useState({ x: 0, y: 0 });

  // Panning handlers
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
    setPan({ x: 50, y: 50 });
    setZoom(0.85);
  };
  const handleFitAll = () => {
    soundManager.playMemoryChime(1.2);
    setPan({ x: 80, y: 60 });
    setZoom(0.55);
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

  // Constellation lines
  const renderConstellationLines = () => {
    if (!showConstellations || memories.length < 2) return null;

    const lines: React.ReactNode[] = [];
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

          const x1 = m1.position.x + 140;
          const y1 = m1.position.y + 120;
          const x2 = m2.position.x + 140;
          const y2 = m2.position.y + 120;

          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2 - (hasActiveTag ? 40 : 20);

          const isHighlightedLine = hasActiveTag || (selectedMemory && (selectedMemory.id === m1.id || selectedMemory.id === m2.id));

          lines.push(
            <g key={pairKey}>
              <path
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                fill="none"
                stroke={
                  isHighlightedLine
                    ? '#fbbf24'
                    : sharedPrompt
                    ? 'rgba(244, 63, 94, 0.45)'
                    : 'rgba(196, 181, 253, 0.22)'
                }
                strokeWidth={isHighlightedLine ? 3 : 1.5}
                strokeDasharray={isHighlightedLine ? 'none' : '6 6'}
                className="transition-all duration-300 pointer-events-none"
              />
            </g>
          );
        }
      }
    }
    return lines;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      className={`relative w-full h-[calc(100vh-65px)] overflow-hidden bg-alpen-twilight select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* TOP-LEFT STATUS / HELPER */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 max-w-xs pointer-events-auto">
        <div className="pixel-box p-3 text-stone-100 hud-interactive font-pixel text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#ffd285] uppercase">Canvas Map</span>
            <span className="text-[10px] text-[#cbd5e1]">{memories.length} {memories.length === 1 ? 'item' : 'items'}</span>
          </div>
          <p className="text-[11px] text-[#cbd5e1] leading-tight">
            Click & drag to explore. Click any memory to read or hear audio.
          </p>
        </div>
      </div>

      {/* FLOATING ZOOM CONTROLS (BOTTOM-LEFT) */}
      <div className="absolute bottom-5 left-5 z-40 flex items-center gap-1 bg-[#181328] border-2 border-[#3e2e5c] p-1.5 shadow-[0_4px_0_#0a0814] hud-interactive">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-[#cbd5e1] hover:text-[#ffd285] hover:bg-[#282142] transition-colors border border-transparent hover:border-[#f59e0b]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="font-pixel-retro text-[9px] text-[#ffd285] px-1 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-[#cbd5e1] hover:text-[#ffd285] hover:bg-[#282142] transition-colors border border-transparent hover:border-[#f59e0b]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[2px] h-5 bg-[#3e2e5c] mx-1" />
        <button
          onClick={handleResetView}
          title="Reset Camera"
          className="p-1.5 text-[#cbd5e1] hover:text-white hover:bg-[#282142] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitAll}
          title="Fit All"
          className="p-1.5 text-[#cbd5e1] hover:text-white hover:bg-[#282142] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* MINI-RADAR OVERVIEW MAP (BOTTOM-RIGHT) */}
      {memories.length > 0 && (
        <div className="absolute bottom-5 right-5 z-40 hidden md:block bg-[#181328] border-2 border-[#3e2e5c] p-2 shadow-[0_4px_0_#0a0814] w-44 hud-interactive">
          <div className="text-[10px] font-pixel text-[#ffd285] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Radar</span>
            <Move className="w-3 h-3 text-[#64748b]" />
          </div>
          <div className="relative w-full h-20 bg-[#0c0917] border border-[#3e2e5c] overflow-hidden">
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
                  className={`absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 ${
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
          transition: isPanning || draggingCardId ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
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
              <stop offset="100%" stopColor="#0a1a14" />
            </linearGradient>

            <linearGradient id="lakeWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#254256" />
              <stop offset="50%" stopColor="#142634" />
              <stop offset="100%" stopColor="#0a141c" />
            </linearGradient>
          </defs>

          {/* DISTANT STARS */}
          {[
            { cx: 200, cy: 120, r: 2 },
            { cx: 550, cy: 90, r: 3 },
            { cx: 880, cy: 160, r: 2 },
            { cx: 1250, cy: 80, r: 2.5 },
            { cx: 1600, cy: 140, r: 3 },
            { cx: 2100, cy: 100, r: 2 },
            { cx: 2600, cy: 150, r: 2.5 },
          ].map((star, i) => (
            <circle
              key={`star-${i}`}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="#ffd285"
              className="animate-pulse opacity-80"
            />
          ))}

          {/* GIANT SPIRIT MOON */}
          <circle
            cx="1400"
            cy="230"
            r="110"
            fill="#ffe8b0"
            className="opacity-75"
          />

          {/* DISTANT SNOWY AUSTRIAN ALPS PEAKS */}
          <polygon
            points="
              0,850 
              180,520 280,640 450,420 580,590 750,340 880,520 
              1100,280 1280,490 1480,220 1620,440 1850,310 
              2050,540 2280,360 2480,520 2700,320 2900,480 3200,850 3200,2400 0,2400
            "
            fill="url(#alpenGlowRidge)"
          />

          {/* SNOW CAPS */}
          <polygon points="450,420 400,490 450,470 500,490" fill="url(#snowPeak)" />
          <polygon points="750,340 690,430 750,400 810,430" fill="url(#snowPeak)" />
          <polygon points="1100,280 1020,380 1100,350 1180,380" fill="url(#snowPeak)" />
          <polygon points="1480,220 1390,340 1480,310 1570,340" fill="url(#snowPeak)" />
          <polygon points="1850,310 1770,410 1850,380 1930,410" fill="url(#snowPeak)" />
          <polygon points="2280,360 2200,450 2280,420 2360,450" fill="url(#snowPeak)" />

          {/* PINE FOREST RIDGE */}
          <path
            d="
              M 0 1100 
              Q 400 1020 800 1080 
              T 1600 1040 
              T 2400 1090 
              T 3200 1050 
              L 3200 2400 
              L 0 2400 Z
            "
            fill="url(#forePine)"
          />

          {/* WATER TRAIN TRACKS */}
          <path
            d="M 0 1620 Q 800 1580 1600 1620 T 3200 1600"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeDasharray="14 10"
            className="opacity-70"
          />

          {/* LAKE WATER */}
          <rect x="0" y="1650" width="3200" height="750" fill="url(#lakeWater)" />

          {/* Constellation Vector Lines */}
          {renderConstellationLines()}
        </svg>

        {/* CUTE SOOT SPRITES WANDERING */}
        <SootSprite x={620} y={480} size={36} holdingItem="star-candy" label="Leo’s helper" />
        <SootSprite x={1280} y={640} size={38} holdingItem="edelweiss" label="Edelweiss" />
        <SootSprite x={1920} y={540} size={34} holdingItem="heart" label="With love ❤️" />

        {/* EMPTY STATE BANNER (IF 0 STORIES ADDED YET) */}
        {memories.length === 0 && (
          <div className="absolute top-[420px] left-[550px] pointer-events-auto z-40 w-96 p-6 pixel-box text-center space-y-3 font-pixel">
            <div className="text-3xl">🏔️</div>
            <h3 className="text-base font-bold text-[#ffd285] uppercase">
              The Canvas is Ready!
            </h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              No stories or photos have been added yet. Share this link with friends so everyone can drop their memories, photos, and voice notes for Leo!
            </p>
            {onOpenAddStory && (
              <button
                onClick={() => {
                  soundManager.playMemoryChime(1.3);
                  onOpenAddStory();
                }}
                className="pixel-btn px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add the First Story</span>
              </button>
            )}
          </div>
        )}

        {/* MEMORIES PLACED ON MAP */}
        {memories.map((mem) => {
          const matches = isMemoryMatching(mem);
          const isSelected = selectedMemory?.id === mem.id;
          const isHighlighted = selectedTag ? mem.tags.includes(selectedTag) : false;

          return (
            <div
              key={mem.id}
              style={{
                transform: `translate(${mem.position.x}px, ${mem.position.y}px)`,
              }}
              className={`memory-card-wrapper absolute top-0 left-0 pointer-events-auto transition-opacity duration-300 ${
                matches ? 'opacity-100' : 'opacity-20 grayscale'
              }`}
            >
              <MemoryCard
                memory={mem}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                onSelect={onSelectMemory}
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
