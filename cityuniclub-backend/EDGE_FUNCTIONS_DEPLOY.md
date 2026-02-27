# Supabase Edge Functions Deployment Guide

## ✅ Converted from Vercel API

All API endpoints are now Supabase Edge Functions running on Deno runtime.

---

## Edge Functions Created

| Function | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| `login` | `/login` | POST | User login |
| `logout` | `/logout` | POST | User logout |
| `events` | `/events` | GET | List all events |
| `events/book` | `/events/book` | POST | Book an event |
| `news` | `/news` | GET | Get club news |
| `clubs` | `/clubs` | GET | Get reciprocal clubs |
| `loi-requests` | `/loi-requests` | POST | Create LOI request |

---

## Deploy Edge Functions

### Option 1: Deploy All Functions

```bash
cd cityuniclub-backend

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref myfoyoyjtkqthjjvabmn

# Deploy all functions
npx supabase functions deploy login
npx supabase functions deploy logout
npx supabase functions deploy events
npx supabase functions deploy events-book --function-name events/book
npx supabase functions deploy news
npx supabase functions deploy clubs
npx supabase functions deploy loi-requests
```

### Option 2: Deploy Script

```bash
cd cityuniclub-backend
./deploy-edge-functions.sh
```

---

## Function URLs

After deployment, your functions will be available at:

```
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/login
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/logout
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events/book
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/clubs
https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/loi-requests
```

---

## Update iOS App

Update `APIConfiguration.swift`:

```swift
enum APIConfiguration {
    // Now using Supabase Edge Functions
    static let baseURL = "https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1"
    
    static let timeout: TimeInterval = 30
}
```

---

## Test Your Functions

### Test Login
```bash
curl -X POST https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stephen.rayner@email.com","password":"password123"}'
```

### Test Events
```bash
curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events
```

### Test News
```bash
curl https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/news
```

---

## Local Testing

### Start Supabase Locally (Optional)
```bash
cd cityuniclub-backend
npx supabase start
```

### Test Locally
```bash
# Login function
curl -X POST http://localhost:54321/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Environment Variables

Edge functions automatically have access to:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No need to configure them manually!

---

## Benefits of Edge Functions

✅ **Closer to users** - Runs on edge network
✅ **Faster** - Lower latency than backend server
✅ **Integrated** - Direct access to Supabase Auth & DB
✅ **Secure** - Service role key never exposed to client
✅ **Cost-effective** - Pay per invocation, no server costs
✅ **Simple** - No server management

---

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│  iOS App    │ ───> │ Edge Functions   │ ───> │  Supabase   │
│  (SwiftUI)  │      │ (Deno Runtime)   │      │  Database   │
└─────────────┘      └──────────────────┘      └─────────────┘
                            │
                            └──────> Supabase Auth
```

---

## Troubleshooting

### Function Not Found
- Ensure function is deployed: `npx supabase functions list`
- Check function name is correct in URL

### Permission Errors
- Verify service_role key has correct permissions
- Check RLS policies on tables

### CORS Issues
- All functions have CORS headers enabled
- Ensure iOS app uses correct base URL

---

## Next Steps

1. Deploy all edge functions
2. Update iOS app `APIConfiguration.swift`
3. Test each endpoint
4. Monitor usage in Supabase Dashboard

---

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime Docs](https://deno.land/manual)
- [Function Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
