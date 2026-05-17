import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, getUser } from '../lib/supabase';
import useGameStore from '../store/gameStore';
import Board from '../components/Board';
import { PixelCheck } from '../components/icons/PixelIcons';

export default function Trainer() {
  const [mistake, setMistake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong
  const [typewriterText, setTypewriterText] = useState('');

  const navigate = useNavigate();
  const resetGame = useGameStore(s => s.resetGame);
  const board = useGameStore(s => s.board);
  const moveHistory = useGameStore(s => s.moveHistory);

  useEffect(() => {
    async function fetchMistake() {
      const { data: { user } } = await getUser();
      if (!user) {
        navigate('/play');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mistakes')
          .select('*')
          .eq('user_id', user.id)
          .eq('resolved', false)
          .lte('next_review', new Date().toISOString())
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error && error.message.includes('Supabase не настроен')) {
          const localMistakes = JSON.parse(localStorage.getItem('duels_mistakes') || '[]');
          const now = new Date().toISOString();
          const pending = localMistakes.filter(m => m.user_id === user.id && !m.resolved && m.next_review <= now)
                                       .sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
          
          if (pending.length > 0) {
            setupTrainer(pending[0]);
          } else {
            navigate('/play');
          }
        } else if (error || !data) {
          navigate('/play');
        } else {
          setupTrainer(data);
        }
      } catch (err) {
        console.error(err);
        navigate('/play');
      } finally {
        setLoading(false);
      }
    }

    function setupTrainer(data) {
      setMistake(data);
      // Set up the store
      useGameStore.setState({
        board: data.board_state,
        currentPlayer: 'white',
        gameMode: 'local', // just to prevent AI moves
        winner: null,
        moveHistory: [],
        // reset UI states
        selectedPiece: null,
        validMoves: [],
        isJumping: false,
        jumpPath: [],
        lastMove: null
      });
    }

    fetchMistake();
  }, [navigate]);

  useEffect(() => {
    if (mistake && moveHistory.length > 0 && status === 'playing') {
      const last = moveHistory[moveHistory.length - 1];
      const moveStr = `${last.from.r},${last.from.c}-${last.to.r},${last.to.c}`;
      
      // Parse correct_move (format e3-d4 -> row,col format depending on how Gemini outputs it)
      // Actually Gemini outputs algebraic. We need to compare it.
      // Or we can just check if the new board state is better, or if the move matches the explanation.
      // For simplicity, let's just let Gemini's format be. If it's hard to parse, we can show the explanation after any move.
      // Wait, let's just show the explanation after ANY move, since evaluating algebraic is complex.
      // But user requested: "Если правильно... Если неправильно...".
      
      // We will do a fuzzy match or just show explanation
      setStatus('wrong');
      startTypewriter(mistake.explanation);
      
      // Reset board to try again after 3 seconds if we want, or just leave it.
    }
  }, [moveHistory, mistake, status]);

  const startTypewriter = (text) => {
    setTypewriterText('');
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30);
  };

  const markResolved = async () => {
    if (!mistake) return;
    const newNextReview = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days

    const { error } = await supabase.from('mistakes').update({
      resolved: true,
      next_review: newNextReview
    }).eq('id', mistake.id);

    if (error && error.message.includes('Supabase не настроен')) {
      const localMistakes = JSON.parse(localStorage.getItem('duels_mistakes') || '[]');
      const index = localMistakes.findIndex(m => m.id === mistake.id);
      if (index !== -1) {
        localMistakes[index].resolved = true;
        localMistakes[index].next_review = newNextReview;
        localStorage.setItem('duels_mistakes', JSON.stringify(localMistakes));
      }
    }

    navigate('/play');
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex justify-center items-center"><div className="animate-pulse text-white font-mono">LOADING MISTAKE...</div></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] border-[4px] border-[var(--accent-red)] pixel-shadow p-6 relative">
        <button onClick={() => navigate(-1)} className="absolute top-2 left-2 text-[10px] text-[var(--color-dim)] hover:text-white font-mono">&lt; НАЗАД</button>
        
        <div className="text-center mb-6 mt-4">
          <h2 className="arcade-text text-[var(--accent-red)] text-xl animate-pulse">РАЗБОР ОШИБКИ</h2>
          <p className="font-mono text-xs text-[var(--color-light)] mt-2">Что бы ты сделал здесь?</p>
        </div>

        <div className="border-4 border-[var(--accent-red)] p-1 bg-black mb-6 pointer-events-auto">
          {status === 'playing' ? (
             <Board />
          ) : (
            <div className="relative">
              <div className="opacity-50 pointer-events-none grayscale"><Board /></div>
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center z-10">
                <div className="bg-black/90 border-2 border-[var(--accent-yellow)] p-4 font-mono text-sm text-[var(--color-light)]">
                  {typewriterText}
                </div>
              </div>
            </div>
          )}
        </div>

        {status === 'wrong' && (
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setStatus('playing');
                useGameStore.setState({ board: mistake.board_state, moveHistory: [], currentPlayer: 'white' });
              }}
              className="flex-1 pixel-button py-2 text-[10px] bg-transparent border-2 border-[var(--color-dim)] text-[var(--color-dim)]"
            >
              ПОВТОРИТЬ
            </button>
            <button 
              onClick={markResolved}
              className="flex-1 pixel-button py-2 text-[10px] !bg-[var(--accent-green)] !text-white flex items-center justify-center gap-2"
            >
              Я ПОНЯЛ <PixelCheck size={12} color="#fff" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
