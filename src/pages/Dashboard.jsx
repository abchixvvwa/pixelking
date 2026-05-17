import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useDailyStore from '../store/dailyStore';
import { getTodayChallenge } from '../data/dailyChallenges';
import { supabase, signInWithGoogle, signOut } from '../lib/supabase';
import {
  PixelRobot, PixelBrain, PixelUser, PixelTwoPlayers,
  PixelGalaxy, PixelStar, PixelFire, PixelRepeat, PixelMedal, PixelLightningBolt,
  WolfAvatar, FoxAvatar, LightningAvatar, IceAvatar, KingAvatar
} from '../components/icons/PixelIcons';
import { generateRoomId } from '../lib/onlineRoom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(localStorage.getItem('duels_player_name') || localStorage.getItem('duels_username') || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [matchHistory, setMatchHistory] = useState(null);
  const [stats, setStats] = useState({
    lvl: 1,
    xp: 0,
    maxXp: 100,
    psychotype: 'UNKNOWN',
    streak: 0,
    wins: 0,
    losses: 0,
    winrate: 0
  });
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const startLocalGame = useGameStore(s => s.startLocalGame);

  const dailyResult = useDailyStore(s => s.result);
  const dailyCompleted = useDailyStore(s => s.completed);
  const initDaily = useDailyStore(s => s.initDaily);
  const challenge = getTodayChallenge();

  useEffect(() => {
    initDaily();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMistakes(session.user.id);
        fetchStats(session.user);
        fetchHistory(session.user.id);
      } else {
        resetStats();
        setMatchHistory(null);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMistakes(session.user.id);
        fetchStats(session.user);
        fetchHistory(session.user.id);
      } else {
        resetStats();
        setMatchHistory(null);
      }
    });
    async function fetchTop() {
      try {
        const { data } = await supabase.from('leaderboard').select('*').order('wins', { ascending: false }).limit(5);
        if (data) setLeaderboard(data);
      } catch (e) {}
    }
    fetchTop();

    return () => subscription?.unsubscribe();
  }, [initDaily]);

  async function fetchHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('match_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!error && data) {
        setMatchHistory(data);
      }
    } catch (e) { console.error(e); }
  }

  async function fetchMistakes(userId) {
    try {
      const { data, error } = await supabase
        .from('mistakes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('resolved', false)
        .lte('next_review', new Date().toISOString());
      
      if (!error && data !== null) {
        setMistakesCount(data.length); 
      } else if (error && error.message.includes('Supabase не настроен')) {
        const localMistakes = JSON.parse(localStorage.getItem('duels_mistakes') || '[]');
        const now = new Date().toISOString();
        const pending = localMistakes.filter(m => m.user_id === userId && !m.resolved && m.next_review <= now);
        setMistakesCount(pending.length);
      }
    } catch (e) { console.error(e); }
  }

  async function fetchStats(currentUser, customName = null) {
    try {
      const localName = customName || localStorage.getItem('duels_player_name') || localStorage.getItem('duels_username');
      const uname = localName || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0];
      const { data, error } = await supabase
        .from('leaderboard')
        .select('wins, losses, total_games, best_archetype')
        .eq('username', uname)
        .single();

      if (!error && data) {
        const winrate = data.total_games > 0 ? Math.round((data.wins / data.total_games) * 100) : 0;
        const totalXp = data.wins * 100 + data.losses * 20;
        const lvl = Math.floor(totalXp / 500) + 1;
        const currentXp = totalXp % 500;
        
        setStats({
          lvl,
          xp: currentXp,
          maxXp: 500,
          psychotype: data.best_archetype || 'UNKNOWN',
          streak: data.wins > 0 ? Math.floor(data.wins / 3) : 0,
          wins: data.wins,
          losses: data.losses,
          winrate
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  function resetStats() {
    setStats({
      lvl: 1, xp: 0, maxXp: 100, psychotype: 'UNKNOWN', streak: 0, wins: 0, losses: 0, winrate: 0
    });
  }

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      const name = tempName.trim();
      localStorage.setItem('duels_player_name', name);
      localStorage.setItem('duels_username', name);
      setPlayerName(name);
      setIsEditingName(false);
      if (user) {
        fetchStats(user, name);
      }
    }
  };

  const handleStartVsPlayerLocal = () => {
    startLocalGame();
    navigate('/play/vs-player');
  };

  const handlePlayOnline = () => {
    const roomId = generateRoomId();
    navigate(`/play/online/${roomId}`);
  };



  const lastGameStr = localStorage.getItem('duels_last_game');
  const lastGame = lastGameStr ? JSON.parse(lastGameStr) : null;

  return (
    <div className="animate-iris-in min-h-screen" style={{ background: 'var(--bg-primary)', padding: '1.5rem 1rem 4rem', color: 'var(--color-light)', fontFamily: 'monospace', position: 'relative', backgroundSize: '32px 32px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header: BACK + PIXELKING in one row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
          <button
            onClick={() => navigate('/')}
            className="pixel-button hover:brightness-110 hover:bg-white/10 transition-colors"
            style={{ padding: '8px 16px', fontSize: '10px', background: 'var(--bg-card)', color: 'var(--color-light)', position: 'absolute', left: 0 }}
          >
            ← НАЗАД
          </button>

          <span className="arcade-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--accent-yellow)', textShadow: '4px 4px 0px #000', letterSpacing: '2px' }}>PIXELKING</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '1.5rem' }}>

        {/* LEFT PANEL - Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="bg-[var(--bg-card)] pixel-border pixel-shadow p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              {user ? (
                <>
                  {/* Pixel avatar based on archetype from Supabase */}
                  {(() => {
                    const getAvatar = (str) => {
                      if (!str || str === 'UNKNOWN') return WolfAvatar;
                      const s = str.toLowerCase();
                      if (s.includes('молния') || s.includes('lightning')) return LightningAvatar;
                      if (s.includes('хладнокровный') || s.includes('ice')) return IceAvatar;
                      if (s.includes('лис') || s.includes('fox')) return FoxAvatar;
                      if (s.includes('король') || s.includes('king')) return KingAvatar;
                      if (s.includes('волк') || s.includes('wolf')) return WolfAvatar;
                      return WolfAvatar;
                    };
                    const AvatarComponent = getAvatar(stats.psychotype);
                    return <AvatarComponent size={64} />;
                  })()}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {isEditingName ? (
                      <form onSubmit={handleSaveName} className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          value={tempName}
                          onChange={e => setTempName(e.target.value)}
                          placeholder="NICKNAME"
                          className="w-full bg-black border border-[var(--color-dim)] text-xs p-1 outline-none text-[var(--accent-yellow)]"
                          autoFocus
                        />
                        <button type="submit" className="text-[9px] bg-[var(--color-dim)] text-black px-2 py-1">SAVE</button>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2 min-w-0">
                          <div className="arcade-text text-base truncate overflow-hidden text-white">
                            {(playerName || user.user_metadata?.full_name || user.email?.split('@')[0]).toUpperCase()}
                          </div>
                          <div className="flex flex-row flex-wrap items-baseline gap-2">
                            <button onClick={() => { setIsEditingName(true); setTempName(playerName || user.user_metadata?.full_name || user.email?.split('@')[0]); }} className="text-xs text-[var(--color-dim)] hover:text-[var(--accent-yellow)] whitespace-nowrap flex-shrink-0">ИЗМЕНИТЬ</button>
                            <button onClick={signOut} className="text-xs text-[var(--accent-red)] hover:text-white whitespace-nowrap flex-shrink-0">ВЫЙТИ</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[var(--color-dim)] flex items-center justify-center border-2 border-[var(--bg-primary)] flex-shrink-0">
                    <PixelUser size={36} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="arcade-text text-sm truncate text-white mb-2">GUEST</div>
                    <button onClick={signInWithGoogle} className="pixel-button w-full" style={{ padding: '8px', fontSize: '8px' }}>ВОЙТИ (GOOGLE)</button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <div className="flex flex-row justify-between items-center w-full gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <PixelLightningBolt size={24} className="flex-shrink-0" />
                    <span className="arcade-text text-sm text-[var(--accent-yellow)] whitespace-nowrap">LVL {stats.lvl}</span>
                  </div>
                  <span className="arcade-text text-sm text-[var(--color-dim)] whitespace-nowrap flex-shrink-0">{stats.xp} / {stats.maxXp} XP</span>
                </div>
                <div className="w-full h-4 bg-black border border-[var(--color-dim)]">
                  <div className="h-full bg-[var(--accent-yellow)]" style={{ width: `${(stats.xp/stats.maxXp)*100}%` }}></div>
                </div>
              </div>

              <div className="border-t border-[var(--color-dim)]/50 pt-5 flex justify-between items-center">
                <div>
                  <span className="arcade-text text-xs text-[var(--color-dim)] block mb-2">ПСИХОТИП:</span>
                  <span className="arcade-text text-base text-[var(--accent-green)]">{stats.psychotype}</span>
                </div>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="arcade-text text-[10px] text-[var(--color-dim)] hover:text-[var(--color-light)] transition-colors border border-[var(--color-dim)] px-3 py-2 cursor-pointer bg-black"
                >
                  ? ИНФО
                </button>
              </div>

              <div className="border-t border-[var(--color-dim)]/50 pt-5" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <PixelFire size={24} />
                <span className="arcade-text text-base text-[var(--accent-red)]">STREAK: {stats.streak}Д</span>
              </div>

              <div className="border-t border-[var(--color-dim)]/50 pt-5 space-y-4">
                <div className="flex justify-between items-center"><span className="arcade-text text-xs text-[var(--color-dim)]">ПОБЕД:</span> <span className="arcade-text text-base text-[var(--color-light)]" style={{ flexShrink: 0 }}>{stats.wins}</span></div>
                <div className="flex justify-between items-center"><span className="arcade-text text-xs text-[var(--color-dim)]">ПОРАЖЕНИЙ:</span> <span className="arcade-text text-base text-[var(--color-light)]" style={{ flexShrink: 0 }}>{stats.losses}</span></div>
                <div className="flex justify-between items-center"><span className="arcade-text text-xs text-[var(--color-dim)]">ВИНРЕЙТ:</span> <span className="arcade-text text-base text-[var(--accent-yellow)]" style={{ flexShrink: 0 }}>{stats.winrate}%</span></div>
              </div>

              {/* Guest login banner - moved here from center */}
              {!user && (
                <div onClick={signInWithGoogle} className="cursor-pointer border-2 border-black p-4 text-center mt-6 hover:-translate-y-1 transition-all duration-200" style={{ background: '#f7c948', boxShadow: '4px 4px 0 #000' }}>
                  <span className="arcade-text text-sm text-[#1a1c2c]">ВОЙТИ ЧЕРЕЗ GOOGLE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Daily Quest Banner */}
          <Link to="/play/daily" className="block bg-[var(--bg-card)] border-4 border-[var(--accent-yellow)] pixel-shadow p-8 group hover:-translate-y-1 transition-all duration-200 hover:shadow-[0_0_15px_rgba(247,201,72,0.4)] relative overflow-hidden">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl text-[var(--accent-yellow)] opacity-50 group-hover:translate-x-2 transition-transform">→</div>
            <div className="arcade-text text-2xl text-[var(--accent-yellow)] mb-3 flex items-center gap-2"><PixelLightningBolt size={24}/> DAILY QUEST</div>
            <div className="text-base mb-3">"{challenge?.title}"</div>
            <div className="text-sm text-[var(--color-dim)] font-sans">
              {dailyCompleted ? (
                <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--accent-green)' }}>
                  DONE ·
                  {Array.from({ length: dailyResult?.stars || 3 }).map((_, i) => (
                    <PixelStar key={i} size={18} />
                  ))}
                </span>
              ) : (
                <span>Не решено. Попробуй прямо сейчас!</span>
              )}
            </div>
          </Link>

          {/* Mistake Trainer Banner */}
          {user && mistakesCount > 0 && (
            <div className="bg-[var(--bg-card)] border-4 border-[var(--accent-red)] p-6 relative overflow-hidden animate-pulse">
              <div className="flex justify-between items-center">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <PixelRepeat size={20} />
                    <div className="arcade-text text-sm text-[var(--color-light)]">ПОВТОРИ УРОК</div>
                  </div>
                  <div className="text-sm text-[var(--color-dim)] font-sans">
                    Ошибок к повторению: <span className="text-[var(--accent-red)] font-bold">{mistakesCount}</span>
                  </div>
                </div>
                <Link to="/play/trainer" className="pixel-button py-3 px-6 text-xs !bg-[var(--accent-red)] !text-white !border-white">
                  РЕШИТЬ →
                </Link>
              </div>
            </div>
          )}

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] pixel-border pixel-shadow p-8 text-left flex flex-col hover:border-[var(--color-light)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(247,201,72,0.4)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                <PixelTwoPlayers size={48} />
              </div>
              <div className="arcade-text text-xl mb-2 text-[var(--color-light)]">VS PLAYER</div>
              <div className="flex flex-col gap-3 mt-auto">
                <button type="button" onClick={handleStartVsPlayerLocal} className="w-full pixel-button py-3 arcade-text text-[10px] !bg-[var(--accent-green)] !text-black !border-black">ЛОКАЛЬНО</button>
                <button type="button" onClick={handlePlayOnline} className="w-full pixel-button py-3 arcade-text text-[10px] !bg-[var(--accent-yellow)] !text-black !border-black">PLAY ONLINE</button>
              </div>
            </div>
            <Link to="/play/vs-ai" className="bg-[var(--bg-card)] pixel-border pixel-shadow p-8 block hover:border-[var(--color-light)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(247,201,72,0.4)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                <FoxAvatar size={48} />
              </div>
              <div className="arcade-text text-xl mb-2 text-[var(--color-light)]">VS AI</div>
              <div className="text-base font-bold text-[var(--color-dim)] font-sans">PLAY VS CPU</div>
            </Link>
            <Link to="/plans" className="bg-[var(--bg-card)] pixel-border pixel-shadow p-8 block hover:border-[var(--color-light)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(247,201,72,0.4)]">
              <div style={{ marginBottom: '12px' }}>
                <PixelBrain size={48} />
              </div>
              <div className="arcade-text text-xl mb-2 text-[var(--accent-green)]">ТРЕНИРОВКА</div>
              <div className="text-base font-bold text-[var(--color-dim)] font-sans flex items-center gap-2"><PixelLightningBolt size={16}/> AI COACH</div>
            </Link>
            <Link to="/play/skins" className="bg-[var(--bg-card)] pixel-border pixel-shadow p-8 block hover:border-[var(--color-light)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(247,201,72,0.4)]">
              <div style={{ marginBottom: '12px' }}>
                <PixelGalaxy size={48} />
              </div>
              <div className="arcade-text text-xl mb-2 text-[var(--color-light)]">SELECT SKIN</div>
              <div className="text-base font-bold text-[var(--color-dim)] font-sans">CUSTOMIZE</div>
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL - Mini Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="bg-[var(--bg-card)] pixel-border p-6 flex flex-col">
            <h3 className="arcade-text text-xl text-[var(--color-light)] mb-8 text-center tracking-wide">HIGH SCORES</h3>
            <div className="flex flex-col gap-5 mb-8 flex-1">
              {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                <div key={i} className="flex justify-between items-center w-full gap-2 hover:bg-white/5 cursor-pointer p-2 -m-2 rounded transition-colors">
                  <div className={`flex items-center gap-2 min-w-0 flex-1 ${i === 0 ? 'text-[var(--accent-yellow)]' : i === 1 ? 'text-[var(--color-light)]' : i === 2 ? 'text-[#cd7f32]' : 'text-[var(--color-dim)]'}`}>
                    <span className="flex-shrink-0">
                      {i < 3 ? <PixelMedal rank={i+1} size={24} /> : <span className="arcade-text text-[10px] whitespace-nowrap">{i+1}.</span>}
                    </span>
                    <span className={`arcade-text text-[10px] flex-1 min-w-0 truncate ${i === 0 ? 'text-[var(--accent-yellow)]' : i === 1 ? 'text-[var(--color-light)]' : i === 2 ? 'text-[#cd7f32]' : 'text-[var(--color-dim)]'}`}>
                      {(u.username || u.name || 'UNKNOWN').toUpperCase()}
                    </span>
                  </div>
                  <span className="arcade-text text-sm text-[var(--accent-green)] flex-shrink-0 whitespace-nowrap">{u.wins} П</span>
                </div>
              )) : (
                <div className="arcade-text text-sm text-center text-[var(--color-dim)] mt-4">ЗАГРУЗКА...</div>
              )}
            </div>
            <Link to="/play/leaderboard" className="arcade-text text-sm block w-full border border-[var(--color-dim)] text-center py-4 hover:bg-[var(--color-dim)] hover:text-black transition-colors">

              ПОЛНЫЙ РЕЙТИНГ
            </Link>
          </div>

          {/* Match History - moved to right panel */}
          <div className="bg-[var(--bg-card)] border border-[var(--color-dim)] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="arcade-text text-base text-[var(--color-dim)]">MATCH LOG</div>
              {matchHistory && matchHistory.length > 0 && (
                <button
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                  className="text-[var(--color-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer text-base"
                >
                  {historyExpanded ? '▼' : '▲'}
                </button>
              )}
            </div>

            {user ? (
              <div className="flex flex-col gap-4">
                {matchHistory && matchHistory.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`arcade-text text-[10px] flex-shrink-0 whitespace-nowrap ${matchHistory[0].result === 'ПОБЕДА' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                          [{matchHistory[0].result === 'ПОБЕДА' ? 'W' : 'L'}]
                        </span>
                        <span className="arcade-text text-[10px] text-[var(--color-dim)] flex-1 min-w-0 truncate">
                          VS {matchHistory[0].opponent.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}⚡🍄🏆🥇🥈🥉🌟🎭🧊🦊🐺👑✅❌⭐🚀🔥💎]/gu, '').trim()}
                        </span>
                      </div>
                      <span className="arcade-text text-xs text-[var(--color-dim)] flex-shrink-0 whitespace-nowrap">
                        {matchHistory[0].moves} ХОДОВ
                      </span>
                    </div>
                    {historyExpanded && matchHistory.slice(1).map((match, i) => (
                      <div key={match.id || i} className="flex items-center justify-between w-full gap-2 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`arcade-text text-[10px] flex-shrink-0 whitespace-nowrap ${match.result === 'ПОБЕДА' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                            [{match.result === 'ПОБЕДА' ? 'W' : 'L'}]
                          </span>
                          <span className="arcade-text text-[10px] text-[var(--color-dim)] flex-1 min-w-0 truncate">
                            VS {match.opponent.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}⚡🍄🏆🥇🥈🥉🌟🎭🧊🦊🐺👑✅❌⭐🚀🔥💎]/gu, '').trim()}
                          </span>
                        </div>
                        <span className="arcade-text text-xs text-[var(--color-dim)] flex-shrink-0 whitespace-nowrap">
                          {match.moves} ХОДОВ
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="arcade-text text-sm text-[var(--accent-yellow)] text-center py-4">СЫГРАЙ!</div>
                )}
              </div>
            ) : lastGame ? (
              <div className="flex flex-col gap-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="arcade-text text-sm">VS {lastGame.opponent.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}⚡🍄🏆🥇🥈🥉🌟🎭🧊🦊🐺👑✅❌⭐🚀🔥💎]/gu, '').trim()}</span>
                  <span className={lastGame.result === 'ПОБЕДА' ? 'arcade-text text-sm text-[var(--accent-green)]' : 'arcade-text text-sm text-[var(--accent-red)]'}>{lastGame.result}</span>
                </div>
              </div>
            ) : (
              <div className="arcade-text text-sm text-[var(--accent-yellow)] text-center py-4">СЫГРАЙ!</div>
            )}
          </div>
        </div>
        
      </div>
      </div>

      {/* ──── INFO MODAL ──── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowInfoModal(false)}>
          <div className="w-full max-w-md bg-[var(--bg-card)] pixel-border p-6 relative shadow-[6px_6px_0_#000]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInfoModal(false)} className="absolute top-2 right-4 text-xl arcade-text text-[var(--color-dim)] hover:text-[var(--accent-red)] cursor-pointer">X</button>
            <h2 className="arcade-text text-lg text-[var(--accent-yellow)] mb-6 mt-2 text-center">ГАЙД ИГРОКА</h2>
            
            <div className="font-mono text-xs text-[var(--color-light)] space-y-6">
              <div>
                <h3 className="text-[var(--accent-green)] mb-2 font-bold uppercase tracking-wider flex items-center gap-2"><PixelStar size={16} color="#4cc9f0" /> Фарм Опыта (XP)</h3>
                <ul className="list-disc pl-4 space-y-2 text-[var(--color-dim)]">
                  <li>Сыграть игру: <span className="text-white">+10 XP</span></li>
                  <li>Победа: <span className="text-white">+100 XP</span></li>
                  <li className="leading-relaxed">Играйте в режимах "PRO MAX" (VS AI) или "MULTIPLAYER" (VS PLAYER). Авторизуйтесь через Google, чтобы ваш опыт автоматически сохранялся в базе!</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[var(--accent-green)] mb-2 font-bold uppercase tracking-wider flex items-center gap-2"><PixelBrain size={16} /> Психотипы</h3>
                <p className="mb-3 text-[var(--color-dim)] leading-relaxed">Ваш стиль игры против ИИ автоматически анализируется тренером и определяет ваш архетип:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><LightningAvatar size={24} /> <span><span className="text-white font-bold">Молния:</span> быстрые ходы (&lt;3с) и жертвы шашек.</span></li>
                  <li className="flex items-center gap-2"><IceAvatar size={24} /> <span><span className="text-white font-bold">Хладнокровный:</span> долгие раздумья (&gt;8с) и игра без потерь.</span></li>
                  <li className="flex items-center gap-2"><FoxAvatar size={24} /> <span><span className="text-white font-bold">Лис:</span> множественные жертвы фигурами ради выгодной позиции.</span></li>
                  <li className="flex items-center gap-2"><WolfAvatar size={24} /> <span><span className="text-white font-bold">Волк:</span> агрессивная рубка (доля взятий &gt;70% от всех ходов).</span></li>
                  <li className="flex items-center gap-2"><KingAvatar size={24} /> <span><span className="text-white font-bold">Король:</span> сбалансированная расчетливая игра.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
