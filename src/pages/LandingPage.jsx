import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, signInWithGoogle, signOut } from '../lib/supabase';
import useScrollReveal from '../hooks/useScrollReveal';
import './LandingPage.css';
import {
  PixelRobot, PixelBrain, PixelLightningBolt,
  WolfAvatar, FoxAvatar, LightningAvatar, IceAvatar, KingAvatar,
  PixelCorner, PixelDivider, PixelKingLogo
} from '../components/icons/PixelIcons';

const EMOJI_STRIP_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}⚡🍄🏆🥇🥈🥉🌟🎭🧊🦊🐺👑✅❌⭐🚀🔥💎]/gu;

const stripEmojis = (str) => (str || '').replace(EMOJI_STRIP_RE, '').trim();

function getArchetypeAvatar(archetypeStr) {
  const s = stripEmojis(archetypeStr).toLowerCase();
  if (s.includes('молния') || s.includes('lightning')) return LightningAvatar;
  if (s.includes('хладнокровный') || s.includes('ice')) return IceAvatar;
  if (s.includes('лис') || s.includes('fox')) return FoxAvatar;
  if (s.includes('король') || s.includes('king')) return KingAvatar;
  if (s.includes('волк') || s.includes('wolf')) return WolfAvatar;
  return WolfAvatar;
}

/* ═══════════════════════════════════════════
   Animated 6×6 Hero Board
   ═══════════════════════════════════════════ */
const BOARD_SIZE = 6;
const TOTAL = BOARD_SIZE * BOARD_SIZE;

function AnimatedBoard() {
  const pieces = { w1: 27, w2: 25, b1: 8, b2: 10 };

  const piecePositions = new Map();
  Object.entries(pieces).forEach(([id, idx]) => {
    if (idx !== -1) piecePositions.set(idx, id);
  });

  return (
    <div className="landing-board-wrap">
      <div className="landing-board">
        {Array.from({ length: TOTAL }, (_, i) => {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          const isDark = (r + c) % 2 === 1;
          const pid = piecePositions.get(i);
          const isWhite = pid?.startsWith('w');
          return (
            <div key={i} className={`landing-cell ${isDark ? 'dark' : 'light'}`}>
              {pid && (
                <div className={`landing-piece ${isWhite ? 'white' : 'black'}`}>
                  <div className="landing-piece-inner" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Corner decorations */}
      <div className="board-corner tl"><PixelCorner position="top-left" /></div>
      <div className="board-corner tr"><PixelCorner position="top-right" /></div>
      <div className="board-corner bl"><PixelCorner position="bottom-left" /></div>
      <div className="board-corner br"><PixelCorner position="bottom-right" /></div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Feature Card
   ═══════════════════════════════════════════ */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className={`feature-card reveal-hidden ${delay}`}>
      <div className="feature-icon-wrap">{icon}</div>
      <h3 className="arcade-text feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Archetype Card
   ═══════════════════════════════════════════ */
function ArchetypeCard({ avatar, name, desc, accentColor }) {
  return (
    <div className="archetype-card" style={{ '--archetype-accent': accentColor }}>
      <div className="archetype-avatar">{avatar}</div>
      <h3 className="arcade-text archetype-name">{name}</h3>
      <p className="archetype-desc">{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Landing Page
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  useScrollReveal();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('wins', { ascending: false })
          .limit(3);

        if (!error && data) {
          setLeaderboard(data);
        }
      } catch (e) {
        console.error('Leaderboard error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();

    return () => { subscription?.unsubscribe(); };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-root">
      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PixelKingLogo size={48} />
            <span className="arcade-text text-[var(--accent-yellow)]" style={{ textShadow: '2px 2px 0 #000' }}>PIXELKING</span>
          </div>
          <div className="nav-links">
            <button onClick={() => scrollTo('features')} className="nav-link">ИГРА</button>
            <button onClick={() => scrollTo('leaderboard')} className="nav-link">РЕЙТИНГ</button>
            <button onClick={() => scrollTo('psychotypes')} className="nav-link">ТРЕНИРОВКА</button>
            <Link to="/plans" className="nav-link">ТАРИФЫ</Link>
          </div>
          <div className="nav-right">
            {user ? (
              <div className="nav-user">
                <WolfAvatar size={24} />
                <span className="arcade-text nav-username">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                <button onClick={signOut} className="arcade-text nav-signout">ВЫЙТИ</button>
              </div>
            ) : (
              <Link to="/login" className="nav-google-btn arcade-text" style={{ textDecoration: 'none' }}>ВОЙТИ</Link>
            )}
            {user
              ? <Link to="/play" className="pixel-button nav-play-btn">НА БАЗУ</Link>
              : <Link to="/login" className="pixel-button nav-play-btn">ИГРАТЬ →</Link>
            }
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="arcade-text hero-title">
              РУССКИЕ<br />
              <span className="hero-yellow">ШАШКИ</span><br />
              НОВОГО<br />
              ПОКОЛЕНИЯ
            </h1>
            <p className="hero-subtitle">
              Играй против AI. Получай разбор каждой партии. Узнай свой стиль мышления.
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/play" className="pixel-button hero-cta-primary">
                  ВЕРНУТЬСЯ НА БАЗУ
                </Link>
              ) : (
                <Link to="/login" className="pixel-button hero-cta-primary">
                  ИГРАТЬ БЕСПЛАТНО
                </Link>
              )}
              <button onClick={() => scrollTo('features')} className="hero-cta-secondary arcade-text">
                КАК ЭТО РАБОТАЕТ
              </button>
            </div>
          </div>
          <div className="hero-board-area">
            <AnimatedBoard />
          </div>
        </div>
        {/* Decorative corners */}
        <div className="section-corner tl"><PixelCorner position="top-left" /></div>
        <div className="section-corner tr"><PixelCorner position="top-right" /></div>
      </section>

      <PixelDivider />

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <div className="section-corner tl"><PixelCorner position="top-left" /></div>
        <div className="section-corner tr"><PixelCorner position="top-right" /></div>
        <h2 className="arcade-text section-title yellow reveal-hidden">ЧТО ВНУТРИ</h2>
        <div className="features-grid">
          <FeatureCard icon={<PixelRobot size={56} />} title="AI ПРОТИВНИК" desc="Брось вызов умному ИИ, который учится на твоих ходах. Оттачивай мастерство против соперника, который не прощает ошибок." delay="delay-100" />
          <FeatureCard icon={<PixelBrain size={56} />} title="AI ТРЕНЕР" desc="Получай детальный разбор каждой партии. ИИ укажет на зевки, объяснит лучшие ходы и поможет понять твой уникальный стиль мышления." delay="delay-200" />
          <FeatureCard icon={<PixelLightningBolt size={56} />} title="DAILY QUEST" desc="Новая тактическая задача каждые 24 часа. Решай уникальные позиции и соревнуйся с миром за верхние строчки в рейтинге." delay="delay-300" />
        </div>
        <div className="section-corner bl"><PixelCorner position="bottom-left" /></div>
        <div className="section-corner br"><PixelCorner position="bottom-right" /></div>
      </section>

      <PixelDivider />

      {/* ── PSYCHOTYPES ── */}
      <section id="psychotypes" className="psychotypes-section">
        <h2 className="arcade-text section-title reveal-hidden">УЗНАЙ СВОЙ СТИЛЬ ИГРЫ</h2>
        <p className="section-subtitle reveal-hidden delay-100">Сыграй 3 партии — AI определит твой стратегический архетип</p>
        <div className="archetype-grid reveal-hidden delay-200">
          <div className="archetype-row">
            <ArchetypeCard avatar={<WolfAvatar size={56} />} name="ВОЛК" desc="Агрессивен, атакует с первых ходов" accentColor="#e63946" />
            <ArchetypeCard avatar={<FoxAvatar size={56} />} name="ЛИС" desc="Жертвует ради выигрышной позиции" accentColor="#e63946" />
          </div>
          <div className="archetype-row">
            <ArchetypeCard avatar={<LightningAvatar size={56} />} name="МОЛНИЯ" desc="Действует быстро и рискованно" accentColor="#f7c948" />
            <ArchetypeCard avatar={<IceAvatar size={56} />} name="ХЛАДНОКРОВНЫЙ" desc="Методичен и предельно осторожен" accentColor="#4cc9f0" />
            <ArchetypeCard avatar={<KingAvatar size={56} />} name="КОРОЛЬ" desc="Сбалансированная доминирующая игра" accentColor="#f7c948" />
          </div>
        </div>
        <div className="psychotype-cta reveal-hidden">
          <Link to="/play" className="arcade-text psychotype-link">ПРОЙТИ ТЕСТ ЧЕРЕЗ ИГРУ →</Link>
        </div>
      </section>

      <PixelDivider />

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard" className="leaderboard-section">
        <h2 className="arcade-text section-title reveal-hidden">HIGH SCORES</h2>
        <div className="leaderboard-table reveal-hidden delay-100">
          {loading ? (
            <div className="lb-loading">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="lb-skeleton" />
              ))}
            </div>
          ) : (
            <div className="lb-rows">
              {leaderboard.map((u, i) => {
                const isGold = i === 0;
                const isSilver = i === 1;
                const isBronze = i === 2;
                const rankColor = isGold ? 'var(--accent-yellow)' : isSilver ? '#c0c0c0' : isBronze ? '#cd7f32' : 'var(--color-dim)';

                const Avatar = getArchetypeAvatar(u.best_archetype);

                return (
                  <div
                    key={i}
                    className="flex items-center w-full gap-2 px-4 py-3 hover:bg-white/5 transition-colors"
                    style={{ ...(isGold ? { background: 'rgba(247,201,72,0.06)', outline: '2px solid var(--accent-yellow)', outlineOffset: '-2px' } : { borderBottom: '1px dashed rgba(160,160,192,0.12)' }) }}
                  >
                    <span className="arcade-text w-14 flex-shrink-0 whitespace-nowrap" style={{ color: rankColor, fontSize: '0.85rem' }}>
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="arcade-text text-[10px] flex-1 min-w-0 truncate text-[var(--color-light)]">
                      {(u.username || u.name || 'UNKNOWN').toUpperCase()}
                    </span>
                    <span className="arcade-text text-[10px] hidden sm:block w-32 text-center flex-shrink-0 truncate text-[var(--color-dim)]">
                      {(u.city || u.location || 'UNKNOWN').toUpperCase()}
                    </span>
                    <span className="arcade-text text-[10px] w-20 text-right flex-shrink-0 text-[var(--accent-green)] whitespace-nowrap">
                      {u.wins || 0} WINS
                    </span>
                    <span className="w-10 flex-shrink-0 flex justify-center ml-2">
                      <Avatar size={20} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="lb-cta">
          <Link to="/play/leaderboard" className="pixel-button lb-btn">ПОЛНЫЙ РЕЙТИНГ →</Link>
        </div>
      </section>

      <PixelDivider />

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-box reveal-hidden">
          <div className="section-corner tl"><PixelCorner position="top-left" color="#f7c948" /></div>
          <div className="section-corner tr"><PixelCorner position="top-right" color="#f7c948" /></div>
          <h2 className="arcade-text cta-title">ГОТОВ К ПЕРВОЙ<br />ПАРТИИ?</h2>
          <Link to="/play" className="cta-mega-btn arcade-text">НАЧАТЬ ИГРУ</Link>
          <p className="cta-sub">Бесплатно. Без регистрации. Прямо сейчас.</p>
          <div className="section-corner bl"><PixelCorner position="bottom-left" color="#f7c948" /></div>
          <div className="section-corner br"><PixelCorner position="bottom-right" color="#f7c948" /></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="arcade-text footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelKingLogo size={24} />
            PIXELKING
          </div>
          <div className="footer-links">
            <Link to="/play/vs-player">Игра</Link>
            <Link to="/play/leaderboard">Рейтинг</Link>
            <Link to="/play/train">Тренировка</Link>
            <Link to="/plans">Тарифы</Link>
          </div>
          <div className="footer-made">© 2026 PixelKing. Все когнитивные права защищены.</div>
        </div>
      </footer>
    </div>
  );
}
