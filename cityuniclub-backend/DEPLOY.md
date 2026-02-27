# 🚀 Deploy to Vercel - Quick Start

## Option 1: Run Deploy Script (Easiest)

```bash
cd cityuniclub-backend
npm run deploy
```

This interactive script will:
1. Install all dependencies
2. Install Vercel CLI
3. Login to Vercel
4. Link your project
5. Guide you through environment variables
6. Deploy to production

---

## Option 2: Manual Deploy (2 minutes)

### 1. Go to Vercel
[https://vercel.com/new](https://vercel.com/new)

### 2. Import Repository
- Select **GitHub**
- Find `City-Uni-Club` repository
- Click **Import**

### 3. Configure
```
Root Directory: cityuniclub-backend
Build Command: echo 'Vercel build complete'
Output Directory: .
```

### 4. Add Environment Variables
Click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://myfoyoyjtkqthjjvabmn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key from .env) |
| `NODE_ENV` | `production` |

### 5. Click Deploy!

---

## Option 3: Command Line

```bash
cd cityuniclub-backend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## After Deployment

### 1. Copy Your Vercel URL
You'll get something like: `https://city-uni-club-xyz.vercel.app`

### 2. Update iOS App
Open `CityUniClub app/CityUniClub app/Services/APIConfiguration.swift`:

```swift
static let baseURL = "https://YOUR-URL.vercel.app/api"
```

### 3. Test API
```bash
# Events
curl https://YOUR-URL.vercel.app/api/events

# News
curl https://YOUR-URL.vercel.app/api/news

# Login
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

# Manual deploy with script
./deploy-vercel.sh

# Full setup wizard
./setup-and-deploy.sh
```

---

## Troubleshooting

### Build Failed
- Check Vercel logs in dashboard
- Ensure `cityuniclub-backend` is set as root directory
- Verify build command is: `echo 'Vercel build complete'`

### Function Errors
- Check environment variables are set
- Verify Supabase credentials are correct
- Check Vercel Functions logs

### CORS Issues
- All endpoints have CORS enabled
- Ensure iOS app uses correct Vercel URL

---

## Need Help?

- 📚 Full docs: `DEPLOYMENT.md`
- 📖 Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- 💬 Vercel support: [vercel.com/support](https://vercel.com/support)
