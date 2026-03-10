# CityUniClub Android App - AI Prompt Plan

## Project Overview

**Goal:** Create a complete Kotlin Android clone of the CityUniClub iOS SwiftUI app.

**App Type:** Private members club app for City University Club, London
**Target:** Android 10+ (API 29+)
**Architecture:** MVVM with Jetpack Compose
**Backend:** Supabase Edge Functions (same as iOS)

---

## Feature Breakdown

### Core Features
1. **Authentication System**
   - Login with email/password
   - Session management (token-based)
   - Splash screen with auth check
   - Logout functionality

2. **Main Navigation**
   - Bottom navigation with 4 tabs: Home, Dining, Events, More

3. **Home Screen**
   - Welcome message with member name
   - Membership card display (digital card)
   - Background image with overlay

4. **Dining Feature**
   - Menu display (Breakfast/Lunch toggle)
   - Table reservation system
   - Date picker (7-day scroll)
   - Time slot selection
   - Guest counter
   - Reservation confirmation

5. **Events Feature**
   - Event listing with filtering
   - Event booking system
   - Meal selection (Lunch/Dinner)
   - Guest count selection
   - Special requests
   - Booking confirmation

6. **More/Profile Section**
   - Contact information
   - Membership profile view
   - Edit profile functionality
   - Change password
   - Reciprocal clubs directory
   - Letter of Introduction (LOI) requests
   - Club news
   - Settings

---

## Design System

### Colors (from iOS app)
- **Oxford Blue:** `#002147` (Primary)
- **Cambridge Blue:** `#8AB8D6` (Secondary/Accent)
- **Card White:** `#FFFFFF`
- **Secondary Text:** `#444444`
- **Address Gray:** `#666666`
- **Dark Text:** `#2E4752`

### Typography
- Serif fonts for headings (similar to iOS `.design: .serif`)
- Sans-serif for body text
- Consistent weight hierarchy

---

## AI Prompts (Execute in Order)

### PROMPT 1: Project Setup & Architecture

```
Create a new Android project called "CityUniClub" with the following specifications:

**Project Configuration:**
- Minimum SDK: API 29 (Android 10)
- Target SDK: API 34 (Android 14)
- Language: Kotlin
- Build system: Gradle with Kotlin DSL

**Dependencies to include:**
1. Jetpack Compose BOM for UI
2. Navigation Compose for navigation
3. ViewModel Compose for MVVM
4. Retrofit for networking
5. Kotlinx Serialization for JSON
6. DataStore for local storage
7. Coil for image loading
8. Accompanist for additional Compose utilities

**Project Structure:**
Create the following package structure:
- com.cityuniclub.app (main app)
- com.cityuniclub.ui.theme (theme/colors)
- com.cityuniclub.ui.navigation (navigation graph)
- com.cityuniclub.ui.screens (all screens)
- com.cityuniclub.data (data layer)
- com.cityuniclub.data.api (API interfaces)
- com.cityuniclub.data.models (data classes)
- com.cityuniclub.data.repository (repositories)
- com.cityuniclub.domain (domain layer)
- com.cityuniclub.domain.usecases (use cases)
- com.cityuniclub.presentation (viewmodels)

**Theme Setup:**
Create a Color.kt file with these exact colors:
- oxfordBlue: Color(0xFF002147)
- cambridgeBlue: Color(0xFF8AB8D6)
- cardWhite: Color(0xFFFFFFFF)
- secondaryText: Color(0xFF444444)
- addressGray: Color(0xFF666666)
- darkText: Color(0xFF2E4752)
- lightCambridge: Color(0xFFE6FAFA)

Create Typography.kt with:
- Default font: Sans-serif
- Serif font family for headings
- Consistent text styles matching iOS app

Provide the complete build.gradle.kts files (project and app level), all dependency declarations, and the initial theme setup files.
```

---

### PROMPT 2: Data Models & Network Layer

```
Create the data layer for the CityUniClub Android app with the following:

**Data Models (create as Kotlin data classes with @Serializable):**

1. Member.kt:
   - id: String
   - email: String
   - fullName: String (full_name)
   - firstName: String (first_name)
   - phoneNumber: String? (phone_number)
   - membershipNumber: String (membership_number)
   - membershipType: String (membership_type)
   - memberSince: String? (member_since)
   - memberUntil: String? (member_until)
   - isActive: Boolean? (is_active)

2. Session.kt:
   - token: String
   - expiresAt: String (expires_at)

3. AuthResponse.kt:
   - member: Member
   - session: Session

4. Event.kt:
   - id: String
   - title: String
   - description: String?
   - eventType: String (event_type)
   - eventDate: String (event_date)
   - lunchTime: String? (lunch_time)
   - dinnerTime: String? (dinner_time)
   - pricePerPerson: Double (price_per_person)
   - maxCapacity: Int? (max_capacity)
   - isTba: Boolean (is_tba)
   - isActive: Boolean (is_active)
   - Add computed property: displayDate (formatted date)

5. EventBooking.kt:
   - id: String
   - eventId: String (event_id)
   - memberId: String (member_id)
   - mealOption: String? (meal_option)
   - guestCount: Int (guest_count)
   - specialRequests: String? (special_requests)
   - totalPrice: Double (total_price)
   - status: String
   - bookedAt: String (booked_at)
   - event: Event?

6. DiningReservation.kt:
   - Similar structure to iOS DiningReservation

7. ClubNews.kt:
   - Similar structure to iOS ClubNews

8. ReciprocalClub.kt:
   - Similar structure to iOS ReciprocalClub

9. LoiRequest.kt:
   - Similar structure to iOS LoiRequest

**API Service (APIService.kt):**
Create a Retrofit-based API service with:
- Base URL: https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1
- Timeout: 30 seconds
- JSON serialization with kotlinx.serialization

**API Endpoints to implement:**
- POST /login
- POST /logout
- GET /me
- GET /events
- POST /events/book
- PUT /events/bookings/{id}/cancel
- GET /dining/reservations
- POST /dining/reservations
- DELETE /dining/reservations/{id}
- GET /news
- GET /clubs
- POST /loi-requests
- GET /reciprocal/loi-requests
- GET /members/profile
- PUT /members/profile
- POST /change-password
- POST /auth/forgot-password

**Error Handling:**
Create sealed class APIError matching iOS error handling:
- InvalidURL
- NoData
- DecodingError
- NetworkError
- HttpError(statusCode, message)
- Unauthorized
- ServerError

Provide all files with proper error handling and coroutines support.
```

---

### PROMPT 3: Authentication UI & Logic

```
Create the authentication flow for the CityUniClub Android app:

**1. Splash Screen (SplashScreen.kt):**
- Full screen Oxford Blue background
- CUC logo (120x120) with fade-in animation
- Club name in serif font
- Address in Cambridge Blue
- Loading indicator at bottom
- Auto-navigate based on auth state after 2 seconds

**2. Login Screen (LoginScreen.kt):**
- Oxford Blue background
- Logo (100x100) at top
- "Welcome" text (28sp, light)
- "City University Club" (16sp, serif, Cambridge Blue)
- Email field with envelope icon
- Password field with lock icon and visibility toggle
- Error message display with icon
- Login button with gradient (Cambridge Blue)
- "Forgot Password?" link
- Help text with secretary email
- Loading state with disabled button

**3. AuthManager/Repository:**
Create an AuthRepository with:
- login(email, password): suspend function
- logout(): suspend function
- checkExistingSession(): suspend function
- validateToken(token): suspend function
- currentMember: StateFlow<Member?>
- isAuthenticated: StateFlow<Boolean>
- isLoading: StateFlow<Boolean>

Use DataStore for token persistence.

**4. LoginViewModel:**
- State: email, password, isLoading, error, showPassword
- Functions: onEmailChange, onPasswordChange, onLoginClick, togglePasswordVisibility
- Navigate to MainApp on success

**5. Navigation:**
Set up NavHost with:
- splash -> login OR mainApp (based on auth)
- login -> mainApp (on success)

Include all animations, proper state management, and error handling matching the iOS app behavior.
```

---

### PROMPT 4: Main Navigation & Home Screen

```
Create the main app structure and home screen:

**1. MainTabView (MainApp.kt):**
Bottom navigation with 4 tabs:
- Home (house icon)
- Dining (fork.knife icon)
- Events (calendar icon)
- More (ellipsis icon)

Styling:
- White tab bar background
- Gray for unselected items
- Oxford Blue for selected items
- Cambridge Blue accent

**2. Home Screen (HomeScreen.kt):**
- Background: Full-screen image with Oxford Blue overlay (35% opacity)
- Top section:
  - CUC logo (80x80)
  - "Welcome" text (16sp, Cambridge Blue)
  - Member first name (32sp, light, white)
- Bottom section:
  - Membership card (identical to iOS design)

**3. Membership Card Component:**
Create a reusable MembershipCard composable:
- White card with rounded corners (20)
- Header: CUC monogram (58x72) + club name + address
- Member name section with serif font
- Footer: Member until date + Secretary name
- Gradient border stroke
- Multiple shadows for depth effect
- Width: 400dp, proper padding

**4. HomeViewModel:**
- Get current member from AuthRepository
- Format memberUntil date as "MMMM yyyy"
- Handle null states gracefully

Include proper responsive design, dark mode support, and smooth animations.
```

---

### PROMPT 5: Dining Feature

```
Create the Dining screen with reservation functionality:

**1. DiningScreen.kt:**
- Oxford Blue background
- "Dining" header (20sp, semibold, white)
- Meal type toggle (Breakfast/Lunch) - Cambridge Blue when selected
- Scrollable content area

**2. Menu Card Component:**
Create MenuCard composable:
- White card with shadow
- For Breakfast:
  - Full English, Continental, Vegan/Vegetarian, Smoked Salmon, Bacon/Sausage Sandwich
- For Lunch:
  - Starters section with divider
  - Mains section with divider
  - Desserts & Savouries section
- No prices displayed
- Serif fonts for section headers

**3. Reservation Section:**
Create ReservationSection composable:
- "Reserve a Table" header (22sp, serif)
- Date picker: Horizontal scroll of 7 days
  - Each day: Day name, number, month (60x65)
  - Selected: Oxford Blue background
- Time selection: Grid layout
  - Breakfast: 09:00-11:00 (30min intervals)
  - Lunch: 12:00-14:30 (30min intervals)
  - Selected: Oxford Blue background
- Guest counter:
  - Minus/Plus buttons (Oxford Blue)
  - Counter display (28sp, bold)
  - Range: 1-10 guests
- Confirm button: Oxford Blue gradient
- Summary text showing reservation details

**4. DiningViewModel:**
- State: selectedMealType, selectedDate, selectedTime, guestCount, isLoading
- Functions: selectMealType, selectDate, selectTime, incrementGuests, decrementGuests, makeReservation
- Create reservation via API

Include proper validation, loading states, and success/error feedback.
```

---

### PROMPT 6: Events Feature

```
Create the Events screen with booking functionality:

**1. EventsScreen.kt:**
- Oxford Blue background
- "Club Events" header (20sp, semibold, white)
- Loading state with ProgressIndicator
- Error state with retry button
- Empty state when no events
- ScrollView with LazyVGrid of EventCards

**2. EventCard Component:**
Create EventCard composable:
- White card with shadow
- Top accent bar with event type icon and label:
  - Lunch: sun.max.fill, orange
  - Dinner: moon.stars.fill, indigo
  - Lunch & Dinner: sun.and.horizon.fill, Cambridge Blue
  - Meeting: person.2.fill, gold
  - Special: star.fill, pink
- TBA badge if applicable
- Event title (18sp, serif, Oxford Blue)
- Date with calendar icon (Cambridge Blue)
- Time indicators for lunch/dinner events
- "Book Tickets" button (Oxford Blue)
- Hover/press animation

**3. Event Booking Sheet:**
Create BookingSheet composable (ModalBottomSheet):
- Header: "Book Tickets" + event title + date
- Meal selection (if lunch_dinner type):
  - Lunch (12:30 PM) with sun icon
  - Dinner (7:00 PM) with moon icon
- Guest counter (1-10)
- Special requests text field
- Price summary
- Cancel and Confirm buttons
- Loading state during booking

**4. EventsViewModel:**
- State: events, isLoading, error, selectedEvent, showBookingSheet, guestCount, selectedMeal, specialRequests
- Functions: loadEvents, selectEvent, bookEvent, cancelBooking
- Filter out past events
- Format dates properly

Include booking confirmation dialog and proper error handling.
```

---

### PROMPT 7: More/Profile Features

```
Create the More screen and profile management:

**1. MoreScreen.kt:**
- Oxford Blue background
- ScrollView with sections:

**Contact Section:**
- "CONTACT" header (20sp, serif)
- Address with location icon
- Hours with clock icon
- Phone with phone icon
- Email with envelope icon
- White card with Cambridge Blue border

**Membership Profile Button:**
- "MEMBERSHIP PROFILE" header
- Member name with person icon
- Chevron right
- Navigate to MembershipProfileScreen

**Reciprocal Clubs Button:**
- "RECIPROCAL CLUBS" header
- Description text
- "Request Letter of Introduction" button
- Navigate to ReciprocalClubsScreen

**Club News Button:**
- "NEWS" header
- News item previews (3 items)
- Navigate to ClubNewsScreen

**2. MembershipProfileScreen.kt:**
- Membership card at top (same as HomeScreen)
- Profile Information section:
  - Full Name, Email, Phone with icons
  - Edit button
- Account Settings section:
  - Change Password
  - Notifications
  - Terms & Conditions
  - Privacy Policy
- Logout button (red gradient)
- Logout confirmation dialog

**3. EditProfileScreen.kt:**
- Full Name field
- First Name field
- Email field
- Phone Number field
- Save Changes button
- Success/Error dialogs
- Cancel button

**4. ChangePasswordScreen.kt:**
- Password requirements card
- Current Password field with visibility toggle
- New Password field with visibility toggle
- Confirm Password field with visibility toggle
- Validation (min 6 chars, match)
- Change Password button
- Success/Error dialogs

**5. MoreViewModel:**
- Get member data from AuthRepository
- Handle profile updates
- Handle password changes
- Logout functionality

Include proper navigation and state management.
```

---

### PROMPT 8: Reciprocal Clubs & LOI Requests

```
Create the Reciprocal Clubs directory and LOI request flow:

**1. ReciprocalClubsScreen.kt:**
- Oxford Blue background
- Header with back button
- Search bar (optional)
- Region filter chips (horizontal scroll):
  - All, UK, Ireland, Australia, Canada, USA, Europe, Asia, Africa, Americas, Oceania, Middle East, South America
- Club list with sections by region
- Each club shows: name, location, country, note (if any)

**2. Club List Item:**
Create ClubListItem composable:
- Club name (16sp, semibold)
- Location with icon
- Country in Cambridge Blue
- Note in italics (if present)
- Chevron right
- Tap to open LOI request

**3. LOIRequestScreen.kt:**
Create LOI request form:
- Club header card:
  - Globe icon in circle
  - Club name (22sp, serif)
  - Location and country
  - Note (if present)
- Visit Dates section:
  - Arrival Date picker (graphical style)
  - Departure Date picker (graphical style, min = arrival)
  - Duration calculation display
- Purpose of Visit section:
  - Business, Leisure, Both (toggle buttons)
- Special Requests section:
  - TextEditor for additional notes
  - Hint text
- Important Notice card:
  - Submit 7 days before arrival
  - 3-5 business days processing
- Submit button: "Request Letter of Introduction"
- Confirmation dialog on success

**4. ReciprocalClubsViewModel:**
- State: clubs, filteredClubs, selectedRegion, searchText, selectedClub, isLoading
- Functions: filterByRegion, searchClubs, selectClub, submitLoiRequest
- Load clubs from API (or hardcoded list from iOS)
- Submit LOI request via API

Include the full hardcoded club list from the iOS app (450+ clubs).
```

---

### PROMPT 9: Club News & Additional Screens

```
Create the Club News screen and finalize the app:

**1. ClubNewsScreen.kt:**
- Oxford Blue background
- Header with back button: "Club News"
- ScrollView with news cards

**2. News Card Component:**
Create NewsCard composable:
- White card with shadow
- Category badge (Cambridge Blue capsule)
- Date (secondary text)
- Title (17sp, serif, Oxford Blue)
- Content preview (14sp)
- "Read More" button with arrow
- Proper line spacing

**3. News Items (hardcoded for now):**
- "Dining Room open 23 February for Dinner" - February 2026
- "Free Gin Friday - every Friday at lunch" - Weekly
- "Sri Lankan Lunch - 25 February" - February 2026
- "Wine Tasting Evening - 8 March" - March 2026
- "Easter Sunday Roast" - April 2026

**4. App-Wide Components:**

Create reusable components:
- TopAppBar variants
- LoadingIndicator
- ErrorView
- EmptyState
- PrimaryButton
- SecondaryButton
- InputField variants
- Date picker utilities

**5. Final Integration:**
- Ensure all navigation works
- Test all user flows
- Add proper error handling
- Implement pull-to-refresh where appropriate
- Add proper back navigation handling
- Test on different screen sizes

**6. Assets:**
- Add placeholder images for:
  - cuc-logo
  - cuc-monogram
  - cuc-building (background)
- Or use ImageVector icons as placeholders

Provide all remaining screens and components to complete the app.
```

---

## Implementation Order

1. ✅ **Prompt 1**: Project setup (dependencies, structure, theme)
2. ✅ **Prompt 2**: Data models & API layer
3. ✅ **Prompt 3**: Authentication (Splash, Login, AuthManager)
4. ✅ **Prompt 4**: Main navigation & Home screen
5. ✅ **Prompt 5**: Dining feature
6. ✅ **Prompt 6**: Events feature
7. ✅ **Prompt 7**: More screen & Profile management
8. ✅ **Prompt 8**: Reciprocal Clubs & LOI requests
9. ✅ **Prompt 9**: Club News & final integration

---

## Notes

- All colors should match the iOS app exactly
- Animations should be smooth and match iOS transitions
- Use Material 3 components where appropriate
- Maintain the elegant, premium feel of the club
- Test authentication flow thoroughly
- Handle network errors gracefully
- Add proper loading states
- Ensure proper memory management with Compose
