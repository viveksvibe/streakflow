# StreakFlow

> Build unstoppable streaks. A production-ready full-stack habit tracking application designed to help users establish consistent daily habits, protect momentum with monthly streak freeze credits, and visualize long-term consistency.

---

## Features

- **Habit Management** — Create, edit, and archive habits with custom icons, color tags, and optional scheduled reminders.
- **Timezone-Aware Completions** — Completions are evaluated against the user's local calendar day, ensuring accurate streak calculation regardless of UTC differences.
- **Streak Freeze Protection** — Missed a day? Consume auto-replenished monthly freeze credits to preserve your active streak without resetting to zero.
- **Rich Dashboard & Visualizations** — Weekly completion bar charts, GitHub-style 365-day activity heatmaps, and habit consistency leaderboards.
- **Secure Authentication** — Dual-token session management (short-lived JWT access tokens + rotated, cryptographically hashed refresh tokens stored in `httpOnly` cookies), password hashing via bcryptjs, and optional Google OAuth sign-in.
- **Production Hardened** — Express 5 with Helmet security headers, Pino structured logging with request ID tracing, sliding-window rate limiting, automated bot detection, and recursive XSS/HTML input sanitization.
- **Accessible & Compliant** — WCAG AA compliant contrast, keyboard-accessible controls, screen reader labels, responsive mobile navigation, Cookie Consent banner, Privacy Policy, and Terms of Service.

---

## Tech Stack

### Frontend
| Component | Technology |
| --- | --- |
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens |
| State Management | [Zustand](https://zustand.docs.pmnd.rs/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Icons & Notifications | [Lucide React](https://lucide.dev/), [react-hot-toast](https://react-hot-toast.com/) |
| HTTP Client | [Axios](https://axios-http.com/) with interceptors |

### Backend
| Component | Technology |
| --- | --- |
| Runtime & Framework | [Node.js](https://nodejs.org/) (>= 22), [Express 5](https://expressjs.com/) |
| Language | [TypeScript](https://www.typescriptlang.org/) (ESM, NodeNext) |
| Database | [PostgreSQL](https://www.postgresql.org/) (local cluster on port 5433) |
| ORM | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` driver adapter |
| Validation | [Zod](https://zod.dev/) |
| Security | Helmet, custom sliding-window rate limiter, bot detection, input sanitizer |
| Observability | [Pino](https://getpino.io/) structured logging with `x-request-id` correlation |
| Testing | [Vitest](https://vitest.dev/), Supertest |

---

## Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **PostgreSQL** instance running locally on port `5433` (or Docker)

---

## Getting Started

### 1. Database Setup

Ensure PostgreSQL is listening on port `5433`:

#### Option A: Run via Docker (Recommended)
```bash
docker run --name streakflow-db \
  -e POSTGRES_USER=streakflow \
  -e POSTGRES_PASSWORD=streakflow \
  -e POSTGRES_DB=streakflow \
  -p 5433:5432 \
  -d postgres:18-alpine
```

#### Option B: Local PostgreSQL Installation
Configure a local database named `streakflow` owned by user `streakflow` (password: `streakflow`) configured to accept connections on `127.0.0.1:5433`.

---

### 2. Backend Setup

```bash
cd backend

# Copy sample environment configuration
cp .env.example .env

# Install dependencies (automatically runs prisma generate)
npm install

# Run database migrations
npm run prisma:deploy

# Start backend in development mode (hot-reloads on port 3000)
npm run dev
```

#### Available Backend Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start development server with `tsx watch` |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm run start` | Run compiled production bundle from `dist/index.js` |
| `npm run typecheck` | Run type checking without emitting files (`tsc --noEmit`) |
| `npm test` | Run Vitest unit and integration test suite |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:ui` | Open Vitest graphical test dashboard in browser |
| `npm run prisma:migrate`| Generate and apply local migrations (`prisma migrate dev`) |
| `npm run prisma:deploy` | Apply committed migrations (`prisma migrate deploy`) |

---

### 3. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Copy sample environment configuration
cp .env.example .env

# Install dependencies
npm install

# Start Vite development server (hot-reloads on port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

#### Available Frontend Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server on `http://localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) and build for production (`dist/`) |
| `npm run preview` | Locally preview production build |
| `npm run lint` | Run ESLint check |

---

## Project Structure

```
streakflow/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # Committed SQL migrations
│   │   └── schema.prisma          # Database models (User, Habit, Completion, RefreshToken)
│   └── src/
│       ├── config/                # Environment schema validation (env.ts)
│       ├── errors/                # Typed AppError classes
│       ├── lib/                   # Prisma client, Pino logger
│       ├── middlewares/           # Auth, bot protection, rate limit, request-id, sanitize, errors
│       ├── modules/
│       │   ├── auth/              # Auth routes, schemas, controller, and token rotation
│       │   ├── habits/            # Habit CRUD, completion, and freeze mechanics
│       │   ├── stats/             # Dashboard metrics, heatmap, leaderboard
│       │   └── users/             # Profile updates, avatar uploads, freeze credit refill
│       ├── routes/                # Central API router (/api/v1)
│       ├── tests/                 # Unit and integration test suites
│       └── utils/                 # JWT, password, date/timezone math, HTTP response helpers
├── frontend/
│   ├── public/                    # Favicon, icons, static assets
│   └── src/
│       ├── api/                   # Axios client & typed API endpoints
│       ├── components/
│       │   ├── common/            # Shared primitives (Navbar, Loader, CookieConsent, etc.)
│       │   ├── dashboard/         # Dashboard statistics, heatmap, weekly chart, leaderboard
│       │   ├── home/              # Habit lists, add/edit/delete modals, daily progress
│       │   └── streak/            # Streak cards, freeze usage UI, completion grid
│       ├── hooks/                 # Theme, app hydration, navigation helpers
│       ├── pages/                 # Home, Dashboard, Streaks, Profile, SignIn, SignUp, Legal, 404
│       ├── routes/                # Protected and public route guards
│       ├── store/                 # Zustand stores (authStore, habitStore)
│       └── index.css              # Tailwind v4 theme configuration & design tokens
├── .gitignore                     # Monorepo git exclusion configuration
└── README.md                      # Project documentation
```

---

## API Reference

All application endpoints are served under `/api/v1`. Standard health endpoint is available at `/health`.

Every response adheres to a consistent response envelope:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "requestId": "uuid"
}
```

### Endpoints

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | System health check and database ping |
| `POST` | `/api/v1/auth/register` | No | Register user account |
| `POST` | `/api/v1/auth/login` | No | Authenticate with email/password |
| `POST` | `/api/v1/auth/google` | No | Authenticate via Google ID Token |
| `POST` | `/api/v1/auth/refresh` | Cookie | Rotate JWT token pair |
| `POST` | `/api/v1/auth/logout` | No | Invalidate refresh token and clear cookies |
| `GET` | `/api/v1/auth/me` | Bearer / Cookie | Get current authenticated user profile |
| `PATCH`| `/api/v1/auth/me` | Bearer / Cookie | Update user profile / avatar |
| `GET` | `/api/v1/habits` | Bearer / Cookie | List user habits with today's completion status |
| `POST` | `/api/v1/habits` | Bearer / Cookie | Create a new habit |
| `PATCH`| `/api/v1/habits/:habitId` | Bearer / Cookie | Update habit name, icon, or reminder |
| `DELETE`| `/api/v1/habits/:habitId` | Bearer / Cookie | Soft-delete / archive habit |
| `POST` | `/api/v1/habits/:habitId/complete-today` | Bearer / Cookie | Toggle daily habit completion |
| `POST` | `/api/v1/habits/:habitId/freeze-today` | Bearer / Cookie | Spend freeze credit to protect streak |
| `GET` | `/api/v1/stats/dashboard` | Bearer / Cookie | Get overall user progress and streaks |
| `GET` | `/api/v1/stats/weekly-progress` | Bearer / Cookie | Get 7-day completion breakdown |
| `GET` | `/api/v1/stats/activity-heatmap` | Bearer / Cookie | Get yearly completion density map |
| `GET` | `/api/v1/stats/habit-leaderboard` | Bearer / Cookie | Get habits ranked by streak length |

---

## Security & Reliability Design

- **SQL Injection Defense**: All queries are parameterized via Prisma ORM; raw query inputs are disallowed.
- **Cross-Site Scripting (XSS)**: Recursive sanitization middleware strips hazardous HTML tags, inline event listeners (`onclick=`), and `javascript:` URIs from input payloads.
- **Brute-Force & DDoS Mitigation**: In-memory sliding-window rate limiting isolates sensitive auth routes (5 attempts per 15 minutes with block windows).
- **Bot Detection**: Rejects automated scanners and known exploit user agents (`sqlmap`, `nmap`, `nikto`, headless bots) with `403 Forbidden`.
- **Tenant Isolation**: All habit and statistics queries strictly scope database operations to `userId` extracted from validated JWT access tokens.
- **Fail-Safe Error Handling**: Centralized error funnel guarantees internal server errors never leak raw database stack traces or confidential credentials to the client.

---

## License

This project is licensed under the [MIT License](LICENSE).
