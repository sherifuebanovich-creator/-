#!/bin/bash
set -e

echo "=== ROVX Deployment Script ==="
echo ""

# ─── 1. Supabase ──────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  1. CREATE SUPABASE PROJECT                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  1. Go to https://supabase.com → Create new project"
echo "  2. Choose a name (e.g. 'rovx-db') and strong password"
echo "  3. Wait for DB to provision (~2 min)"
echo "  4. Go to Project Settings → Database → Connection string"
echo "     Copy the 'URI' (postgresql://...)"
echo "     It looks like:"
echo "     postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
echo ""
echo "  5. Save this string — you'll need it for the next steps"
echo ""

read -p "Press Enter after you've created the Supabase project..."

# ─── 2. Google Cloud Project ─────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  2. CREATE GOOGLE CLOUD PROJECT                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  1. Go to https://console.cloud.google.com"
echo "  2. Create a new project (e.g. 'rovx-app')"
echo "  3. Enable these APIs:"
echo "     - Cloud Run API"
echo "     - Secret Manager API"
echo "     - Artifact Registry API (or Container Registry)"
echo ""
echo "  4. Install & login with gcloud CLI:"
echo "     gcloud auth login"
echo "     gcloud config set project YOUR_PROJECT_ID"
echo ""

read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project "$PROJECT_ID"

# ─── 3. Store Secrets ────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  3. STORE SECRETS IN SECRET MANAGER                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

read -sp "Enter Supabase DATABASE_URL (connection string): " DATABASE_URL
echo ""
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-

read -sp "Enter JWT_SECRET (min 32 chars): " JWT_SECRET
echo ""
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=-

read -sp "Enter JWT_REFRESH_SECRET (min 32 chars): " JWT_REFRESH_SECRET
echo ""
echo -n "$JWT_REFRESH_SECRET" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-

echo -n "" | gcloud secrets create OPENAI_API_KEY --data-file=-

# 4. Build & Deploy Backend to Cloud Run
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  4. DEPLOY BACKEND TO CLOUD RUN                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/backend"

# Build image
gcloud builds submit --config=../cloudbuild.yaml --project="$PROJECT_ID"

# Get backend URL
BACKEND_URL=$(gcloud run services describe rovx-backend --region=us-central1 --format='value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# 5. Run database migrations
echo ""
echo "Running migrations..."
gcloud run jobs execute rovx-migrate --region=us-central1 --wait || \
  echo "Note: migrations job not found, running manually..."

# Alternative: run migration via Cloud Run task
gcloud run deploy rovx-migrate \
  --image=gcr.io/$PROJECT_ID/rovx-backend:latest \
  --region=us-central1 \
  --command="npx" \
  --args="prisma,migrate,deploy" \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --no-cpu-throttling \
  --task-timeout=10m

gcloud run jobs delete rovx-migrate --region=us-central1 --quiet || true

# 6. Deploy Frontend to Vercel
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  6. DEPLOY FRONTEND TO VERCEL                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Option A: Automatic via GitHub"
echo "    1. Push code to GitHub"
echo "    2. Go to https://vercel.com → Import repo"
echo "    3. Set Framework: Next.js"
echo "    4. Add env vars (see below)"
echo "    5. Deploy"
echo ""
echo "  Option B: CLI"
echo "    npx vercel --prod"
echo ""

echo "  Required Vercel env vars:"
echo "  ┌─────────────────────────────────────┬──────────────────────────────────┐"
echo "  │ Variable                            │ Value                           │"
echo "  ├─────────────────────────────────────┼──────────────────────────────────┤"
echo "  │ NEXT_PUBLIC_API_URL                 │ $BACKEND_URL/api/v1              │"
echo "  │ NEXT_PUBLIC_WS_URL                  │ $BACKEND_URL                     │"
echo "  │ NEXTAUTH_URL                        │ https://rovx.vercel.app          │"
echo "  │ NEXTAUTH_SECRET                     │ (generate: openssl rand -base64 32) │"
echo "  │ GOOGLE_CLIENT_ID                    │ (from Google Cloud Console)      │"
echo "  │ GOOGLE_CLIENT_SECRET                │ (from Google Cloud Console)      │"
echo "  └─────────────────────────────────────┴──────────────────────────────────┘"

echo ""
echo "=== Deployment complete! ==="
echo "Backend: $BACKEND_URL"
echo "Frontend: https://rovx.vercel.app"
