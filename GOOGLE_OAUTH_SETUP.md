# 🔐 Настройка Google OAuth для ROVX

## 1. Получи Google Client ID и Secret

1. Зайди на https://console.cloud.google.com
2. Создай новый проект или выбери существующий
3. Перейди в **APIs & Services → Credentials**
4. Нажми **Create Credentials → OAuth 2.0 Client ID**
5. Тип приложения: **Web application**
6. Добавь Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (для разработки)
   - `https://yourdomain.com/api/auth/callback/google` (для продакшена)
7. Скопируй **Client ID** и **Client Secret**

## 2. Обнови frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here

# NextAuth — сгенерируй случайный ключ:
# openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 3. Обнови Prisma schema (уже включено)

В `backend/prisma/schema.prisma` добавлено поле `googleId String? @unique`.
Запусти миграцию:

```bash
cd backend
npx prisma migrate dev --name add_google_id
```

## 4. Запуск

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

## Что изменено

- ✅ Кнопка "Continue with Google" на Login и Register страницах
- ✅ `next-auth` с Google Provider — `/api/auth/[...nextauth]`
- ✅ Backend endpoint `POST /auth/google` — автоматически создаёт аккаунт при первом входе через Google
- ✅ `react-icons` вместо `lucide-react` во всех компонентах
- ✅ Рабочие страницы: Profile, Routes, Bookmarks, Achievements, Notifications, Settings
- ✅ Кнопка Report в BottomBar открывает панель репортов
- ✅ Все ссылки в Sidebar ведут на реальные страницы
