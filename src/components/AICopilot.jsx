import React, { useState } from 'react';
import useGameStore from '../store/gameStore';
import { askCopilot } from '../logic/copilotService';

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState('');
  
  const board = useGameStore(s => s.board);
  const hintsLeft = useGameStore(s => s.copilotHintsLeft);
  const cooldown = useGameStore(s => s.copilotCooldown);
  const useHint = useGameStore(s => s.useCopilotHint);
  const aiAnalyzing = useGameStore(s => s.aiAnalyzing);

  const handleAsk = async (type) => {
    if (hintsLeft <= 0 || cooldown > 0) return;
    
    if (useHint()) {
      useGameStore.setState({ aiAnalyzing: true });
      setResponse('');
      const answer = await askCopilot(board, type);
      setResponse(answer);
      useGameStore.setState({ aiAnalyzing: false });
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/3 transform -translate-y-1/2 bg-[var(--bg-card)] border-y-4 border-l-4 border-[var(--color-dim)] p-3 shadow-[-4px_4px_0_#000] z-40 transition-transform hover:-translate-x-1"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <span className="arcade-text text-[10px] text-white tracking-widest">
          AI COPILOT <span className="text-[var(--accent-yellow)]">[{hintsLeft}]</span>
        </span>
      </button>

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[var(--bg-primary)] border-l-4 border-[var(--color-dim)] shadow-[-10px_0_0_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b-4 border-[var(--color-dim)] flex justify-between items-center bg-[var(--bg-card)]">
          <h2 className="arcade-text text-sm text-white flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
              <rect x="3" y="2" width="10" height="9" fill="#1a1c2c"/>
              <rect x="4" y="3" width="8" height="7" fill="#4cc9f0"/>
              <rect x="5" y="4" width="2" height="2" fill="#1a1c2c"/>
              <rect x="9" y="4" width="2" height="2" fill="#1a1c2c"/>
            </svg>
            COPILOT
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-[var(--color-dim)] hover:text-white font-mono text-xl leading-none">×</button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          
          <div className="bg-[var(--bg-card)] border-2 border-[var(--color-dim)] p-3 text-center mb-2">
            <div className="arcade-text text-[10px] text-[var(--color-light)] mb-1">HINTS REMAINING</div>
            <div className="arcade-text text-2xl text-[var(--accent-yellow)]">{hintsLeft}</div>
            {cooldown > 0 && (
              <div className="text-[10px] font-mono text-[var(--accent-red)] mt-2">
                COOLDOWN: {cooldown} TURNS
              </div>
            )}
          </div>

          <button 
            disabled={hintsLeft <= 0 || cooldown > 0 || aiAnalyzing}
            onClick={() => handleAsk('BEST_MOVE')}
            className="pixel-button py-3 text-[10px] bg-transparent border-2 border-[#4cc9f0] text-[#4cc9f0] hover:bg-[#4cc9f0] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ 🎯 НАЙТИ ЛУЧШИЙ ХОД ]
          </button>
          
          <button 
            disabled={hintsLeft <= 0 || cooldown > 0 || aiAnalyzing}
            onClick={() => handleAsk('THREATS')}
            className="pixel-button py-3 text-[10px] bg-transparent border-2 border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ 🛡️ АНАЛИЗ УГРОЗ ]
          </button>

          <button 
            disabled={hintsLeft <= 0 || cooldown > 0 || aiAnalyzing}
            onClick={() => handleAsk('EVALUATION')}
            className="pixel-button py-3 text-[10px] bg-transparent border-2 border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ 🧠 ОЦЕНКА ПОЗИЦИИ ]
          </button>

          {/* Terminal Output */}
          <div className="mt-4 flex-1 flex flex-col">
            <div className="arcade-text text-[10px] text-[var(--color-dim)] mb-2 uppercase">TERMINAL OUTPUT</div>
            <div className="flex-1 bg-black border-2 border-[var(--color-dim)] p-4 font-mono text-[10px] text-[var(--color-light)] relative shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
              {aiAnalyzing ? (
                <div className="flex gap-2 text-[var(--accent-yellow)] animate-pulse">
                  <span>&gt;</span>
                  <span>ANALYZING MATRIX...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  <span className="text-[var(--accent-green)] mr-2">&gt;</span>
                  {response || 'AWAITING COMMAND...'}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
