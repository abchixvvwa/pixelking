import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { LightningAvatar, FoxAvatar, WolfAvatar, IceAvatar, KingAvatar, PixelTrophy } from './icons/PixelIcons';

const EMOJI_STRIP_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}⚡🍄🏆🥇🥈🥉🌟🎭🧊🦊🐺👑✅❌⭐🚀🔥💎]/gu;

const stripEmojis = (str) => (str || '').replace(EMOJI_STRIP_RE, '').trim();

const getArchetypeInfo = (archetypeStr) => {
  const s = stripEmojis(archetypeStr).toLowerCase();
  if (s.includes('молния') || s.includes('lightning')) return { label: 'МОЛНИЯ', Avatar: LightningAvatar };
  if (s.includes('хладнокровный') || s.includes('ice')) return { label: 'ХЛАДНОКРОВНЫЙ', Avatar: IceAvatar };
  if (s.includes('лис') || s.includes('fox')) return { label: 'ЛИС', Avatar: FoxAvatar };
  if (s.includes('король') || s.includes('king')) return { label: 'КОРОЛЬ', Avatar: KingAvatar };
  if (s.includes('волк') || s.includes('wolf')) return { label: 'ВОЛК', Avatar: WolfAvatar };
  return { label: 'ВОЛК', Avatar: WolfAvatar };
};

const getAvatarComponent = (archetypeStr) => getArchetypeInfo(archetypeStr).Avatar;

function PlayerIdDivider() {
  return (
    <div className="player-id-divider w-full" aria-hidden>
      <span className="player-id-divider-line" />
      <span className="player-id-divider-dot" />
      <span className="player-id-divider-line" />
    </div>
  );
}



export default function Leaderboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityPlayers, setCityPlayers] = useState([]);

  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setCityPlayers([]);
    const { data } = await supabase.from('leaderboard').select('*').eq('city', city).order('wins', { ascending: false });
    if (data) setCityPlayers(data);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(100);

    if (!error && data) {
      setPlayers(data);
    } else {
      console.error('Ошибка загрузки лидерборда', error);
      setPlayers([]);
    }
    setLoading(false);
  };

  const filteredPlayers = players.filter((p) =>
    (p.username || p.name || 'UNKNOWN').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredPlayers.slice(0, 3);
  const others = filteredPlayers.slice(3);

  // Группировка по городам
  const cityStats = useMemo(() => {
    const map = new Map();
    players.forEach(p => {
      const city = p.city || 'Неизвестно';
      if (!map.has(city)) {
        map.set(city, { city, players: 0, wins: 0, total_games: 0 });
      }
      const stat = map.get(city);
      stat.players++;
      stat.wins += p.wins;
      stat.total_games += p.total_games;
    });
    const arr = Array.from(map.values()).map(s => ({
      ...s,
      winRate: s.total_games > 0 ? (s.wins / s.total_games) * 100 : 0
    }));
    return arr.sort((a, b) => b.winRate - a.winRate);
  }, [players]);

  const filteredCities = cityStats.filter(c => c.city.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="mb-8 text-center relative w-full max-w-4xl mt-4">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 arcade-text text-[10px] md:text-xs text-[var(--color-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer"
        >
          &lt; BACK
        </button>

        <h1 className="text-2xl md:text-4xl arcade-text text-[var(--color-light)] mb-2" style={{ textShadow: '4px 4px 0 #000' }}>
          HIGH SCORES
        </h1>
        <p className="font-mono text-xs text-[var(--color-dim)]">
          GLOBAL RANKINGS
        </p>
      </header>

      <div className="w-full max-w-4xl animate-fade-in">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-[var(--bg-card)] pixel-border p-1">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-6 py-2 arcade-text text-[10px] transition-all ${
                activeTab === 'global' ? 'bg-[var(--accent-yellow)] text-black' : 'text-[var(--color-dim)] hover:text-[var(--color-light)]'
              }`}
            >
              GLOBAL
            </button>
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-6 py-2 arcade-text text-[10px] transition-all ${
                activeTab === 'cities' ? 'bg-[var(--accent-yellow)] text-black' : 'text-[var(--color-dim)] hover:text-[var(--color-light)]'
              }`}
            >
              CITIES
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder={activeTab === 'global' ? "SEARCH PLAYER..." : "SEARCH CITY..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-card)] pixel-border text-xs font-mono text-white focus:outline-none focus:pixel-border-yellow transition-all placeholder-[var(--color-dim)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : activeTab === 'global' ? (
          <>
            {/* Top 3 Cards */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {top3.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className="relative flex flex-col items-center p-6 bg-[var(--bg-card)] pixel-border pixel-shadow cursor-pointer hover:bg-[#1e3a8a] group transition-colors"
                  >
                    <div className="absolute top-2 right-2 text-2xl animate-blink">
                      {i === 0 ? <PixelTrophy size={20} /> : ''}
                    </div>
                    <div className="text-3xl mb-2 arcade-text text-[var(--accent-yellow)]">#{i + 1}</div>
                    <div className="arcade-text text-[10px] md:text-xs text-[var(--color-light)] mb-2 text-center truncate w-full group-hover:text-[var(--accent-yellow)]" style={{ minWidth: 0 }}>{p.username || p.name || 'UNKNOWN'}</div>
                    <div className="arcade-text text-[10px] text-[var(--color-dim)] mb-4">{p.city || 'Неизвестно'}</div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="arcade-text text-[10px] text-[var(--color-dim)] mb-1">WINS</span>
                        <span className="arcade-text text-[10px] text-[var(--color-light)] whitespace-nowrap">{p.wins}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="arcade-text text-[10px] text-[var(--color-dim)] mb-1">RATE</span>
                        <span className="arcade-text text-[10px] text-[var(--accent-green)] whitespace-nowrap">{p.total_games > 0 ? ((p.wins / p.total_games) * 100).toFixed(1) : 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Others Table */}
            {others.length > 0 && (
              <div className="bg-[var(--bg-card)] pixel-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="arcade-text text-[10px] text-[var(--color-dim)] border-b-2 border-[var(--bg-primary)]">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">PLAYER</th>
                      <th className="p-3 hidden sm:table-cell">CITY</th>
                      <th className="p-3 text-center">WINS</th>
                      <th className="p-3 text-center">RATE</th>
                      <th className="p-3 hidden md:table-cell">STYLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((p, i) => (
                      <tr key={p.id} onClick={() => setSelectedPlayer(p)} className="cursor-pointer hover:bg-[#1e3a8a] transition-colors border-b border-[var(--bg-primary)] arcade-text text-[10px] group flex sm:table-row flex-wrap sm:flex-nowrap items-center justify-between">
                        <td className="p-3 text-center text-[var(--color-dim)] group-hover:text-white whitespace-nowrap">{i + 4}</td>
                        <td className="p-3 text-[var(--color-light)] group-hover:text-[var(--accent-yellow)] truncate max-w-[120px] sm:max-w-none">{(p.username || p.name || 'UNKNOWN').slice(0,10)}</td>
                        <td className="p-3 text-[var(--color-dim)] hidden sm:table-cell group-hover:text-white truncate">{(p.city || 'Неизвестно').slice(0,10)}</td>
                        <td className="p-3 text-center text-[var(--color-light)] group-hover:text-white whitespace-nowrap">{p.wins}</td>
                        <td className="p-3 text-center text-[var(--accent-green)] group-hover:text-[#4ade80] whitespace-nowrap">{p.total_games > 0 ? ((p.wins / p.total_games) * 100).toFixed(1) : 0}%</td>
                        <td className="p-3 text-[var(--color-dim)] hidden md:table-cell group-hover:text-white whitespace-nowrap">{getArchetypeInfo(p.best_archetype).label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredPlayers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Ничего не найдено
              </div>
            )}
          </>
        ) : (
          <div className="bg-[var(--bg-card)] pixel-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="arcade-text text-[10px] text-[var(--color-dim)] border-b-2 border-[var(--bg-primary)]">
                  <th className="p-3 w-16 text-center">RANK</th>
                  <th className="p-3">CITY</th>
                  <th className="p-3 text-center">PLAYERS</th>
                  <th className="p-3 text-center">WINS</th>
                  <th className="p-3 text-center">RATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((c, i) => (
                  <tr key={c.city} onClick={() => handleCityClick(c.city)} className="cursor-pointer hover:bg-[#1e3a8a] transition-colors border-b border-[var(--bg-primary)] arcade-text text-[10px] group flex sm:table-row flex-wrap sm:flex-nowrap items-center justify-between">
                    <td className="p-3 text-center text-[var(--color-dim)] group-hover:text-white whitespace-nowrap">#{i + 1}</td>
                    <td className="p-3 text-[var(--color-light)] group-hover:text-[var(--accent-yellow)] truncate max-w-[150px] sm:max-w-none">{c.city.slice(0,10)}</td>
                    <td className="p-3 text-center text-[var(--color-dim)] group-hover:text-white whitespace-nowrap">{c.players}</td>
                    <td className="p-3 text-center text-[var(--color-light)] group-hover:text-white whitespace-nowrap">{c.wins}</td>
                    <td className="p-3 text-center text-[var(--accent-green)] group-hover:text-[#4ade80] whitespace-nowrap">{c.winRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Ничего не найдено
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──── Modals ──── */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPlayer(null)}>
          <div className="player-id-card w-full max-w-sm bg-[var(--bg-card)] pixel-border p-6 relative flex flex-col items-center" style={{ boxShadow: '6px 6px 0 #000' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-2">
              <span className="arcade-text text-[8px] text-[var(--color-dim)] tracking-widest">PLAYER ID CARD</span>
              <button type="button" onClick={() => setSelectedPlayer(null)} className="player-id-close arcade-text" aria-label="Закрыть">X</button>
            </div>
            <div className="player-id-avatar-frame mb-5">
              {(() => {
                const Avatar = getAvatarComponent(selectedPlayer.best_archetype);
                return <Avatar size={96} />;
              })()}
            </div>
            <h2 className="player-id-name arcade-text text-[var(--accent-yellow)] text-center truncate w-full px-4 mb-1" style={{ minWidth: 0 }}>
              {(selectedPlayer.username || selectedPlayer.name || 'UNKNOWN').toUpperCase()}
            </h2>
            <PlayerIdDivider />
            <div className="w-full px-2 py-4 flex flex-col items-center gap-2 mb-2">
              <span className="arcade-text text-[8px] text-[var(--color-dim)]">CITY</span>
              <span className="player-id-city arcade-text text-[var(--color-light)] whitespace-nowrap flex-shrink-0 max-w-full truncate">
                {(selectedPlayer.city || 'НЕИЗВЕСТНО').toUpperCase()}
              </span>
            </div>
            <PlayerIdDivider />
            <div className="w-full px-2 py-5 bg-[var(--bg-primary)] pixel-border mb-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="arcade-text text-[8px] text-[var(--color-dim)]">WINS</span>
                  <span className="player-id-stat arcade-text text-[var(--color-light)] whitespace-nowrap flex-shrink-0">
                    {String(selectedPlayer.wins ?? 0).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3 py-2 border-x-2 border-[var(--bg-card)]">
                  <span className="arcade-text text-[8px] text-[var(--color-dim)]">LOSSES</span>
                  <span className="player-id-stat arcade-text text-[var(--color-light)] whitespace-nowrap flex-shrink-0">
                    {String(selectedPlayer.losses ?? 0).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="arcade-text text-[8px] text-[var(--color-dim)]">RATE</span>
                  <span className="player-id-stat arcade-text text-[var(--accent-green)] whitespace-nowrap flex-shrink-0">
                    {String(
                      selectedPlayer.total_games > 0
                        ? Math.round((selectedPlayer.wins / selectedPlayer.total_games) * 100)
                        : 0
                    ).padStart(2, '0')}%
                  </span>
                </div>
              </div>
            </div>
            <PlayerIdDivider />
            <div className="w-full px-2 py-4 flex flex-col items-center gap-3">
              <span className="arcade-text text-[8px] text-[var(--color-dim)]">СТИЛЬ ИГРЫ</span>
              <div className="flex items-center gap-3">
                {(() => {
                  const archetype = getArchetypeInfo(selectedPlayer.best_archetype);
                  const StyleAvatar = archetype.Avatar;
                  return (
                    <>
                      <div className="player-id-style-icon">
                        <StyleAvatar size={28} />
                      </div>
                      <span className="player-id-style-label arcade-text text-[var(--accent-yellow)]">
                        {archetype.label}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCity && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCity(null)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[var(--bg-card)] pixel-border p-6 relative flex flex-col items-center" style={{ boxShadow: '6px 6px 0 #000' }} onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-between items-center mb-6 mt-2">
              <h2 className="arcade-text text-sm text-[var(--accent-yellow)]">ТОП ИГРОКОВ: {selectedCity}</h2>
              <button onClick={() => setSelectedCity(null)} className="text-xl arcade-text text-[var(--color-dim)] hover:text-[var(--accent-red)] cursor-pointer">X</button>
            </div>
            
            {cityPlayers.length === 0 ? (
              <div className="text-[var(--color-dim)] animate-pulse font-mono py-8">ЗАГРУЗКА...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="arcade-text text-[10px] text-[var(--color-dim)] border-b-2 border-[var(--bg-primary)]">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">PLAYER</th>
                    <th className="p-3 text-center">WINS</th>
                    <th className="p-3 text-center">RATE</th>
                  </tr>
                </thead>
                <tbody>
                  {cityPlayers.map((p, i) => (
                    <tr key={p.id} onClick={() => setSelectedPlayer(p)} className="cursor-pointer hover:bg-[#1e3a8a] transition-colors border-b border-[var(--bg-primary)] arcade-text text-[10px] group flex sm:table-row flex-wrap sm:flex-nowrap items-center justify-between">
                      <td className="p-3 text-center text-[var(--color-dim)] group-hover:text-white whitespace-nowrap">{i + 1}</td>
                      <td className="p-3 text-[var(--color-light)] group-hover:text-[var(--accent-yellow)] truncate max-w-[150px] sm:max-w-none">{(p.username || p.name || 'UNKNOWN').slice(0,10)}</td>
                      <td className="p-3 text-center text-[var(--color-light)] group-hover:text-white whitespace-nowrap">{p.wins}</td>
                      <td className="p-3 text-center text-[var(--accent-green)] group-hover:text-[#4ade80] whitespace-nowrap">{p.total_games > 0 ? ((p.wins / p.total_games) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
