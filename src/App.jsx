import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import useGameStore from './store/gameStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Trainer from './pages/Trainer';
import DifficultySelect from './components/DifficultySelect';
import GameOverScreen from './components/GameOverScreen';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import DailyChallenge from './components/DailyChallenge';
import Leaderboard from './components/Leaderboard';
import Shop from './components/Shop';
import OnlineGame from './pages/OnlineGame';
import { getActiveSkin } from './data/skins';
import { useEffect } from 'react';
import { PixelKingLogo } from './components/icons/PixelIcons';

export default function App() {
  const setActiveSkinState = useGameStore((s) => s.setActiveSkinState);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setActiveSkinState(getActiveSkin().id);
  }, [setActiveSkinState]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/play" element={<Dashboard />} />
      <Route path="/play/vs-player" element={<GameWrapper />} />
      <Route path="/play/online/:roomId" element={<OnlineGame />} />
      <Route path="/play/vs-ai" element={<DifficultyWrapper />} />
      <Route path="/play/vs-ai-game" element={<GameWrapper />} />
      <Route path="/play/daily" element={<DailyWrapper />} />
      <Route path="/play/leaderboard" element={<LeaderboardWrapper />} />
      <Route path="/play/skins" element={<ShopWrapper />} />
      <Route path="/play/trainer" element={<Trainer />} />
      <Route path="/play/train" element={<Trainer />} />
    </Routes>
  );
}

function GameWrapper() {
  const screen = useGameStore((s) => s.screen);
  if (screen === 'gameover') return <GameOverScreen />;
  return <GameScreen />;
}

function DifficultyWrapper() {
  return <DifficultySelect />;
}

function DailyWrapper() {
  const navigate = useNavigate();
  return <DailyChallenge onBack={() => navigate(-1)} />;
}

function LeaderboardWrapper() {
  const navigate = useNavigate();
  return <Leaderboard onBack={() => navigate(-1)} />;
}

function ShopWrapper() {
  const navigate = useNavigate();
  return <Shop onBack={() => navigate(-1)} />;
}

function GameScreen() {
  const gameMode = useGameStore((s) => s.gameMode);
  const aiDifficulty = useGameStore((s) => s.aiDifficulty);

  const BOT_NAMES = { novice: 'GLITCHBOT-1', tactician: 'VANGUARD-X', master: 'DREADLORD-Z' };

  const subtitle = gameMode === 'ai'
    ? `VS ${BOT_NAMES[aiDifficulty] ?? aiDifficulty.toUpperCase()}`
    : 'VS PLAYER';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="mb-4 text-center relative w-full max-w-[calc(min(95vw,600px))] mx-auto flex items-center justify-between">
        <h1 className="text-xl md:text-3xl arcade-text text-[var(--color-light)] flex items-center">
          <img src="/logo.png" alt="PIXELKING" className="h-8 md:h-12" />
        </h1>
        <p className="arcade-text text-[10px] text-[var(--accent-yellow)]">
          {subtitle}
        </p>
      </header>

      {/* Main Game Area */}
      <div className="w-full relative">
        <Board />
      </div>

      <GameStatus />
    </div>
  );
}
