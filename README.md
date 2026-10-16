# StreakFlow

Build unstoppable streaks. A habit tracker that helps you stay consistent by tracking daily completions, streaks, and recovery with streak-freeze credits.

## Features

- **Habit tracking** — create, edit, and archive habits with custom icons and optional daily reminders.
- **Daily completion & streaks** — mark a habit done for your local date; current and best streaks are tracked per habit.
- **Streak freeze** — spend monthly freeze credits to protect a streak when you miss a day.
- **Dashboard analytics** — weekly progress chart, activity heatmap, and a habit leaderboard.
- **Accounts & profiles** — email/password sign-up, JWT sessions with refresh tokens, avatar upload.
- **Timezone-aware** — completions are recorded against your local date.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router 7, axios, framer-motion |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (local, via `scripts/local-db.sh`) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT access + refresh tokens, bcryptjs |
| Validation | Zod |

## Prerequisites

- Node.js 22+
- Bash (for the local database helper script)

## Local setup

Everything runs locally. Postgres is managed by a small helper script that creates a
user-owned cluster (no Docker, no sudo required).

### 1. Start the local database

```bash
bash scripts/local-db.sh init     # first time only — creates the cluster
bash scripts/local-db.sh start    # starts Postgres on 127.0.0.1:5433
```

Other commands: `bash scripts/local-db.sh stop` / `status`. Data lives in `~/.streakflow/pgdata`.

### 2. Backend

```bash
cd backend
cp .env.example .env      # already configured for the local database
npm install               # also runs `prisma generate`
npm run prisma:deploy     # apply migrations
npm run dev               # http://localhost:3000
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:migrate` | `prisma migrate dev` (create/apply new migrations) |
| `npm run prisma:deploy` | `prisma migrate deploy` (apply committed migrations) |

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # already configured for the local backend
npm install
npm run dev               # http://localhost:5173
```

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

Then open **http://localhost:5173** and sign up (or sign in) to create habits.

### Environment variables

Both apps read configuration from a local `.env` file (gitignored).

- **Backend** (`backend/.env`): `DATABASE_URL` points at the local Postgres
  (`postgresql://streakflow:streakflow@127.0.0.1:5433/streakflow`). JWT secrets,
  `FRONTEND_URL`, and the rest are pre-filled with local dev values.
- **Frontend** (`frontend/.env`): `VITE_API_URL` points at the local API. Only
  variables prefixed with `VITE_` are exposed to the browser.

The optional Cloudinary (avatar uploads) and Google OAuth integrations are blank
locally; email/password auth works without them.

## Project structure

```
streakflow/
├── scripts/
│   └── local-db.sh           # start/stop the local Postgres cluster
├── backend/                  # Express + Prisma API
│   ├── prisma/               # schema.prisma + committed migrations
│   └── src/
│       ├── config/           # Zod-validated env loading
│       ├── errors/           # AppError definitions
│       ├── lib/              # Prisma client
│       ├── middlewares/      # auth, validation, upload, error handling
│       ├── modules/          # auth, habits, stats, users (routes/controller/service/schemas)
│       ├── routes/           # /api/v1 router
│       └── utils/            # jwt, password, date, cloudinary, http helpers
└── frontend/                 # React + Vite SPA
    └── src/
        ├── api/              # axios client + endpoint modules
        ├── components/       # UI, grouped by feature (home, dashboard, streak)
        ├── hooks/            # auth hydration, habit reminders
        ├── pages/            # routed pages
        ├── routes/           # public/protected route guards
        ├── store/            # Zustand stores (auth, habits, stats)
        └── utils/            # error helpers
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

- Automated tests (the backend `test` script is currently a stub).
- Rate limiting on auth routes.
- Google sign-in and avatar upload are not wired up for local dev (need external credentials).

## License

MIT — see [LICENSE](LICENSE).
