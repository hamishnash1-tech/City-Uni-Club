# City University Club - Admin Portal

A React + TypeScript admin portal for managing the City University Club mobile apps and website.

## Features

- 🔐 **Authentication** - Secure login with Supabase
- 📊 **Dashboard** - Overview of members, events, reservations, and LOI requests
- 👥 **Members** - Manage member profiles and memberships
- 📅 **Events** - Create and manage club events
- 🍽️ **Dining** - Manage dining reservations
- 🏢 **Reciprocal Clubs** - Manage reciprocal club listings
- 📝 **LOI Requests** - Review and approve Letters of Introduction
- 📰 **News** - Publish club news and announcements

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://myfoyoyjtkqthjjvabmn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── AdminLayout.tsx
├── context/          # React context providers
│   └── AuthContext.tsx
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── PlaceholderPage.tsx
├── services/         # API and service layers
│   └── supabase.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main app component with routing
└── main.tsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist/` folder to Netlify

## API Integration

The admin portal uses Supabase Edge Functions for backend operations:

- `/admin-login` - Admin authentication
- `/admin-logout` - Logout
- `/members/*` - Member management
- `/events/*` - Event management
- `/dining/*` - Dining reservations
- `/clubs/*` - Reciprocal clubs
- `/loi-requests/*` - LOI request management
- `/news/*` - News management

## Security

- All API calls require authentication
- Admin roles are enforced server-side
- JWT tokens are stored securely in localStorage
- HTTPS is required for production

## License

Private - City University Club
