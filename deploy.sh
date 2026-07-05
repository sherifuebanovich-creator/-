#!/bin/bash
set -e

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ROVX FREE-TIER DEPLOYMENT                      ║"
echo "║  Google Cloud Run + Supabase + Upstash + Vercel + Groq     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 0. Prerequisites ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  - Google Cloud account (free tier)"
echo "  - Supabase account (free tier: https://supabase.com)"
echo "  - Upstash Redis account (free tier: https://upstash.com)"
echo "  - Vercel account (free tier: https://vercel.com)"
echo "  - Groq API key (free: https://console.groq.com)"
echo "  - gcloud CLI installed + logged in"
echo ""
read -p "Press Enter when ready..."

# ─── 1. Supabase (PostgreSQL) ───────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  1. SUPABASE — Free PostgreSQL                               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  1. Go to https://supabase.com → Create new project"
echo "  2. Name: 'rovx-db', set a strong password (save it!)"
echo "  3. Wait ~2 min for DB to provision"
echo "  4. Go to Project Settings → Database → Connection string"
echo "     Copy the URI (postgresql://...)"
echo ""
read -p "  Paste DATABASE_URL (connection string): " DATABASE_URL

# ─── 2. Google Cloud ─────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  2. GOOGLE CLOUD — Free Tier Setup                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  1. Go to https://console.cloud.google.com"
echo "  2. Create new project (e.g. 'rovx-app')"
echo "  3. Enable APIs: Cloud Run, Secret Manager, Artifact Registry"
echo ""
read -p "  Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project "$PROJECT_ID"

# Enable APIs
echo "  Enabling APIs..."
gcloud services enable run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com

# ─── 3. Upstash Redis ────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  3. UPSTASH — Free Redis                                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  1. Go to https://upstash.com → Sign up (free)"
echo "  2. Create a Redis database (free tier: 256 MB)"
echo "  3. Copy the REST URL and password"
echo ""
read -p "  Redis URL (e.g. redis://default:password@us1-strong-lion-12345.upstash.io:6379): " REDIS_URL
echo ""

# ─── 4. Groq AI ──────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  4. GROQ — Free AI (замена OpenAI)                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Groq даёт бесплатный доступ к Llama 3.3 70B"
echo "  (~30 запросов/мин — хватает для старта)"
echo ""
read -p "  Groq API key (https://console.groq.com): " GROQ_API_KEY

# ─── 5. Generate Secrets ─────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  5. SECRET MANAGER — Store Secrets                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- 2>/dev/null || \
  echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- 2>/dev/null || \
  echo -n "$JWT_SECRET" | gcloud secrets versions add JWT_SECRET --data-file=-
echo -n "$JWT_REFRESH_SECRET" | gcloud secrets create JWT_REFRESH_SECRET --data-file=- 2>/dev/null || \
  echo -n "$JWT_REFRESH_SECRET" | gcloud secrets versions add JWT_REFRESH_SECRET --data-file=-
echo -n "$REDIS_URL" | gcloud secrets create REDIS_URL --data-file=- 2>/dev/null || \
  echo -n "$REDIS_URL" | gcloud secrets versions add REDIS_URL --data-file=-
echo -n "$GROQ_API_KEY" | gcloud secrets create OPENAI_API_KEY --data-file=- 2>/dev/null || \
  echo -n "$GROQ_API_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

echo -e "${GREEN}  Secrets stored!${NC}"

# ─── 6. Deploy Backend to Cloud Run ──────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  6. BUILD & DEPLOY — Backend to Cloud Run                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "  Vercel production URL (e.g. https://rovx-app-livid.vercel.app): " CORS_ORIGIN

cd "$(dirname "$0")"

# Build with substitutions
gcloud builds submit --config=cloudbuild.yaml \
  --project="$PROJECT_ID" \
  --substitutions=\
_REGION=us-central1,\
_CORS_ORIGIN=$CORS_ORIGIN,\
_REDIS_URL=$REDIS_URL,\
_AI_API_BASE_URL=https://api.groq.com/openai/v1,\
_AI_MODEL=llama-3.3-70b-versatile

BACKEND_URL=$(gcloud run services describe rovx-backend --region=us-central1 --format='value(status.url)')
echo -e "${GREEN}  Backend deployed at: $BACKEND_URL${NC}"

# ─── 7. Frontend — Vercel ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  7. DEPLOY — Frontend to Vercel (бесплатно)                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Есть два способа:"
echo ""
echo "  A) Через GitHub (рекомендуется):"
echo "    1. Залей код на GitHub"
echo "    2. Go to https://vercel.com → Import repo (выбери rovx-out/frontend)"
echo "    3. Framework: Next.js"
echo "    4. Добавь env vars (см. таблицу ниже)"
echo "    5. Deploy"
echo ""
echo "  B) Через Vercel CLI:"
echo "    cd frontend && npx vercel --prod"
echo ""
echo "  ┌──────────────────────────┬──────────────────────────────────────┐"
echo "  │ Variable                 │ Value                                │"
echo "  ├──────────────────────────┼──────────────────────────────────────┤"
echo "  │ NEXT_PUBLIC_API_URL      │ $BACKEND_URL/api/v1                  │"
echo "  │ NEXT_PUBLIC_WS_URL       │ $BACKEND_URL                         │"
echo "  │ NEXTAUTH_URL             │ $CORS_ORIGIN                         │"
echo "  │ NEXTAUTH_SECRET          │ $(openssl rand -base64 32)           │"
echo "  │ GOOGLE_CLIENT_ID         │ (из Google Cloud Console)            │"
echo "  │ GOOGLE_CLIENT_SECRET     │ (из Google Cloud Console)            │"
echo "  └──────────────────────────┴──────────────────────────────────────┘"
echo ""
echo "  Google OAuth: https://console.cloud.google.com/apis/credentials"
echo "    → Create OAuth 2.0 Client ID"
echo "    → Authorized redirect URI: $CORS_ORIGIN/api/auth/callback/google"
echo ""
read -p "  Press Enter after deploying frontend to Vercel... "

# ─── 8. Done ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  DEPLOYMENT COMPLETE!                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $CORS_ORIGIN"
echo "  Database: Supabase (PostgreSQL)"
echo "  Redis:    Upstash"
echo "  AI:       Groq (Llama 3.3 70B)"
echo ""
echo "  Бесплатные лимиты:"
echo "  - Cloud Run: 2M запросов/мес"
echo "  - Supabase: 500 MB"
echo "  - Upstash:  256 MB / 10k команд/день"
echo "  - Vercel:   100 GB bandwidth"
echo "  - Groq:     ~30 запросов/мин"
echo ""
echo "  Чтобы обновить бэкенд:"
echo "    git push  (или вручную: gcloud builds submit)"
echo ""
