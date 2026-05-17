import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, signInWithGoogle } from '../lib/supabase';
import { PixelCorner } from '../components/icons/PixelIcons';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setShowOTP(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/play');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      navigate('/play');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="login-root">
        <div className="login-box">
          <div className="section-corner tl"><PixelCorner position="top-left" color="var(--accent-yellow)" /></div>
          <div className="section-corner tr"><PixelCorner position="top-right" color="var(--accent-yellow)" /></div>
          <h2 className="arcade-text login-title" style={{ fontSize: '1rem' }}>КОД ПОДТВЕРЖДЕНИЯ</h2>
          <p className="text-[10px] text-[var(--color-dim)] font-sans mb-4">На вашу почту отправлен код. Введите его ниже:</p>
          <form onSubmit={handleVerifyOTP} className="login-form">
            <input 
              type="text" 
              placeholder="КОД ИЗ ПИСЬМА" 
              className="pixel-input arcade-text text-center" 
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
            {error && <div className="login-error font-sans text-sm">{error}</div>}
            <button type="submit" className="login-mega-btn arcade-text" disabled={loading}>
              {loading ? 'ПРОВЕРКА...' : 'ПОДТВЕРДИТЬ'}
            </button>
          </form>
          <div className="section-corner bl"><PixelCorner position="bottom-left" color="var(--accent-yellow)" /></div>
          <div className="section-corner br"><PixelCorner position="bottom-right" color="var(--accent-yellow)" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-root">
      <button onClick={() => navigate(-1)} className="arcade-text back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← НАЗАД</button>
      
      <div className="login-box">
        <div className="section-corner tl"><PixelCorner position="top-left" color="var(--accent-yellow)" /></div>
        <div className="section-corner tr"><PixelCorner position="top-right" color="var(--accent-yellow)" /></div>
        
        <h2 className="arcade-text login-title">{isRegister ? 'РЕГИСТРАЦИЯ' : 'ВХОД'}</h2>
        
        <form onSubmit={handleAuth} className="login-form">
          <input 
            type="email" 
            placeholder="EMAIL" 
            className="pixel-input arcade-text" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="ПАРОЛЬ" 
            className="pixel-input arcade-text" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {error && <div className="login-error font-sans text-sm">{error}</div>}
          
          <button type="submit" className="login-mega-btn arcade-text" disabled={loading}>
            {loading ? 'ЗАГРУЗКА...' : (isRegister ? 'СОЗДАТЬ' : 'ВОЙТИ')}
          </button>
        </form>

        <div className="login-divider">
          <span className="arcade-text">ИЛИ</span>
        </div>

        <button onClick={signInWithGoogle} className="pixel-button py-4 px-6 w-full text-xs flex justify-center">
          ВОЙТИ ЧЕРЕЗ GOOGLE
        </button>

        <div className="login-footer">
          {isRegister ? (
             <button onClick={() => setIsRegister(false)} className="toggle-btn arcade-text">УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ</button>
          ) : (
             <button onClick={() => setIsRegister(true)} className="toggle-btn arcade-text">НЕТ АККАУНТА? СОЗДАТЬ</button>
          )}
        </div>
        
        <div className="section-corner bl"><PixelCorner position="bottom-left" color="var(--accent-yellow)" /></div>
        <div className="section-corner br"><PixelCorner position="bottom-right" color="var(--accent-yellow)" /></div>
      </div>
    </div>
  );
}
