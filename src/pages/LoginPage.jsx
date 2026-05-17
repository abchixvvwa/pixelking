import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/supabase';
import { PixelCorner } from '../components/icons/PixelIcons';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-root">
      <button onClick={() => navigate(-1)} className="arcade-text back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← НАЗАД</button>
      
      <div className="login-box" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem' }}>
        <div className="section-corner tl"><PixelCorner position="top-left" color="var(--accent-yellow)" /></div>
        <div className="section-corner tr"><PixelCorner position="top-right" color="var(--accent-yellow)" /></div>
        
        <h2 className="arcade-text login-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>АВТОРИЗАЦИЯ</h2>
        
        <p className="font-sans text-sm text-[var(--color-dim)] text-center mb-8">
          Войдите через Google, чтобы сохранять прогресс, зарабатывать опыт и подниматься в рейтинге.
        </p>

        <button onClick={signInWithGoogle} className="login-mega-btn arcade-text w-full flex justify-center items-center gap-3">
          ВОЙТИ ЧЕРЕЗ GOOGLE
        </button>
        
        <div className="section-corner bl"><PixelCorner position="bottom-left" color="var(--accent-yellow)" /></div>
        <div className="section-corner br"><PixelCorner position="bottom-right" color="var(--accent-yellow)" /></div>
      </div>
    </div>
  );
}
