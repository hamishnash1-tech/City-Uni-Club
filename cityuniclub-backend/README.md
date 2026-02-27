# CityUniClub Backend

Supabase TypeScript backend with PostgreSQL for the City University Club iOS application.

## Features

- 🔐 **Authentication** - Login, logout, password reset, session management
- 👤 **Member Management** - Profile management, membership details
- 📅 **Events** - Event listings, bookings with meal selection
- 🍽️ **Dining** - Table reservations for breakfast and lunch
- 🌍 **Reciprocal Clubs** - Browse clubs worldwide, request Letters of Introduction
- 📰 **Club News** - News and announcements

## Tech Stack

- **Runtime**: Node.js with TypeScript (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: Custom session-based auth
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase CLI (for local development)
- Docker (for local Supabase)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Option A: Local Development (Recommended)

```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase migration up

# Generate TypeScript types
npm run db:generate
```

#### Option B: Cloud Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL in the SQL Editor
3. Copy your project URL and keys to `.env`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

### 4. Seed the Database

```bash
npm run db:seed
```

This creates:
- 3 test members (password: `password123`)
- 6 sample events
- 18 reciprocal clubs
- 5 news articles

### 5. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout (requires auth) |
| POST | `/api/auth/register` | Register new member |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (requires auth) |
| GET | `/api/auth/me` | Get current member (requires auth) |
| POST | `/api/auth/validate` | Validate session token |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/profile` | Get member profile (requires auth) |
| PUT | `/api/members/profile` | Update profile (requires auth) |
| GET | `/api/members/bookings` | Get event bookings (requires auth) |
| GET | `/api/members/reservations` | Get dining reservations (requires auth) |
| GET | `/api/members/loi-requests` | Get LOI requests (requires auth) |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events/:id/book` | Book event (requires auth) |
| PUT | `/api/events/bookings/:bookingId/cancel` | Cancel booking (requires auth) |

### Dining

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dining/reservations` | Get member reservations (requires auth) |
| POST | `/api/dining/reservations` | Create reservation (requires auth) |
| PUT | `/api/dining/reservations/:id` | Update reservation (requires auth) |
| DELETE | `/api/dining/reservations/:id` | Cancel reservation (requires auth) |

### Reciprocal Clubs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reciprocal/clubs` | List all clubs (requires auth) |
| GET | `/api/reciprocal/clubs/:id` | Get single club (requires auth) |
| GET | `/api/reciprocal/loi-requests` | Get LOI requests (requires auth) |
| POST | `/api/reciprocal/loi-requests` | Create LOI request (requires auth) |
| PUT | `/api/reciprocal/loi-requests/:id/cancel` | Cancel LOI request (requires auth) |

### News

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | List all news |
| GET | `/api/news/:id` | Get single article |
| POST | `/api/news` | Create article (requires auth) |
| PUT | `/api/news/:id` | Update article (requires auth) |
| DELETE | `/api/news/:id` | Delete article (requires auth) |

## Usage Examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "stephen.rayner@email.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "member": {
    "id": "uuid",
    "email": "stephen.rayner@email.com",
    "full_name": "Stephen Raymond Rayner",
    "first_name": "Stephen",
    "membership_number": "CUC-2019-0847",
    "membership_type": "Full Membership"
  },
  "session": {
    "token": "session-token",
    "expires_at": "2026-03-29T00:00:00.000Z"
  }
}
```

### Book an Event

```bash
curl -X POST http://localhost:3000/api/events/{event-id}/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "meal_option": "lunch",
    "guest_count": 2,
    "special_requests": "Vegetarian option please"
  }'
```

### Request Letter of Introduction

```bash
curl -X POST http://localhost:3000/api/reciprocal/loi-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "club_id": "club-uuid",
    "arrival_date": "2026-04-01",
    "departure_date": "2026-04-05",
    "purpose": "Business",
    "special_requests": "Need parking if available"
  }'
```

## Database Schema

### Core Tables

- `members` - Member accounts and credentials
- `member_profiles` - Extended profile information
- `events` - Club events (lunches, dinners, meetings)
- `event_bookings` - Event reservations
- `dining_reservations` - Dining room bookings
- `reciprocal_clubs` - Reciprocal club directory
- `loi_requests` - Letter of Introduction requests
- `club_news` - News and announcements
- `sessions` - Active user sessions
- `password_reset_tokens` - Password reset tokens

### Enums

- `membership_type` - Full, Associate, Junior, Senior, Corporate
- `event_type` - lunch, dinner, lunch_dinner, meeting, special
- `meal_option` - lunch, dinner
- `booking_status` - pending, confirmed, cancelled, completed
- `reservation_status` - pending, confirmed, cancelled, completed, no_show
- `loi_status` - pending, approved, rejected, sent
- `visit_purpose` - Business, Leisure, Both
- `news_category` - Dining, Special Offer, Special Event, Event, General

## Test Credentials

After seeding, use these credentials:

| Email | Password | Membership |
|-------|----------|------------|
| stephen.rayner@email.com | password123 | Full Membership |
| james.smith@email.com | password123 | Full Membership |
| emma.jones@email.com | password123 | Associate Membership |

## Development

### Generate Types

After schema changes:

```bash
npm run db:generate
```

### Run Migrations

```bash
npm run db:migrate
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Project Structure

```
cityuniclub-backend/
├── src/
│   ├── index.ts              # Express app entry
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── members.ts        # Member routes
│   │   ├── events.ts         # Event routes
│   │   ├── dining.ts         # Dining routes
│   │   ├── reciprocal.ts     # Reciprocal clubs routes
│   │   └── news.ts           # News routes
│   ├── middleware/
│   │   └── auth.ts           # Auth middleware
│   ├── types/
│   │   └── database.ts       # TypeScript types
│   ├── utils/
│   │   ├── crypto.ts         # Password hashing
│   │   └── validators.ts     # Zod schemas
│   └── seed/
│       └── index.ts          # Seed data
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── config.toml
└── package.json
```

## License

ISC
