import { Link, useNavigate } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import { PixelCheck, PixelCross, PixelStar, PixelCrown, PixelRocket } from '../components/icons/PixelIcons';

export default function Plans() {
  useScrollReveal();
  const navigate = useNavigate();
  const handleCheckout = () => {
    alert('Оплата скоро! Следите за обновлениями');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--color-light)] font-mono overflow-y-auto pb-20">
      
      {/* Header */}
      <div className="pt-12 pb-8 text-center px-4">
        <button onClick={() => navigate(-1)} className="arcade-text text-xs text-[var(--color-dim)] hover:text-white mb-8 inline-block reveal-hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>&lt; НАЗАД</button>
        <h1 className="arcade-text text-3xl md:text-5xl text-[var(--accent-yellow)] mb-4 reveal-hidden delay-100 animate-blink">ТАРИФЫ</h1>
        <p className="font-sans text-[var(--color-dim)]">Выбери свой уровень доступа к системе</p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-6 justify-center items-stretch">
        
        {/* FREE */}
        <div className="flex-1 bg-[var(--bg-card)] border-4 border-[var(--color-dim)] p-8 pixel-shadow flex flex-col reveal-hidden delay-100">
          <div className="arcade-text text-2xl mb-2">FREE</div>
          <div className="arcade-text text-4xl mb-8">$0</div>
          
          <div className="font-sans text-sm space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Игра vs AI (3 уровня)</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Daily Quest</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Лидерборд</span></div>
            <div className="flex items-start gap-3 opacity-50"><PixelCross size={16} color="var(--accent-red)" /> <span>AI Тренер после партии</span></div>
            <div className="flex items-start gap-3 opacity-50"><PixelCross size={16} color="var(--accent-red)" /> <span>Доступ ко всем скинам</span></div>
            <div className="flex items-start gap-3 opacity-50"><PixelCross size={16} color="var(--accent-red)" /> <span>Mistake Trainer</span></div>
          </div>

          <Link to="/play" className="w-full text-center py-4 border-2 border-[var(--color-dim)] text-[var(--color-dim)] hover:text-white hover:border-white arcade-text text-xs transition-colors">
            ИГРАТЬ
          </Link>
        </div>

        {/* PRO */}
        <div className="flex-1 bg-[var(--bg-card)] border-4 border-[var(--accent-yellow)] p-8 pixel-shadow relative flex flex-col transform lg:-translate-y-4 reveal-hidden delay-200">
          <div className="absolute top-0 right-0 bg-[var(--accent-yellow)] text-black px-3 py-1 arcade-text text-[8px] flex items-center gap-1"><PixelStar size={10} color="#000" /> POPULAR</div>
          <div className="arcade-text text-2xl mb-2 text-[var(--accent-yellow)]">PRO</div>
          <div className="arcade-text text-4xl mb-8">$4.99<span className="text-sm">/мес</span></div>
          
          <div className="font-sans text-sm space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Всё из FREE</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Все премиум-скины</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>AI Coach после партии</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>10 подсказок AI в день</span></div>
            <div className="flex items-start gap-3 opacity-50"><PixelCross size={16} color="var(--accent-red)" /> <span>Mistake Trainer</span></div>
            <div className="flex items-start gap-3 opacity-50"><PixelCross size={16} color="var(--accent-red)" /> <span>Глубокая статистика</span></div>
          </div>

          <button onClick={handleCheckout} className="w-full text-center py-4 bg-[var(--accent-yellow)] text-black hover:bg-white arcade-text text-xs transition-colors">
            ПОПРОБОВАТЬ 7 ДНЕЙ
          </button>
        </div>

        {/* PRO MAX */}
        <div className="flex-1 bg-[var(--bg-card)] border-4 border-[#ffb703] p-8 pixel-shadow relative flex flex-col reveal-hidden delay-300">
          <div className="absolute top-0 left-0 bg-[#ffb703] text-black px-3 py-1 arcade-text text-[8px] animate-pulse flex items-center gap-1"><PixelCrown size={10} color="#000" /> BEST</div>
          <div className="arcade-text text-2xl mb-2 text-[#ffb703]">PRO MAX</div>
          <div className="arcade-text text-4xl mb-8">$9.99<span className="text-sm">/мес</span></div>
          
          <div className="font-sans text-sm space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Всё из PRO</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span className="font-bold text-[var(--accent-yellow)]">AI Тренер ∞ (безлимит)</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span className="font-bold text-[#ffb703]">Mistake Trainer</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Бесконечные подсказки</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Глубокая статистика</span></div>
            <div className="flex items-start gap-3"><PixelCheck size={16} color="var(--accent-green)" /> <span>Приоритет в матчмейкинге</span></div>
          </div>

          <button onClick={handleCheckout} className="w-full text-center py-4 bg-[#ffb703] text-black hover:bg-white arcade-text text-xs transition-colors">
            ПОПРОБОВАТЬ 7 ДНЕЙ
          </button>
        </div>

      </div>
    </div>
  );
}
