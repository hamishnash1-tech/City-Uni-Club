#!/bin/bash

# Deploy all Supabase Edge Functions

set -e

echo "🚀 Deploying Supabase Edge Functions..."
echo "======================================="
echo ""

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

# Check if logged in
echo "🔐 Checking Supabase login..."
npx supabase whoami 2>/dev/null || {
    echo "Not logged in. Opening browser for login..."
    npx supabase login
}
echo "✓ Logged in"
echo ""

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
echo "✓ login deployed"
echo ""

echo "Deploying: logout..."
npx supabase functions deploy logout --no-verify-jwt
echo "✓ logout deployed"
echo ""

echo "Deploying: events..."
npx supabase functions deploy events --no-verify-jwt
echo "✓ events deployed"
echo ""

echo "Deploying: events/book..."
npx supabase functions deploy events-book --function-name events/book --no-verify-jwt
echo "✓ events/book deployed"
echo ""

echo "Deploying: news..."
npx supabase functions deploy news --no-verify-jwt
echo "✓ news deployed"
echo ""

echo "Deploying: clubs..."
npx supabase functions deploy clubs --no-verify-jwt
echo "✓ clubs deployed"
echo ""

echo "Deploying: loi-requests..."
npx supabase functions deploy loi-requests --no-verify-jwt
echo "✓ loi-requests deployed"
echo ""

echo "======================================="
echo "✅ All functions deployed!"
echo ""
echo "📍 Function URLs:"
echo ""
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/login"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/logout"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events/book"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/clubs"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/loi-requests"
echo ""
echo "📱 Update iOS App:"
echo ""
echo "   Open: CityUniClub app/CityUniClub app/Services/APIConfiguration.swift"
echo "   Change baseURL to:"
echo "   https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1"
echo ""
echo "📡 Test Your API:"
echo ""
echo "   curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events"
echo "   curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news"
echo ""
echo "======================================="
