# StreakFlow

Build unstoppable streaks. A habit tracker that helps you stay consistent by tracking daily completions, streaks, and recovery with streak-freeze credits.

> Live: https://streakflow.dpdns.org · API: https://api.streakflow.dpdns.org

## Features

- **Habit tracking** — create, edit, and archive habits with custom icons and optional daily reminders.
- **Daily completion & streaks** — mark a habit done for your local date; current and best streaks are tracked per habit.
- **Streak freeze** — spend monthly freeze credits to protect a streak when you miss a day.
- **Dashboard analytics** — weekly progress chart, activity heatmap, and a habit leaderboard.
- **Accounts & profiles** — email/password or "Sign in with Google", JWT-based sessions with refresh tokens, avatar upload.
- **Timezone-aware** — completions are recorded against your local date.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router 7, axios, framer-motion |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT access + refresh tokens, bcryptjs, Google OAuth (`google-auth-library`) |
| Validation | Zod |
| Media | Cloudinary (avatar uploads via multer) |
| Hosting | Docker (per-app `Dockerfile`) |

## Getting started

### Prerequisites

- Node.js 22+
- A PostgreSQL database (local, or a free Neon/Supabase instance)

### Backend

```bash
cd backend
cp .env.example .env      # then fill in the values
npm install               # also runs `prisma generate`
npm run prisma:migrate    # create/apply migrations
npm run dev               # http://localhost:3000
```

Useful scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:deploy` | `prisma migrate deploy` (production) |

### Frontend

```bash
cd frontend
cp .env.example .env      # then fill in the values
npm install
npm run dev               # http://localhost:5173
```

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

### Environment variables

Both apps read configuration from a local `.env` file (gitignored). Copy the matching `.env.example` and fill it in.

- **Backend** requires `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`; `FRONTEND_URL` is used for CORS. Cloudinary and Google vars are optional.
- **Frontend** requires `VITE_API_URL`. Only variables prefixed with `VITE_` are exposed to the browser.

> ⚠️ Generate strong random values for the JWT secrets (e.g. `openssl rand -base64 48`). Never commit `.env`.

## Demo account

Sign up at `/signup` to create an account, or use the deployed demo instance if one is provided.

## Project structure

```
streakflow/
├── backend/                 # Express + Prisma API
│   ├── prisma/              # schema.prisma + committed migrations
│   └── src/
│       ├── config/          # Zod-validated env loading
│       ├── errors/          # AppError definitions
│       ├── lib/             # Prisma client
│       ├── middlewares/     # auth, validation, upload, error handling
│       ├── modules/         # auth, habits, stats, users (routes/controller/service/schemas)
│       ├── routes/          # /api/v1 router
│       └── utils/           # jwt, password, date, cloudinary, http helpers
└── frontend/                # React + Vite SPA
    └── src/
        ├── api/             # axios client + endpoint modules
        ├── components/      # UI, grouped by feature (home, dashboard, streak)
        ├── hooks/           # auth hydration, habit reminders
        ├── pages/           # routed pages
        ├── routes/          # public/protected route guards
        └── store/           # Zustand stores (auth, habits, stats)
```

## API overview

Base URL: `/api/v1` — health check at `GET /health`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | – | Service info |
| POST | `/auth/register` | – | Create an account |
| POST | `/auth/login` | – | Email/password login |
| POST | `/auth/google` | – | Sign in with Google |
| POST | `/auth/refresh` | cookie | Rotate the access token |
| POST | `/auth/logout` | – | Revoke the refresh token |
| GET | `/auth/me` | ✅ | Current user |
| PATCH | `/auth/me` | ✅ | Update profile / avatar |
| GET | `/habits` | ✅ | List habits |
| POST | `/habits` | ✅ | Create a habit |
| PATCH | `/habits/:habitId` | ✅ | Update a habit |
| DELETE | `/habits/:habitId` | ✅ | Archive a habit |
| POST | `/habits/:habitId/complete-today` | ✅ | Mark done for today |
| POST | `/habits/:habitId/freeze-today` | ✅ | Use a streak freeze |
| GET | `/stats/dashboard` | ✅ | Dashboard summary |
| GET | `/stats/weekly-progress` | ✅ | Weekly progress |
| GET | `/stats/activity-heatmap` | ✅ | Activity heatmap |
| GET | `/stats/habit-leaderboard` | ✅ | Habit leaderboard |

## Decisions and trade-offs

- **JWT access + refresh tokens** keep the API stateless while allowing short-lived access tokens; refresh tokens are hashed and stored server-side so they can be revoked.
- **Prisma with the pg adapter** gives typed queries and committed migrations against Postgres.
- **Zod** validates every request body in one place (`validateRequest` middleware) for consistent error shapes.
- **Timezone-aware completions** store a `localDate` string alongside the timezone, so streaks follow the user's day rather than UTC.

## Roadmap / known gaps

- Automated tests (the backend `test` script is currently a stub) and CI.
- Rate limiting on auth routes.
- Screenshots in `docs/`.

## License

MIT — see [LICENSE](LICENSE).
