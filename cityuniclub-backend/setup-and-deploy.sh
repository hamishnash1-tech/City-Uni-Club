#!/bin/bash

# CityUniClub - First Time Vercel Setup
# This script helps you set up and deploy to Vercel for the first time

set -e

echo "🎯 CityUniClub - Vercel First-Time Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

echo -e "${BLUE}Step 1: Install Dependencies${NC}"
echo "----------------------------------------"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Install Vercel CLI${NC}"
echo "----------------------------------------"
npm install -g vercel
echo -e "${GREEN}✓ Vercel CLI installed${NC}"
echo ""

echo -e "${BLUE}Step 3: Login to Vercel${NC}"
echo "----------------------------------------"
echo "Opening browser for Vercel login..."
vercel login --browser
echo -e "${GREEN}✓ Logged in${NC}"
echo ""

echo -e "${BLUE}Step 4: Link/Create Vercel Project${NC}"
echo "----------------------------------------"
echo "This will create a new Vercel project linked to your GitHub repo"
echo ""
vercel link --yes
echo -e "${GREEN}✓ Project linked${NC}"
echo ""

echo -e "${BLUE}Step 5: Set Environment Variables${NC}"
echo "----------------------------------------"
echo ""
echo "I'll help you set up the environment variables on Vercel"
echo ""
echo "Opening Vercel environment variables page..."
echo ""

# Get project ID from .vercel/project.json
if [ -f .vercel/project.json ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$PROJECT_ID" ]; then
        open "https://vercel.com/dashboard/project/$PROJECT_ID/settings/environment-variables"
    fi
fi

echo ""
echo -e "${YELLOW}In your browser, add these environment variables:${NC}"
echo ""
echo "  Name: SUPABASE_URL"
echo "  Value: https://myfoyoyjtkqthjjvabmn.supabase.co"
echo "  Environments: Production, Preview, Development"
echo ""
echo "  Name: SUPABASE_SERVICE_ROLE_KEY"
echo "  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA
echo "  Environments: Production, Preview, Development"
echo ""
echo "  Name: NODE_ENV"
echo "  Value: production"
echo "  Environments: Production, Preview"
echo ""

read -p "Press Enter once you've added the environment variables..."

echo ""
echo -e "${BLUE}Step 6: Deploy to Production${NC}"
echo "----------------------------------------"
echo ""
echo "Deploying now..."
echo ""

vercel --prod

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup & Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📍 Your backend is now live on Vercel!"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1. Copy your Vercel URL from above"
echo "2. Open Xcode project"
echo "3. Edit: CityUniClub app/CityUniClub app/Services/APIConfiguration.swift"
echo "4. Update baseURL to: https://YOUR-URL.vercel.app/api"
echo "5. Build and run your iOS app"
echo ""
echo "📡 Test your API:"
echo ""
echo "   curl https://YOUR-URL.vercel.app/api/events"
echo "   curl https://YOUR-URL.vercel.app/api/news"
echo ""
echo "=========================================="
echo ""
