# PIXELKING 👑

**8-битные русские шашки нового поколения.** Играй против AI, получай разбор партий, соревнуйся в онлайне и открывай премиум-возможности через Stripe.

---

## 🚀 Стек технологий

| Слой | Технология |
|---|---|
| Frontend | React 18 + Vite |
| Стили | Tailwind CSS v4 |
| State Management | Zustand |
| Auth + Realtime | Supabase |
| AI Coach | Groq API (LLaMA) |
| Платежи | Stripe Checkout |
| Деплой | Vercel (SPA + Serverless Functions) |

---

## 📁 Структура проекта

```
pixelking/
├── api/                          # Vercel Serverless Functions (бэкенд)
│   ├── create-checkout-session.js  # Создание Stripe Checkout сессии
│   └── stripe-webhook.js           # Обработка вебхуков Stripe
├── public/                       # Статические ассеты
├── src/
│   ├── components/               # UI-компоненты
│   │   ├── Board.jsx             # Игровая доска (с координатами a-h / 1-8)
│   │   ├── DailyBoard.jsx        # Доска для ежедневных квестов
│   │   ├── GameOverScreen.jsx    # Экран конца игры + AI-анализ
│   │   ├── AICopilot.jsx         # Ассистент AI во время игры
│   │   ├── PaywallModal.jsx      # Paywall для PRO-фич
│   │   ├── Shop.jsx              # Магазин скинов
│   │   ├── Leaderboard.jsx       # Таблица лидеров
│   │   └── icons/PixelIcons.jsx  # Пиксельные SVG-иконки
│   ├── pages/
│   │   ├── LandingPage.jsx       # Главная страница (лендинг)
│   │   ├── Dashboard.jsx         # Главный дашборд игрока
│   │   ├── Plans.jsx             # Страница тарифов + Stripe
│   │   ├── LoginPage.jsx         # Авторизация через Google
│   │   ├── OnlineGame.jsx        # Онлайн-мультиплеер (Supabase Realtime)
│   │   └── Trainer.jsx           # Тренер ошибок
│   ├── store/
│   │   ├── gameStore.js          # Zustand: центральный стор игры
│   │   └── dailyStore.js         # Zustand: стор ежедневных квестов
│   ├── lib/
│   │   ├── supabase.js           # Клиент Supabase + signInWithGoogle
│   │   └── onlineRoom.js         # Генератор roomId для мультиплеера
│   ├── logic/                    # Игровая логика (ходы, AI, анализ)
│   ├── data/                     # Скины, квесты, константы
│   └── App.jsx                   # Роутер (React Router v6)
├── vercel.json                   # Конфиг деплоя (SPA rewrites + API)
├── index.html                    # Точка входа
└── .env                          # Локальные переменные окружения
```

---

## ⚙️ Переменные окружения

### Фронтенд (`.env` — с префиксом `VITE_`)

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_GROQ_API_KEY=gsk_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRO_PRICE_ID=price_...        # ID тарифа PRO из Stripe Dashboard
VITE_STRIPE_PRO_MAX_PRICE_ID=price_...    # ID тарифа PRO MAX из Stripe Dashboard
```

### Бэкенд (Vercel Dashboard → Settings → Environment Variables)

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Service Role Key (НЕ anon key!)
SITE_URL=https://твой-домен.vercel.app    # Боевой домен для Stripe редиректов
```

> ⚠️ **Важно:** `SUPABASE_SERVICE_ROLE_KEY` и `STRIPE_SECRET_KEY` — серверные секреты. Никогда не добавляй их с префиксом `VITE_`, они не должны попасть на фронтенд.

---

## 🏃 Локальная разработка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск с Vercel Dev (рекомендуется — поднимает и фронт, и API-функции)

```bash
npm install -g vercel
vercel link        # Привязывает проект к Vercel
vercel env pull .env.development.local   # Скачивает переменные из Vercel
vercel dev         # Запуск на http://localhost:3000
```

### 3. Альтернатива — только фронтенд (без API-функций)

```bash
npm run dev        # Запуск Vite на http://localhost:5173
```

---

## 💳 Настройка Stripe

### 1. Создай Products и Prices в Stripe Dashboard
- Создай два продукта: **PRO ($4.99/мес)** и **PRO MAX ($9.99/мес)**
- Скопируй `price_...` ID каждого и добавь в `.env` как `VITE_STRIPE_PRO_PRICE_ID` и `VITE_STRIPE_PRO_MAX_PRICE_ID`

### 2. Настрой вебхук в Stripe Dashboard
- **Webhook URL:** `https://твой-домен.vercel.app/api/stripe-webhook`
- **События для прослушивания:** `checkout.session.completed`
- Скопируй `whsec_...` секрет в переменную `STRIPE_WEBHOOK_SECRET` на Vercel

### 3. Добавь SITE_URL в Vercel
- В **Vercel Dashboard → Settings → Environment Variables** добавь:
  ```
  SITE_URL = https://твой-домен.vercel.app
  ```
- Это гарантирует, что после оплаты Stripe редиректит на боевой домен, а не на localhost

### Флоу оплаты
```
Пользователь нажимает кнопку "ПОПРОБОВАТЬ 7 ДНЕЙ"
  → Plans.jsx вызывает /api/create-checkout-session
  → Vercel Function создает Stripe Session
  → Пользователь оплачивает на странице Stripe
  → Stripe отправляет вебхук на /api/stripe-webhook
  → Вебхук обновляет subscriptionTier в Supabase
  → Пользователь возвращается на /play?session_id=...&tier=pro
  → Dashboard читает параметры URL и активирует тариф мгновенно
```

---

## 🌐 Онлайн-мультиплеер

Мультиплеер реализован на **Supabase Realtime Channels** (без отдельного WebSocket-сервера).

### Как это работает
1. Первый игрок создаёт комнату → получает уникальный `roomId` (6 символов, напр. `TQQ6XJ`)
2. Ссылка для инвайта: `https://твой-домен.vercel.app/play/online/TQQ6XJ`
3. Оба игрока подключаются к Supabase Channel `room_TQQ6XJ`
4. Ходы транслируются через broadcast-события в реальном времени

### Важно для деплоя
Файл `vercel.json` в корне проекта обеспечивает корректную работу SPA-роутинга:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Без него прямые переходы по ссылкам мультиплеера (`/play/online/TQQ6XJ`) выдают **404 на Vercel**.

---

## 🔐 Авторизация

Реализована только через **Google OAuth** (Supabase Auth).

### Настройка в Supabase Dashboard
1. **Authentication → Providers → Google** — включи и добавь `Client ID` и `Client Secret` от Google Cloud Console
2. **Authentication → URL Configuration → Redirect URLs** — добавь:
   - `http://localhost:3000` (для локальной разработки)
   - `http://localhost:5173` (для Vite)
   - `https://твой-домен.vercel.app` (боевой домен)

### Динамический редирект
`signInWithGoogle()` в `src/lib/supabase.js` использует `window.location.origin` для автоматического определения домена — работает на любом окружении без изменений кода.

---

## 🗄️ База данных Supabase

| Таблица | Назначение |
|---|---|
| `profiles` | Профили игроков (lvl, xp, subscriptionTier, psychotype) |
| `match_history` | История партий |
| `mistakes` | Ошибки для Mistake Trainer |
| `leaderboard` | Таблица лидеров |

---

## 🎨 Дизайн-система

Проект использует **8-bit аркадный** брутализм:
- **Шрифт:** `Press Start 2P` (Google Fonts)
- **Границы:** `4px solid` с hard shadow `4px 4px 0 #000`
- **Анимации:** CSS keyframes (blink, capture-shrink, graveyard-pop)
- **Цветовые токены:** определены в `src/index.css` через CSS-переменные (`--bg-primary`, `--accent-yellow` и др.)

---

## 🚢 Деплой на Vercel

```bash
# Первый деплой
vercel

# Последующие деплои через Git Push
git add .
git commit -m "feat: описание"
git push
# Vercel автоматически задеплоит из main ветки
```

### После деплоя — чеклист
- [ ] Добавлены все серверные переменные окружения в Vercel Dashboard
- [ ] `SITE_URL` указывает на боевой домен (без слеша в конце)
- [ ] В Supabase добавлен боевой домен в Redirect URLs
- [ ] В Stripe настроен вебхук на `https://домен/api/stripe-webhook`
- [ ] Сделан **Redeploy без кеша** (Vercel Dashboard → Deployments → Redeploy → убрать галочку "Use existing Build Cache")
