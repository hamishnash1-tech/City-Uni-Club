# CityUniClub Android App

Complete Kotlin Android clone of the City University Club iOS app.

## 📱 Features

- ✅ **Login** - Email/password authentication
- ✅ **Home** - Membership card display
- ✅ **Dining** - Table reservations
- ✅ **Events** - Club events listing
- ✅ **News** - Club news
- ✅ **Reciprocal Clubs** - 466 clubs worldwide with LOI requests

## 🛠️ Tech Stack

- **Language**: Kotlin
- **Architecture**: MVVM
- **UI**: ViewBinding, Material Design
- **Networking**: Retrofit + OkHttp
- **Database**: Room (local storage)
- **Image Loading**: Glide
- **Navigation**: Bottom Navigation View

## 🚀 Setup

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK 34

### Installation

1. **Open in Android Studio**
   ```
   File → Open → Select "CityUniClub Android" folder
   ```

2. **Sync Gradle**
   ```
   File → Sync Project with Gradle Files
   ```

3. **Run on Device/Emulator**
   ```
   Click Run button or Shift+F10
   ```

## 📁 Project Structure

```
app/src/main/
├── java/com/cityuniclub/
│   ├── api/
│   │   ├── ApiConstants.kt      # API endpoints
│   │   └── ApiService.kt         # Retrofit interface
│   ├── model/
│   │   └── Models.kt             # Data classes
│   ├── ui/
│   │   ├── activity/
│   │   │   ├── MainActivity.kt   # Main app container
│   │   │   └── LoginActivity.kt  # Login screen
│   │   └── fragment/
│   │       ├── HomeFragment.kt
│   │       ├── DiningFragment.kt
│   │       ├── EventsFragment.kt
│   │       ├── NewsFragment.kt
│   │       └── ClubsFragment.kt
│   └── util/
│       └── Preferences.kt        # Shared preferences
├── res/
│   ├── layout/                   # XML layouts
│   ├── values/                   # Colors, strings, themes
│   ├── menu/                     # Bottom nav menu
│   └── drawable/                 # Icons
└── AndroidManifest.xml
```

## 🎨 Design

### Colors (Matching iOS App)
```xml
<color name="oxford_blue">#0A2342</color>
<color name="cambridge_blue">#A3C9D8</color>
<color name="card_white">#F8F9FA</color>
```

### Bottom Navigation
- 🏠 Home
- 🍽️ Dining
- 📅 Events
- 📰 News
- 🌍 Clubs

## 🔐 Authentication

### Login Credentials
```
Email: hamishnash@yahoo.co.uk
Password: password123
```

### API Integration
- **Base URL**: `https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/`
- **Endpoints**: login, logout, events, news, clubs, loi-requests

## 📊 Data

### Reciprocal Clubs: 466 Clubs
- United Kingdom: 50+
- USA: 150+
- India: 70+
- Canada: 40+
- Australia: 25+
- Europe: 40+
- Asia: 30+
- Africa: 20+
- Other regions: 40+

## 🔧 Configuration

### API Constants (ApiConstants.kt)
```kotlin
const val BASE_URL = "https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/"
```

### Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 📱 Screens

1. **Login Screen**
   - Email input
   - Password input
   - Login button
   - Error handling

2. **Home Screen**
   - Welcome message
   - Membership card
   - Member details

3. **Dining Screen**
   - Breakfast/Lunch toggle
   - Date picker
   - Time selection
   - Guest count
   - Reservation form

4. **Events Screen**
   - Events list
   - Event details
   - Booking button

5. **News Screen**
   - News list
   - News details

6. **Clubs Screen**
   - Search bar
   - Region filters
   - Clubs list
   - LOI request

## 🧪 Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

## 📦 Build

```bash
# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease
```

## 🚀 Deploy

1. **Generate Signed APK**
   ```
   Build → Generate Signed Bundle / APK
   ```

2. **Upload to Play Store** or distribute directly

## 📝 Notes

- Minimum SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)
- Uses Material Design 3 components
- Follows Android best practices

## 🔄 Sync with iOS

Both iOS and Android apps share:
- Same API endpoints
- Same data models
- Same color scheme
- Same club database (466 clubs)
- Same features

## 📄 License

ISC
