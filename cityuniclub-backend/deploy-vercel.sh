#!/bin/bash

# CityUniClub Vercel Deployment Script
# This script deploys the backend to Vercel

set -e

echo "🚀 CityUniClub - Vercel Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
    echo ""
fi

# Navigate to backend directory
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/cityuniclub-backend"
cd "$BACKEND_DIR"

echo "📁 Backend directory: $BACKEND_DIR"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Update .env with your Supabase credentials!${NC}"
    echo ""
    echo "Edit .env and set:"
    echo "  SUPABASE_URL=https://myfoyoyjtkqthjjvabmn.supabase.co"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    echo ""
    read -p "Press Enter after you've updated .env..."
fi

# Login to Vercel
echo "🔐 Checking Vercel login..."
vercel whoami 2>/dev/null || {
    echo -e "${YELLOW}Not logged in to Vercel. Opening browser for login...${NC}"
    vercel login --browser
}
echo -e "${GREEN}✓ Logged in to Vercel${NC}"
echo ""

# Link project
echo "🔗 Linking to Vercel project..."
if [ ! -d .vercel ]; then
    vercel link --yes
fi
echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# Pull environment variables from Vercel (if they exist)
echo "📥 Pulling environment variables..."
vercel env pull || {
    echo -e "${YELLOW}No environment variables found on Vercel${NC}"
}
echo ""

# Check if environment variables are set
echo "📋 Checking environment variables..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}⚠️  Missing environment variables!${NC}"
    echo ""
    echo "Please set these in Vercel Dashboard:"
    echo "  1. Go to vercel.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Settings → Environment Variables"
    echo "  4. Add:"
    echo "     - SUPABASE_URL"
    echo "     - SUPABASE_SERVICE_ROLE_KEY"
    echo "     - NODE_ENV"
    echo ""
    read -p "Press Enter to continue with deployment..."
fi

# Deploy to production
echo ""
echo "🚀 Deploying to production..."
echo ""

# Run deployment
DEPLOY_OUTPUT=$(vercel --prod 2>&1)

# Extract deployment URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^"]*\.vercel\.app' | head -1)

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📍 Deployment URL: ${DEPLOY_URL:-https://your-project.vercel.app}"
echo ""
echo "📱 Update iOS App Configuration:"
echo ""
echo "   Open: CityUniClub app/CityUniClub app/Services/APIConfiguration.swift"
echo "   Change baseURL to: ${DEPLOY_URL:-https://your-project.vercel.app}/api"
echo ""
echo "📡 Test Your API:"
echo ""
echo "   curl ${DEPLOY_URL:-https://your-project.vercel.app}/api/events"
echo "   curl ${DEPLOY_URL:-https://your-project.vercel.app}/api/news"
echo ""
echo "🔐 Test Login:"
echo ""
echo "   curl -X POST ${DEPLOY_URL:-https://your-project.vercel.app}/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"stephen.rayner@email.com\",\"password\":\"password123\"}'"
echo ""
echo "=========================================="
echo ""

# Open Vercel dashboard
echo "🌐 Opening Vercel dashboard..."
open "https://vercel.com/dashboard"

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
