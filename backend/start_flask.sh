#!/bin/bash

# Get environment variables from the system
export SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}
export SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}
export SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
export GROQ_API_KEY=${GROQ_API_KEY}
export NEWSAPI_KEY=${NEWSAPI_KEY}
export FLASK_ENV=development
export FLASK_DEBUG=True

echo "[INFO] Environment variables:"
echo "  SUPABASE_URL: ${SUPABASE_URL:0:20}..."
echo "  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
echo "  GROQ_API_KEY: ${GROQ_API_KEY:0:20}..."
echo "  NEWSAPI_KEY: ${NEWSAPI_KEY:0:20}..."

cd /vercel/share/v0-project/backend
python3 run.py
