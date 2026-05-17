import { useState } from 'react';
import { PixelCheck } from './icons/PixelIcons';

const PRO_FEATURES = [
  'Открытие всех эксклюзивных скинов.',
  'Глубокий анализ партий от AI Coach (без лимитов).',
  'Золотой никнейм в Лидерборде.',
];

export default function PaywallModal({ open, onClose }) {
  const [payLabel, setPayLabel] = useState('ОПЛАТИТЬ');

  if (!open) return null;

  const handlePay = () => {
    setPayLabel('В демо-версии платежи отключены');
    setTimeout(() => setPayLabel('ОПЛАТИТЬ'), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="paywall-modal w-full max-w-md bg-[var(--bg-card)] pixel-border relative flex flex-col"
        style={{ boxShadow: '8px 8px 0 #000' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="arcade-text text-[8px] text-[var(--color-dim)] tracking-widest">UPGRADE</span>
          <button
            type="button"
            onClick={onClose}
            className="player-id-close arcade-text"
            aria-label="Закрыть"
          >
            X
          </button>
        </div>

        <div className="px-6 pt-2 pb-4 text-center">
          <h2
            className="arcade-text text-sm md:text-base text-[var(--accent-yellow)] leading-relaxed"
            style={{ textShadow: '3px 3px 0 #000' }}
          >
            РАЗБЛОКИРУЙ
            <br />
            PIXELKING PRO
          </h2>
        </div>

        <ul className="px-6 pb-6 flex flex-col gap-4">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5">
                <PixelCheck size={14} color="var(--accent-green)" />
              </span>
              <span className="arcade-text text-[9px] text-[var(--color-light)] leading-relaxed text-left">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="px-6 pb-2 text-center">
          <div
            className="arcade-text text-xl text-[var(--accent-yellow)] whitespace-nowrap"
            style={{ textShadow: '3px 3px 0 #000' }}
          >
            $4.99 / МЕСЯЦ
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={handlePay}
            className="w-full pixel-button py-4 arcade-text text-[10px] !bg-[var(--accent-yellow)] !text-black !border-black hover:!bg-white transition-colors whitespace-nowrap"
          >
            {payLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
