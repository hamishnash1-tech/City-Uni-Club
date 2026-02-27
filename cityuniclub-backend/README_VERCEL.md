# 🚀 Deploy to Vercel - Simple Guide

## What Happened
The error was from `@vercel/node` package trying to install `esbuild` which ran out of memory. I've fixed this by removing that dependency - Vercel provides compatible types automatically.

---

## Deploy Now (Choose One Method)

### Method 1: Vercel Dashboard (Recommended - 2 minutes)

1. **Go to**: [vercel.com/new](https://vercel.com/new)

2. **Import Repository**:
   - Select **GitHub**
   - Find `hamishnash1-tech/City-Uni-Club`
   - Click **Import**

3. **Configure**:
   ```
   Root Directory: cityuniclub-backend
   Build Command: echo 'Vercel build complete'
   Output Directory: .
   ```

4. **Add Environment Variables**:
   Click **Environment Variables** → Add these 3:
   
   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | `https://myfoyoyjtkqthjjvabmn.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA` |
   | `NODE_ENV` | `production` |

5. **Click Deploy!**

---

### Method 2: Command Line

```bash
# Navigate to backend
cd cityuniclub-backend

# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted, add the environment variables listed above.

---

### Method 3: Deployment Script

```bash
cd cityuniclub-backend

# First-time setup (interactive)
npm run deploy

# OR quick deploy (if already set up)
./deploy-vercel.sh
```

---

## After Deployment

### 1. Copy Your URL
You'll get: `https://city-uni-club-xyz.vercel.app`

### 2. Update iOS App
Open in Xcode:
```
CityUniClub app/CityUniClub app/Services/APIConfiguration.swift
```

Change:
```swift
static let baseURL = "https://YOUR-URL.vercel.app/api"
```

### 3. Test API
```bash
# Replace YOUR-URL with your actual Vercel URL

# Test Events
curl https://YOUR-URL.vercel.app/api/events

# Test News  
curl https://YOUR-URL.vercel.app/api/news

# Test Login
curl -X POST https://YOUR-URL.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stephen.rayner@email.com","password":"password123"}'
```

---

## Available Commands

```bash
# First-time setup & deploy
npm run deploy

# Deploy to production
npm run deploy:prod

# Deploy to preview (staging)
npm run deploy:preview

# Manual deploy
./deploy-vercel.sh

# Full setup wizard
./setup-and-deploy.sh
```

---

## Troubleshooting

### Build Failed
- Check Vercel logs: vercel.com/dashboard → Your Project → Deployments
- Ensure Root Directory is: `cityuniclub-backend`
- Verify Build Command: `echo 'Vercel build complete'`

### Function Errors (500)
- Check environment variables are set in Vercel
- Verify Supabase credentials are correct
- Check Vercel Functions logs

### Can't Connect from iOS App
- Ensure Vercel deployment is complete
- Update `APIConfiguration.swift` with correct Vercel URL
- Check CORS is enabled (it is by default in our API)

---

## Test Credentials

| Email | Password |
|-------|----------|
| stephen.rayner@email.com | password123 |
| james.smith@email.com | password123 |
| emma.jones@email.com | password123 |

---

## What's Deployed

✅ **API Endpoints**:
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout  
- `/api/auth/me` - Get current member
- `/api/events` - List events
- `/api/events/[id]-book` - Book events
- `/api/news` - Get news
- `/api/reciprocal/clubs` - Get clubs

✅ **Database**: Supabase PostgreSQL (already set up)

✅ **iOS Client**: Ready to connect (update URL after deploy)

---

## Need Help?

- 📚 Full docs: `DEPLOYMENT.md`
- 📖 Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- 💬 Support: Check Vercel dashboard logs
