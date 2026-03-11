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

functions=(
  admin-login
  admin-logout
  admin-loi
  change-password
  clubs
  events
  login
  logout
  loi-api
  loi-requests
  news
  send-loi-email
)

for fn in "${functions[@]}"; do
  echo "Deploying: $fn..."
  npx supabase functions deploy "$fn" --no-verify-jwt
  echo "✓ $fn deployed"
  echo ""
done

echo "======================================="
echo "✅ All functions deployed!"
echo ""
echo "📍 Base URL: https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1"
echo ""
echo "======================================="
