# 🚀 Quick Deploy to Vercel

## Updated: New Vercel CLI Login Flow

Vercel has updated their CLI to use a browser-based login flow instead of terminal prompts.

---

## Deploy Options

### Option 1: Vercel Dashboard (Easiest - No CLI needed)

1. **Go to**: [vercel.com/new](https://vercel.com/new)
2. **Import**: `hamishnash1-tech/City-Uni-Club`
3. **Root Directory**: `cityuniclub-backend`
4. **Build Command**: `echo 'Vercel build complete'`
5. **Add Environment Variables**:
   ```
   SUPABASE_URL=https://myfoyoyjtkqthjjvabmn.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA
   NODE_ENV=production
   ```
6. **Click Deploy!**

---

### Option 2: Using Updated CLI

```bash
cd cityuniclub-backend

# Install Vercel CLI
npm install -g vercel

# Login (automatically opens browser)
vercel login

# Deploy
vercel --prod
```

---

### Option 3: Updated Deployment Script

```bash
cd cityuniclub-backend
npm run deploy
```

The script now uses `vercel login --browser` which opens your default browser for authentication.

---

## What's New in Vercel CLI

- **Old**: `vercel login` (terminal prompts for email/code)
- **New**: `vercel login --browser` (opens browser, click to authenticate)

The new flow is more secure and supports:
- GitHub login
- GitLab login
- Bitbucket login
- Email login
- SSO (for Enterprise)

---

## Troubleshooting

### Browser Doesn't Open
```bash
# Manually open browser and get token
vercel login --browser

# Or use token directly
vercel login --token YOUR_TOKEN
```

### Already Logged In
```bash
# Check current login
vercel whoami

# Logout and re-login
vercel logout
vercel login --browser
```

### Deploy Fails
```bash
# Check linked project
vercel link

# View logs
vercel logs
```

---

## After Deployment

1. **Copy your Vercel URL**: `https://city-uni-club-xyz.vercel.app`
2. **Update iOS app**: Change `APIConfiguration.swift` baseURL
3. **Test API**: 
   ```bash
   curl https://YOUR-URL.vercel.app/api/events
   curl https://YOUR-URL.vercel.app/api/news
   ```

---

## More Info

- [Vercel CLI Changelog](https://vercel.com/changelog/new-vercel-cli-login-flow)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
