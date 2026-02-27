#!/bin/bash

# Quick deploy of Supabase Edge Functions
# Assumes you're already logged into Supabase

set -e

echo "🚀 Deploying Supabase Edge Functions..."
echo "======================================="
echo ""

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

# Link project
echo "🔗 Linking to Supabase project..."
npx supabase link --project-ref myfoyoyjtkqthjjvabmn
echo "✓ Project linked"
echo ""

# Deploy functions
echo "📦 Deploying functions..."
echo ""

echo "Deploying: login..."
npx supabase functions deploy login --no-verify-jwt
echo ""

echo "Deploying: logout..."
npx supabase functions deploy logout --no-verify-jwt
echo ""

echo "Deploying: events..."
npx supabase functions deploy events --no-verify-jwt
echo ""

echo "Deploying: events-book..."
npx supabase functions deploy events-book --function-name events/book --no-verify-jwt
echo ""

echo "Deploying: news..."
npx supabase functions deploy news --no-verify-jwt
echo ""

echo "Deploying: clubs..."
npx supabase functions deploy clubs --no-verify-jwt
echo ""

echo "Deploying: loi-requests..."
npx supabase functions deploy loi-requests --no-verify-jwt
echo ""

echo "======================================="
echo "✅ All functions deployed!"
echo ""
echo "📍 Your Edge Functions are live at:"
echo ""
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/login"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/logout"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events/book"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/clubs"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/loi-requests"
echo ""
echo "📡 Test now:"
echo ""
echo "   curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events"
echo "   curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news"
echo ""
echo "======================================="
