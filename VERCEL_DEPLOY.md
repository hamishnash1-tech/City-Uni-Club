# CityUniClub - Vercel Quick Deploy

## 🚀 Deploy Now (2 minutes)

### 1. Go to Vercel
[https://vercel.com/new](https://vercel.com/new)

### 2. Import Repository
- Click **Import Git Repository**
- Select `hamishnash1-tech/City-Uni-Club`
- Click **Import**

### 3. Configure Project

```
Framework Preset: Other
Root Directory: cityuniclub-backend
Build Command: echo 'Vercel build complete'
Output Directory: .
```

### 4. Add Environment Variables

Click **Environment Variables** → Add these 3:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://myfoyoyjtkqthjjvabmn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA` |
| `NODE_ENV` | `production` |

### 5. Deploy!
Click **Deploy**

Wait ~1-2 minutes for build to complete.

### 6. Test Your API

Once deployed, test the endpoints:

```bash
# Replace YOUR-VERCEL-URL with your actual Vercel URL
curl https://YOUR-VERCEL-URL.vercel.app/api/events
curl https://YOUR-VERCEL-URL.vercel.app/api/news
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stephen.rayner@email.com","password":"password123"}'
```

---

## 📱 Update iOS App

After deployment:

1. Copy your Vercel URL (e.g., `city-uni-club-xyz.vercel.app`)

2. Open Xcode project

3. Edit `CityUniClub app/CityUniClub app/Services/APIConfiguration.swift`

4. Update the URL:
```swift
static let baseURL = "https://YOUR-VERCEL-URL.vercel.app/api"
```

5. Build and run!

---

## ✅ Done!

Your backend is now live on Vercel with:
- ✅ User authentication
- ✅ Event listings & bookings
- ✅ News feed
- ✅ Reciprocal clubs directory
- ✅ All connected to your Supabase database

---

## Need Help?

- **Vercel Dashboard**: Check logs at vercel.com/dashboard
- **Supabase Dashboard**: Check data at supabase.com/dashboard
- **DEPLOYMENT.md**: Full documentation in project root
