# iOS App - Supabase Edge Functions Integration

## ✅ Authentication Flow Complete

### App Startup Flow

```
┌─────────────────┐
│  App Launches   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AuthManager     │
│ checks for      │
│ saved token     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│ Has   │ │ No Token│
│ Token │ │ /Invalid│
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌────────┐ ┌──────────┐
│ Validate│ │ Show     │
│ Token   │ │ LoginView│
│ with    │ └──────────┘
│ Edge Fn │
└───┬─────┘
    │
 ┌──┴──┐
 │     │
 ▼     ▼
Valid Invalid
 │     │
 ▼     ▼
┌──────────┐ ┌──────────┐
│MainTabView│ │Show Login│
└──────────┘ └──────────┘
```

---

## Files Changed

### 1. `CityUniClub_appApp.swift`
- Added `@StateObject authManager`
- Shows `LoginView` or `MainTabView` based on auth state
- Passes `authManager` as environment object

### 2. `AuthManager.swift` (NEW)
- Manages authentication state
- Checks for saved session on app launch
- Validates token with Edge Functions
- Handles login/logout
- Persists token and member data

### 3. `LoginView.swift`
- Uses `@EnvironmentObject var authManager`
- Calls `authManager.login()` on login
- Automatically navigates to `MainTabView` on success

### 4. `APIService.swift`
- Updated endpoints to use Edge Functions paths:
  - `/login` instead of `/auth/login`
  - `/logout` instead of `/auth/logout`
  - `/events` instead of `/events?upcoming=true`
  - `/events/book` instead of `/events/:id/book`
  - `/news` instead of `/api/news`
  - `/clubs` instead of `/reciprocal/clubs`
  - `/loi-requests` instead of `/reciprocal/loi-requests`

### 5. `MainTabView.swift`
- Added `@EnvironmentObject var authManager`
- Passes authManager to child views

---

## How It Works

### App Launch
1. `AuthManager` initializes
2. Checks `UserDefaults` for saved token
3. If token exists, validates with Edge Function
4. Shows appropriate view based on auth state

### Login
1. User enters email/password
2. `authManager.login()` calls Edge Function
3. Saves token and member data to `UserDefaults`
4. Updates `isAuthenticated` to `true`
5. App automatically shows `MainTabView`

### Logout
1. Call `authManager.logout()`
2. Clears token from `UserDefaults`
3. Sets `isAuthenticated` to `false`
4. App automatically shows `LoginView`

---

## Test the Flow

### 1. First Launch (No Session)
```
App Launches → LoginView appears
```

### 2. Login
```
Enter: stephen.rayner@email.com
Password: password123
Tap: Login
→ MainTabView appears
```

### 3. Close and Reopen App
```
App Launches → MainTabView appears (already logged in)
```

### 4. Logout (in MoreView)
```
Tap: Logout
→ LoginView appears
```

---

## API Endpoints Used

All requests go to Supabase Edge Functions:

```
Base URL: https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1

POST /login           - User login
POST /logout          - User logout
GET  /events          - Get events
POST /events/book     - Book event
GET  /news            - Get news
GET  /clubs           - Get clubs
POST /loi-requests    - Create LOI request
```

---

## Data Persistence

### Stored in UserDefaults:
- `authToken` - Session token (string)
- `currentMember` - Member data (JSON)

### Security:
- Token validated on app launch
- Token cleared on logout
- All API requests use Bearer token auth

---

## Error Handling

### Invalid Credentials
```
Login fails → Shows error alert
User stays on LoginView
```

### Invalid/Expired Token
```
App launch → Token validation fails
→ Clears session
→ Shows LoginView
```

### Network Error
```
Shows error message
User can retry
```

---

## Next Steps

1. ✅ Auth flow complete
2. ✅ Edge Functions integration
3. 📱 Test in Xcode Simulator
4. 📱 Test on real device
5. 🚀 Deploy to App Store

---

## Testing Checklist

- [ ] App shows LoginView on first launch
- [ ] Login with test credentials works
- [ ] MainTabView appears after login
- [ ] Close and reopen app stays logged in
- [ ] Logout returns to LoginView
- [ ] All API calls use Edge Functions
- [ ] Error messages display correctly

---

**Your iOS app now has complete authentication with Supabase Edge Functions!** 🎉
