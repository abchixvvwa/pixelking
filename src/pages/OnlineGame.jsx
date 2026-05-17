import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPlayerSessionId } from '../lib/onlineRoom';
import useGameStore from '../store/gameStore';
import Board from '../components/Board';
import GameStatus from '../components/GameStatus';
import GameOverScreen from '../components/GameOverScreen';

function sortedPresenceList(channel) {
  const state = channel.presenceState();
  const list = [];
  Object.keys(state).forEach((key) => {
    (state[key] || []).forEach((meta) => {
      list.push({ key, joined_at: meta.joined_at ?? 0 });
    });
  });
  return list.sort((a, b) => a.joined_at - b.joined_at);
}

export default function OnlineGame() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const screen = useGameStore((s) => s.screen);
  const onlineRole = useGameStore((s) => s.onlineRole);

  const [phase, setPhase] = useState('connecting');
  const [copyNotice, setCopyNotice] = useState('');
  const [playerCount, setPlayerCount] = useState(0);

  const playerIdRef = useRef(getPlayerSessionId());
  const gameStartedRef = useRef(false);
  const channelRef = useRef(null);

  const tryStartMatch = useCallback((channel, myPlayerId) => {
    const players = sortedPresenceList(channel);
    setPlayerCount(players.length);

    const myIndex = players.findIndex((p) => p.key === myPlayerId);

    if (players.length < 2) {
      setPhase('waiting');
      if (myIndex === 0) {
        useGameStore.getState().onlineRole !== 'white' &&
          useGameStore.setState({ onlineRole: 'white' });
      }
      return;
    }

    const myRole = myIndex === 0 ? 'white' : 'black';

    if (myRole === 'white') {
      if (!gameStartedRef.current) {
        gameStartedRef.current = true;
        useGameStore.getState().startOnlineGame('white');
        channel.send({
          type: 'broadcast',
          event: 'game_start',
          payload: useGameStore.getState().getOnlineSnapshot(),
        });
      }
      setPhase('playing');
    } else {
      useGameStore.setState({ onlineRole: 'black' });
      if (gameStartedRef.current) setPhase('playing');
    }
  }, []);

  useEffect(() => {
    if (!roomId) {
      navigate('/play');
      return;
    }

    const playerId = playerIdRef.current;
    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: playerId },
      },
    });

    channel
      .on('broadcast', { event: 'game_move' }, ({ payload }) => {
        useGameStore.getState().applyOnlineState(payload);
      })
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        if (gameStartedRef.current) return;
        gameStartedRef.current = true;
        useGameStore.getState().startOnlineGame('black');
        useGameStore.getState().applyOnlineState(payload);
        setPhase('playing');
      })
      .on('presence', { event: 'sync' }, () => {
        tryStartMatch(channel, playerId);
      })
      .on('presence', { event: 'join' }, () => {
        tryStartMatch(channel, playerId);
      })
      .on('presence', { event: 'leave' }, () => {
        tryStartMatch(channel, playerId);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ joined_at: Date.now(), player_id: playerId });
        setPhase('waiting');
      }
    });

    channelRef.current = channel;
    useGameStore.getState().setOnlineChannel(channel);

    return () => {
      gameStartedRef.current = false;
      useGameStore.getState().clearOnlineSession();
      channelRef.current = null;
    };
  }, [roomId, navigate, tryStartMatch]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyNotice('Ссылка скопирована!');
      setTimeout(() => setCopyNotice(''), 2500);
    } catch {
      setCopyNotice('Не удалось скопировать');
      setTimeout(() => setCopyNotice(''), 2500);
    }
  };

  const handleQuit = () => {
    useGameStore.getState().clearOnlineSession();
    navigate('/play');
  };

  if (screen === 'gameover') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <GameOverScreen />
      </div>
    );
  }

  if (phase === 'playing') {
    const roleLabel = onlineRole === 'white' ? 'БЕЛЫЕ' : 'ЧЁРНЫЕ';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
        <header className="mb-4 text-center w-full max-w-[calc(min(95vw,600px))] mx-auto">
          <p className="arcade-text text-[10px] text-[var(--color-dim)] mb-1">
            КОМНАТА: {roomId?.toUpperCase()}
          </p>
          <h1 className="text-xl md:text-2xl arcade-text text-[var(--accent-yellow)]" style={{ textShadow: '3px 3px 0 #000' }}>
            ONLINE · ВЫ — {roleLabel}
          </h1>
        </header>
        <Board />
        <GameStatus />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md bg-[var(--bg-card)] pixel-border p-8 text-center" style={{ boxShadow: '6px 6px 0 #000' }}>
        <p className="arcade-text text-[8px] text-[var(--color-dim)] mb-4 tracking-widest">
          КОМНАТА {roomId?.toUpperCase()}
        </p>

        {phase === 'connecting' ? (
          <p className="arcade-text text-sm text-[var(--color-dim)] animate-pulse mb-8">
            ПОДКЛЮЧЕНИЕ...
          </p>
        ) : (
          <>
            <h1
              className="arcade-text text-base md:text-lg text-[var(--accent-yellow)] mb-6 leading-relaxed animate-pulse"
              style={{ textShadow: '3px 3px 0 #000' }}
            >
              ОЖИДАНИЕ
              <br />
              СОПЕРНИКА...
            </h1>
            <p className="arcade-text text-[9px] text-[var(--color-dim)] mb-6">
              ВЫ — БЕЛЫЕ · ХОД ПЕРВЫМ
              <br />
              ИГРОКОВ: {playerCount}/2
            </p>
          </>
        )}

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full pixel-button py-4 arcade-text text-xs !bg-[var(--accent-yellow)] !text-black !border-black mb-4"
        >
          [ СКОПИРОВАТЬ ССЫЛКУ-ИНВАЙТ ]
        </button>

        {copyNotice && (
          <p className="arcade-text text-[10px] text-[var(--accent-green)] mb-4">{copyNotice}</p>
        )}

        <button
          type="button"
          onClick={handleQuit}
          className="arcade-text text-[10px] text-[var(--color-dim)] hover:text-[var(--accent-red)] cursor-pointer"
        >
          &lt; НАЗАД В МЕНЮ
        </button>
      </div>
    </div>
  );
}
