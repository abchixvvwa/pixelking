import React, { useState, useEffect } from 'react';

export default function LoaderOverlay({ text = 'COMPILING MATRIX...' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const int = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border-4 border-[var(--accent-yellow)] p-8 max-w-sm w-full shadow-[10px_10px_0_#000] text-center animate-pulse">
        <div className="flex justify-center mb-6">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }} className="animate-spin" style={{ animationDuration: '2s' }}>
            <rect x="7" y="1" width="2" height="3" fill="#f7c948"/>
            <rect x="7" y="12" width="2" height="3" fill="#f7c948"/>
            <rect x="1" y="7" width="3" height="2" fill="#f7c948"/>
            <rect x="12" y="7" width="3" height="2" fill="#f7c948"/>
            <rect x="3" y="3" width="2" height="2" fill="#4cc9f0"/>
            <rect x="11" y="11" width="2" height="2" fill="#4cc9f0"/>
            <rect x="11" y="3" width="2" height="2" fill="#4cc9f0"/>
            <rect x="3" y="11" width="2" height="2" fill="#4cc9f0"/>
          </svg>
        </div>
        <h2 className="arcade-text text-sm text-white tracking-widest leading-relaxed">
          [ {text}{dots} ]
        </h2>
        <p className="mt-4 font-mono text-[10px] text-[var(--color-dim)]">STAND BY FOR NEURAL LINK...</p>
      </div>
    </div>
  );
}
