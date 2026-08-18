import React, { useState } from 'react';
import { soundManager } from '../utils/audioHelper';

interface SootSpriteProps {
  x: number;
  y: number;
  size?: number;
  holdingItem?: 'star-candy' | 'edelweiss' | 'heart' | 'cake';
  label?: string;
  onClick?: () => void;
}

export const SootSprite: React.FC<SootSpriteProps> = ({
  x,
  y,
  size = 32,
  holdingItem = 'star-candy',
  label,
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHopping, setIsHopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playSootSpriteSqueak();
    setIsHopping(true);
    setIsBlinking(true);
    setTimeout(() => setIsHopping(false), 500);
    setTimeout(() => setIsBlinking(false), 800);
    if (onClick) onClick();
  };

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={handleClick}
      className={`absolute group cursor-pointer select-none transition-transform duration-200 z-30 ${
        isHopping ? 'scale-125 -translate-y-3' : 'hover:scale-110 animate-soot-hop'
      }`}
      title="A friendly mountain soot sprite (Susuwatari) from the Chihiro spirit realm!"
    >
      {/* 16-BIT PIXEL SOOT SPRITE BODY (SVG) */}
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Fluffy fuzzy soot spikes */}
        <path
          d="M 6 2 H 18 V 4 H 20 V 6 H 22 V 18 H 20 V 20 H 18 V 22 H 6 V 20 H 4 V 18 H 2 V 6 H 4 V 4 H 6 V 2 Z"
          fill="#120e1f"
        />
        <path
          d="M 8 4 H 16 V 6 H 18 V 8 H 20 V 16 H 18 V 18 H 16 V 20 H 8 V 18 H 6 V 16 H 4 V 8 H 6 V 6 H 8 V 4 Z"
          fill="#1c162e"
        />
        {/* Soft fuzz highlights */}
        <rect x="7" y="5" width="2" height="2" fill="#2d2247" />
        <rect x="15" y="5" width="2" height="2" fill="#2d2247" />
        <rect x="5" y="10" width="2" height="2" fill="#2d2247" />
        <rect x="17" y="10" width="2" height="2" fill="#2d2247" />

        {/* EYES */}
        {isBlinking ? (
          // Blinking eye lines
          <>
            <rect x="6" y="10" width="4" height="2" fill="#ffffff" />
            <rect x="14" y="10" width="4" height="2" fill="#ffffff" />
          </>
        ) : (
          // Big innocent circular spirit eyes
          <>
            {/* Left Eye */}
            <rect x="6" y="8" width="5" height="5" fill="#ffffff" />
            <rect x="8" y="9" width="3" height="3" fill="#000000" />
            <rect x="8" y="9" width="1" height="1" fill="#ffffff" />

            {/* Right Eye */}
            <rect x="13" y="8" width="5" height="5" fill="#ffffff" />
            <rect x="15" y="9" width="3" height="3" fill="#000000" />
            <rect x="15" y="9" width="1" height="1" fill="#ffffff" />
          </>
        )}
      </svg>

      {/* ITEM HELD: STAR CANDY (KONPEITO) / EDELWEISS / HEART */}
      <div className="absolute -bottom-1 -right-1 z-10 animate-bounce">
        {holdingItem === 'star-candy' && (
          <span className="text-xs filter drop-shadow">⭐</span>
        )}
        {holdingItem === 'edelweiss' && (
          <span className="text-xs filter drop-shadow">🌸</span>
        )}
        {holdingItem === 'heart' && (
          <span className="text-xs filter drop-shadow">❤️</span>
        )}
        {holdingItem === 'cake' && (
          <span className="text-xs filter drop-shadow">🎂</span>
        )}
      </div>

      {/* SPEECH / TOOLTIP BUBBLE ON HOVER */}
      {label && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 border-2 border-amber-400 text-amber-200 font-pixel text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap shadow-md pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
};
