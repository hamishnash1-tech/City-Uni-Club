# CityUniClub - Direct Supabase Integration

## ✅ Simplified Architecture

The iOS app now connects **directly to Supabase** - no backend server needed!

```
┌─────────────┐      ┌─────────────┐
│  iOS App    │ ───> │  Supabase   │
│  (SwiftUI)  │      │  (Auth + DB)│
└─────────────┘      └─────────────┘
```

---

## Setup Steps

### 1. Get Your Supabase Anon Key

1. Go to: [Supabase Dashboard](https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn/settings/api)
2. Copy the **`anon` / `public`** key (NOT service_role)
3. It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Add Supabase Swift Package

In Xcode:
1. Open your CityUniClub project
2. Go to **File** → **Add Package Dependencies**
3. Enter: `https://github.com/supabase/supabase-swift`
4. Click **Add Package**
5. Select your target: **CityUniClub app**

### 3. Configure SupabaseManager

Open: `CityUniClub app/CityUniClub app/Services/SupabaseManager.swift`

Find this line (around line 24):
```swift
let supabaseKey = "YOUR_ANON_KEY_HERE"
```

Replace with your actual anon key:
```swift
let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key-here"
```

### 4. Update LoginView

The LoginView is already set up to use SupabaseManager. Just make sure it's imported:

```swift
import SwiftUI

struct LoginView: View {
    @StateObject private var supabase = SupabaseManager.shared
    // ... rest of the code
}
```

### 5. Build & Run!

Your app is now connected directly to Supabase! ✅

---

## What's Available

### Authentication
```swift
// Login
try await SupabaseManager.shared.login(email: email, password: password)

// Signup
try await SupabaseManager.shared.signup(email: email, password: password, fullName: fullName, membershipNumber: membershipNumber)

// Logout
try await SupabaseManager.shared.logout()

// Check auth
if SupabaseManager.shared.isAuthenticated {
    // User is logged in
}
```

### Fetch Events
```swift
let events = try await SupabaseManager.shared.getEvents()
```

### Book Event
```swift
let booking = try await SupabaseManager.shared.bookEvent(
    eventId: eventId,
    mealOption: "lunch",
    guestCount: 2,
    specialRequests: "Vegetarian"
)
```

### Get News
```swift
let news = try await SupabaseManager.shared.getNews()
```

### Get Clubs
```swift
let clubs = try await SupabaseManager.shared.getReciprocalClubs(region: "Asia")
```

### Request LOI
```swift
let request = try await SupabaseManager.shared.createLoiRequest(
    clubId: clubId,
    arrivalDate: "2026-04-01",
    departureDate: "2026-04-05",
    purpose: "Business",
    specialRequests: nil
)
```

---

## Row Level Security (RLS)

Make sure RLS policies are set up correctly in Supabase:

### Members Table
```sql
-- Users can view their own data
CREATE POLICY "Users can view own data" ON members
    FOR SELECT USING (auth.uid() = id);
```

### Events Table
```sql
-- Everyone can view active events
CREATE POLICY "Everyone can view events" ON events
    FOR SELECT USING (is_active = true);
```

### Bookings Table
```sql
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON event_bookings
    FOR SELECT USING (auth.uid() = member_id);

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" ON event_bookings
    FOR INSERT WITH CHECK (auth.uid() = member_id);
```

---

## Test Credentials

| Email | Password |
|-------|----------|
| stephen.rayner@email.com | password123 |
| james.smith@email.com | password123 |
| emma.jones@email.com | password123 |

---

## Troubleshooting

### "Supabase not configured"
- Check you added the anon key in SupabaseManager.swift
- Make sure it's the `anon` key, not `service_role`

### "Not authenticated"
- Make sure user is logged in before calling protected methods
- Check `SupabaseManager.shared.isAuthenticated`

### Network errors
- Check internet connection
- Verify Supabase project is active
- Check RLS policies allow the operation

### Package dependency issues
```bash
# In Xcode
File → Packages → Reset Package Caches
```

---

## Benefits of Direct Supabase

✅ **Simpler** - No backend server to maintain
✅ **Faster** - Direct database access
✅ **Cheaper** - No server hosting costs
✅ **Secure** - Supabase Auth + RLS
✅ **Real-time** - Built-in subscriptions (if needed)

---

## Next Steps

1. Add Supabase Swift package
2. Configure anon key
3. Test login
4. Test each feature
5. Deploy to App Store! 🚀
