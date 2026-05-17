import { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import { PixelBrain, PixelLightningBolt, PixelTwoPlayers } from './icons/PixelIcons';

export default function OnboardingModal() {
  const showOnboarding = useGameStore(s => s.showOnboarding);
  const gameMode = useGameStore(s => s.gameMode);
  const aiDifficulty = useGameStore(s => s.aiDifficulty);
  const trainingMode = useGameStore(s => s.trainingMode);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (showOnboarding) {
      setTimeLeft(20);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            useGameStore.setState({ showOnboarding: false });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOnboarding]);

  if (!showOnboarding) return null;

  const handleClose = () => {
    useGameStore.setState({ showOnboarding: false });
  };

  let title = 'ПРАВИЛА';
  let description = 'Победи соперника!';
  let Icon = PixelTwoPlayers;

  if (gameMode === 'local') {
    if (trainingMode === 'trap') {
      title = 'TRAP ARCHITECT';
      description = 'Расставь шашки как угодно. Построй ловушку, затем нажми RUN ALGORITHM для симуляции исхода позиции.';
      Icon = PixelBrain;
    } else {
      title = 'ЛОКАЛЬНАЯ ИГРА';
      description = 'Играйте вдвоем на одном экране. Белые начинают. Рубить обязательно (правила русских шашек).';
    }
  } else if (gameMode === 'ai') {
    title = `VS AI (${aiDifficulty?.toUpperCase() || 'BOT'})`;
    description = 'Победи искусственный интеллект. Используй AI COPILOT справа, чтобы получить 3 подсказки. Рубить обязательно.';
    Icon = PixelLightningBolt;
  } else if (gameMode === 'online') {
    title = 'ONLINE DUEL';
    description = 'Победи живого противника. У тебя только 2 подсказки от COPILOT. На ход дается ограниченное время.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-primary)] border-4 border-[var(--accent-yellow)] p-6 md:p-8 max-w-lg w-full text-center shadow-[10px_10px_0_#000] relative">
        <div className="flex justify-center mb-6">
          <Icon size={48} className="text-[var(--accent-yellow)] animate-pulse" />
        </div>
        
        <h2 className="arcade-text text-xl md:text-2xl text-white mb-6 tracking-wider">
          [ {title} ]
        </h2>
        
        <p className="font-mono text-sm md:text-base text-[var(--color-light)] leading-relaxed mb-8 border-2 border-[var(--color-dim)] p-4 bg-black">
          {description}
        </p>
        
        <button 
          onClick={handleClose} 
          className="pixel-button w-full !bg-[var(--accent-green)] !text-black py-4 shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all arcade-text text-sm"
        >
          ПОНЯТНО, ГАЗУЕМ! ({timeLeft}С)
        </button>
      </div>
    </div>
  );
}
