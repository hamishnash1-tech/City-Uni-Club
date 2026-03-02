# City University Club Website

A modern React + TypeScript + Redux website for City University Club, featuring member authentication and reciprocal clubs management.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Deployment**: Vercel

## Features

### Public Pages
- ✅ Home page with club information
- ✅ Responsive navigation
- ✅ Member login

### Member Area (Login Required)
- ✅ Reciprocal clubs directory (450+ clubs)
- ✅ Region filtering
- ✅ Letter of Introduction (LOI) request system
- ✅ Protected routes

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd cityuniclub-website
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.tsx
│   └── Footer.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── ReciprocalClubs.tsx
│   └── LOIRequest.tsx
├── slices/             # Redux slices
│   ├── authSlice.ts
│   ├── memberSlice.ts
│   └── uiSlice.ts
├── services/           # API services
│   ├── api.ts
│   └── supabase.ts
├── store/              # Redux store
│   └── index.ts
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## API Integration

The website connects to Supabase Edge Functions:

- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /clubs` - Get reciprocal clubs
- `POST /loi-requests` - Create LOI request
- `GET /events` - Get club events
- `GET /news` - Get club news

## Member Credentials

Test accounts are pre-loaded with:
- **Password**: `password123`

Members can change their password after logging in.

## Environment Variables

Create a `.env` file if needed:

```env
VITE_SUPABASE_URL=https://myfoyoyjtkqthjjvabmn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Status

- ✅ Frontend: Ready for Vercel
- ✅ Backend: Supabase Edge Functions deployed
- ✅ Database: PostgreSQL on Supabase
- ✅ Members: 447 contacts uploaded

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code |

## License

ISC
