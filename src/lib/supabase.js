import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Строгий дебаг: выводим в консоль статус ключей (без засвета самого ключа)
console.log("Supabase Init Check:", { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseKey,
  urlValue: supabaseUrl 
});

// Если ключей нет — крашим инициализацию с понятной ошибкой
if (!supabaseUrl || !supabaseKey) {
  console.error("КРИТИЧЕСКАЯ ОШИБКА: Ключи Supabase не найдены! Убедитесь, что файл .env находится в корне проекта (рядом с package.json) и сервер Vite был перезапущен.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/play' }
  });

export const signOut = () => {
  localStorage.removeItem('duels_last_game');
  localStorage.removeItem('duels_username');
  localStorage.removeItem('duels_player_name');
  return supabase.auth.signOut();
};

export const getUser = () => supabase.auth.getUser();
