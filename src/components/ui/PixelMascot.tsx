import React, { useState } from 'react';

export const PixelMascot = ({ className }: { className?: string }) => {
  const [isJumping, setIsJumping] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleTap = () => {
    if (isJumping) return;
    setIsJumping(true);
    setShowHeart(true);
    setTimeout(() => setIsJumping(false), 600);
    setTimeout(() => setShowHeart(false), 1500);
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onClick={handleTap}
      style={{ cursor: 'pointer' }}
    >
      {/* Floating Heart */}
      {showHeart && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 animate-float-up pointer-events-none z-10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444" stroke="black" strokeWidth="2"/>
          </svg>
        </div>
      )}

      <svg 
        viewBox="0 0 80 64" 
        className={`w-full h-full transition-transform duration-100 ${isJumping ? 'animate-bounce-custom' : ''}`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <defs>
          <style>
            {`
              .mascot-wag { animation: wag 1s ease-in-out infinite; }
              .mascot-wave { animation: wave 2s ease-in-out infinite; }
              .glasses-shine { animation: shine 3s linear infinite; }
              
              @keyframes wag {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-20deg); }
              }
              @keyframes wave {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(25deg); }
              }
              @keyframes shine {
                0% { transform: translateX(-20px); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateX(20px); opacity: 0; }
              }
              @keyframes jump {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px) scale(0.9, 1.1); }
              }
            `}
          </style>
        </defs>

        {/* --- SHADOW --- */}
        {/* Shifted right to match new body position */}
        <ellipse cx="40" cy="58" rx="16" ry="4" fill="black" opacity="0.2" />

        {/* --- MAIN GROUP (Shifted Right +8px to fit tail) --- */}
        <g transform="translate(8, 0)"> 
          
          {/* --- TAIL (Behind) --- */}
          <g className="mascot-wag" transform-origin="10 50">
            <rect x="2" y="40" width="12" height="14" fill="#EA580C" />
            <rect x="0" y="36" width="10" height="10" fill="#EA580C" />
            <rect x="14" y="44" width="4" height="6" fill="#EA580C" />
            {/* Tail Tip */}
            <rect x="0" y="32" width="6" height="6" fill="#FDBA74" />
          </g>

          {/* --- BODY GROUP (Stationary - No Breathing) --- */}
          <g>
            {/* Torso Base - Extra Puffy */}
            <rect x="18" y="38" width="28" height="18" fill="#EA580C" />
            <rect x="16" y="42" width="32" height="12" fill="#EA580C" />
            
            {/* White Belly - Round */}
            <rect x="24" y="38" width="16" height="14" fill="white" />
            <rect x="22" y="42" width="20" height="8" fill="white" />

            {/* Feet - Planted relative to body */}
            <rect x="20" y="54" width="8" height="4" fill="#3F3F46" />
            <rect x="36" y="54" width="8" height="4" fill="#3F3F46" />

            {/* Arms */}
            {/* Left Arm (Resting) */}
            <rect x="16" y="44" width="6" height="8" fill="#EA580C" />
            <rect x="16" y="50" width="6" height="4" fill="white" /> {/* Paw */}

            {/* Right Arm (Waving) - Attached to body */}
            <g className="mascot-wave" style={{ transformOrigin: '48px 44px' }}>
              <rect x="46" y="42" width="12" height="6" fill="#EA580C" transform="rotate(-30 46 42)" />
              <rect x="54" y="34" width="8" height="8" fill="white" transform="rotate(-10 54 34)" /> {/* Paw */}
              {/* Beans */}
              <rect x="55" y="35" width="2" height="2" fill="#EA580C" transform="rotate(-10 54 34)"/>
              <rect x="58" y="35" width="2" height="2" fill="#EA580C" transform="rotate(-10 54 34)"/>
            </g>

            {/* --- HEAD GROUP (Stationary) --- */}
            <g>
              {/* Head Base - Wide & Puffy */}
              <rect x="12" y="14" width="40" height="22" fill="#EA580C" />
              <rect x="10" y="18" width="44" height="14" fill="#EA580C" />
              <rect x="8" y="22" width="48" height="8" fill="#EA580C" /> {/* Cheeks */}

              {/* Ears - Tall & Alert */}
              <rect x="14" y="4" width="10" height="12" fill="#EA580C" />
              <rect x="40" y="4" width="10" height="12" fill="#EA580C" />
              {/* Inner Ears */}
              <rect x="16" y="8" width="6" height="6" fill="#FDBA74" />
              <rect x="42" y="8" width="6" height="6" fill="#FDBA74" />

              {/* Muzzle - White */}
              <rect x="18" y="28" width="28" height="10" fill="white" />
              <rect x="22" y="38" width="20" height="2" fill="white" /> {/* Chin */}

              {/* Sunglasses - The "Logo" Look */}
              <rect x="14" y="20" width="16" height="10" fill="#18181B" />
              <rect x="34" y="20" width="16" height="10" fill="#18181B" />
              <rect x="30" y="22" width="4" height="4" fill="#18181B" /> {/* Bridge */}
              
              {/* Shine on Glasses */}
              <g className="glasses-shine">
                <rect x="16" y="22" width="4" height="4" fill="white" opacity="0.5" />
                <rect x="36" y="22" width="4" height="4" fill="white" opacity="0.5" />
              </g>

              {/* Nose */}
              <rect x="28" y="30" width="8" height="4" fill="#3F3F46" />

              {/* Smile */}
              <rect x="30" y="36" width="4" height="2" fill="#3F3F46" />
              <rect x="28" y="35" width="2" height="2" fill="#3F3F46" />
              <rect x="34" y="35" width="2" height="2" fill="#3F3F46" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
