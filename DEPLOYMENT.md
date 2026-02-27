# CityUniClub Deployment Guide

## Quick Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repository (`City-Uni-Club`)
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `cityuniclub-backend`
   - **Build Command**: `echo 'Vercel build complete'`
   - **Output Directory**: `.`

5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
cd cityuniclub-backend
vercel login
vercel --prod
```

### Step 3: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
SUPABASE_URL=https://myfoyoyjtkqthjjvabmn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA
NODE_ENV=production
```

Click **Save**

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Vercel Dashboard → Deployments → Click menu on latest → **Redeploy**

### Step 5: Get Your Vercel URL

Your app will be deployed to:
```
https://city-uni-club-frontend.vercel.app
```

Or your custom domain if configured.

---

## Update iOS App

### For Production (Vercel)

The iOS app is already configured to use:
```swift
static let baseURL = "https://city-uni-club-frontend.vercel.app/api"
```

If your Vercel URL is different, update:
`CityUniClub app/CityUniClub app/Services/APIConfiguration.swift`

### For Local Development

1. Find your Mac's IP:
```bash
ipconfig getifaddr en0
```

2. Update `APIConfiguration.swift`:
```swift
static let baseURL = "http://YOUR_IP:3000/api"
```

3. Run backend locally:
```bash
cd cityuniclub-backend
npm install
npm run dev
```

---

## Database (Supabase)

✅ Already configured and seeded!

- **Project**: `myfoyoyjtkqthjjvabmn`
- **Dashboard**: https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn

### Tables Created:
- `members` - User accounts
- `member_profiles` - Extended profiles
- `events` - Club events
- `event_bookings` - Event reservations
- `dining_reservations` - Dining bookings
- `reciprocal_clubs` - Club directory
- `loi_requests` - LOI requests
- `club_news` - News articles
- `sessions` - Auth sessions

### Test Credentials:
| Email | Password |
|-------|----------|
| stephen.rayner@email.com | password123 |
| james.smith@email.com | password123 |
| emma.jones@email.com | password123 |

---

## API Endpoints

After deployment, access:

```
https://YOUR-VERCEL-URL.vercel.app/api/auth/login
https://YOUR-VERCEL-URL.vercel.app/api/auth/logout
https://YOUR-VERCEL-URL.vercel.app/api/auth/me
https://YOUR-VERCEL-URL.vercel.app/api/events
https://YOUR-VERCEL-URL.vercel.app/api/events/[id]-book
https://YOUR-VERCEL-URL.vercel.app/api/news
https://YOUR-VERCEL-URL.vercel.app/api/reciprocal/clubs
```

---

## Testing

### Test Login API:
```bash
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stephen.rayner@email.com","password":"password123"}'
```

### Test Events API:
```bash
curl https://YOUR-VERCEL-URL.vercel.app/api/events
```

### Test News API:
```bash
curl https://YOUR-VERCEL-URL.vercel.app/api/news
```

---

## Troubleshooting

### Function Errors
- Check Vercel Functions logs in dashboard
- Verify environment variables are set
- Ensure Supabase credentials are correct

### CORS Issues
- All API endpoints have CORS enabled
- For local dev, ensure iOS app uses correct URL

### Database Errors
- Check Supabase dashboard for table existence
- Verify RLS policies allow operations
- Check service_role key is correct

---

## Production Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] iOS app API URL updated
- [ ] Tested login flow
- [ ] Tested event booking
- [ ] Tested news feed
- [ ] Tested reciprocal clubs
- [ ] Changed default test passwords

---

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Functions: https://vercel.com/docs/functions
