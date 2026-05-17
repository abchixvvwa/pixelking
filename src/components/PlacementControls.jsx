import useGameStore from '../store/gameStore';

export default function PlacementControls() {
  const placementPiece = useGameStore(s => s.placementPiece);
  const setPlacementPiece = useGameStore(s => s.setPlacementPiece);
  const togglePlacementPhase = useGameStore(s => s.togglePlacementPhase);
  const aiAnalyzing = useGameStore(s => s.aiAnalyzing);

  const handleRun = () => {
    useGameStore.setState({ aiAnalyzing: true });
    // Эмуляция задержки LLM
    setTimeout(() => {
      useGameStore.setState({ aiAnalyzing: false });
      togglePlacementPhase();
      // Вынужденный ход от ИИ или проверка
      useGameStore.getState()._triggerAI();
    }, 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-[var(--bg-card)] pixel-border p-4 shadow-[4px_4px_0_#000]">
      <div className="arcade-text text-sm text-[var(--accent-red)] mb-4 text-center">TRAP ARCHITECT MODE</div>
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        <button onClick={() => setPlacementPiece(1)} className={`pixel-button py-2 px-3 text-[10px] md:text-xs ${placementPiece === 1 ? '!bg-white !text-black' : '!bg-[var(--color-dim)]'}`}>БЕЛАЯ</button>
        <button onClick={() => setPlacementPiece(2)} className={`pixel-button py-2 px-3 text-[10px] md:text-xs ${placementPiece === 2 ? '!bg-black !text-white !border-white' : '!bg-[var(--color-dim)]'}`}>ЧЕРНАЯ</button>
        <button onClick={() => setPlacementPiece(3)} className={`pixel-button py-2 px-3 text-[10px] md:text-xs ${placementPiece === 3 ? '!bg-white !text-black' : '!bg-[var(--color-dim)]'}`}>ДАМКА Б</button>
        <button onClick={() => setPlacementPiece(4)} className={`pixel-button py-2 px-3 text-[10px] md:text-xs ${placementPiece === 4 ? '!bg-black !text-white !border-white' : '!bg-[var(--color-dim)]'}`}>ДАМКА Ч</button>
      </div>
      <button 
        onClick={handleRun} 
        disabled={aiAnalyzing} 
        className="pixel-button w-full !bg-[var(--accent-red)] py-4 arcade-text text-sm md:text-base shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
      >
        [ RUN ALGORITHM ]
      </button>
    </div>
  );
}
