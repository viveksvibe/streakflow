# StreakFlow Backend — Architecture & Security Review

Scope: the Express 5 API in `src/` (auth, habits, stats) and its Prisma/Postgres
data layer. Findings marked **Verified** were reproduced against a locally
running instance (`npm run dev` + a throwaway Postgres on `:5433`).

---

## 1. How the backend works

### 1.1 Stack

| Piece | Choice |
|---|---|
| Runtime | Node ≥ 22, ESM (`"type": "module"`, TS `NodeNext`) |
| HTTP | Express 5 |
| DB | PostgreSQL via Prisma 7 with `@prisma/adapter-pg` driver adapter |
| Auth | JWT (`jsonwebtoken`) access + refresh, bcrypt (`bcryptjs`) passwords |
| Validation | Zod schemas per module |
| Media | Cloudinary (avatar uploads), Multer memory storage |
| Hardening middleware | `helmet`, `cors`, `compression`, `cookie-parser`, `morgan` |

### 1.2 Boot sequence

```
src/index.ts
  └─ src/config/env.ts     Zod-validated environment (fails fast on bad config)
  └─ src/app.ts            helmet → compression → cookieParser → cors → json(1mb)
                           → morgan → /health → /api/v1 → notFound → errorHandler
  └─ src/lib/prisma.ts     PrismaClient + PrismaPg adapter on DATABASE_URL
```

`errorHandler` is the single funnel: `ZodError → 400`, `AppError → statusCode`,
anything else → `500 { success: false, message: "Internal server error" }`.
Every response is wrapped by `sendSuccess` as
`{ success, message?, data }`.

### 1.3 Request lifecycle

1. **Route match** — `src/routes/index.ts` mounts `/auth`, `/habits`, `/stats`.
2. **Validate** — `validateRequest(schema)` runs `schema.parse({ body, params, query, cookie })`.
   ⚠️ The parsed output is **discarded**; see finding **M-9**.
3. **Authenticate** — `authenticate` reads a Bearer token *or* the `accessToken`
   cookie, verifies the JWT, loads the user, lazily tops up monthly streak-freeze
   credits, and attaches `req.user = { id, email, fullName, timezone }`.
4. **Authorize by ownership** — habits and stats queries are always scoped with
   `userId` from the token. No cross-tenant IDOR was found.
5. **Handle** — controllers call services inside `asyncHandler`; mutations that
   touch streaks run in `prisma.$transaction`.

### 1.4 Auth flow

```
register/login ──► issueTokenPair()
                     ├─ accessToken  = JWT{ sub, email } (JWT_ACCESS_TTL, 15m)
                     ├─ refreshToken = JWT{ sub, email } (JWT_REFRESH_TTL, 30d)
                     └─ RefreshToken row { tokenHash = sha256(refresh), expiresAt }
                   Response: { user, tokens }  +  httpOnly cookies
```

- **Refresh** reads the token **only** from the `refreshToken` cookie, looks up
  the SHA-256 hash, and rejects if revoked/expired/mismatched.
- **Logout** sets `revokedAt` on the matching row and clears both cookies.
- **Google sign-in** posts a Google *access token*; the server fetches
  `https://www.googleapis.com/oauth2/v3/userinfo`, then finds-or-creates the
  local user by email (random password for new accounts).

### 1.5 Streak engine

`HabitProgress { currentStreak, bestStreak, lastCompletedDate }` is the source of
truth, keyed per habit; `HabitCompletion` is unique on `(habitId, localDate)`.

- Dates are computed in the **user's IANA timezone** (`utils/date.ts`), stored as
  `YYYY-MM-DD` strings — no timezone drift on the streaks themselves.
- Completing: `gap == 1` → +1; `gap == 2` **with** credits → auto-spend a freeze
  and +1; anything else → reset to 1.
- Freezing: spends one credit and stamps `StreakFreezeUsage(habitId, missedLocalDate)`.
- `ensureMonthlyFreezeCredits` resets the balance once per calendar month
  (`MONTHLY_FREEZE_CREDITS`, default 2).

### 1.6 Endpoint inventory

| # | Method | Path | Auth |
|---|---|---|---|
| 1 | GET | `/health` | none |
| 2 | GET | `/api/v1/` | none |
| 3 | POST | `/api/v1/auth/register` | none |
| 4 | POST | `/api/v1/auth/login` | none |
| 5 | POST | `/api/v1/auth/google` | none |
| 6 | POST | `/api/v1/auth/refresh` | refresh cookie |
| 7 | POST | `/api/v1/auth/logout` | refresh cookie |
| 8 | GET | `/api/v1/auth/me` | Bearer / cookie |
| 9 | PATCH | `/api/v1/auth/me` | Bearer / cookie (multipart) |
| 10 | GET | `/api/v1/habits` | Bearer / cookie |
| 11 | POST | `/api/v1/habits` | Bearer / cookie |
| 12 | PATCH | `/api/v1/habits/:habitId` | Bearer / cookie |
| 13 | DELETE | `/api/v1/habits/:habitId` | Bearer / cookie |
| 14 | POST | `/api/v1/habits/:habitId/complete-today` | Bearer / cookie |
| 15 | POST | `/api/v1/habits/:habitId/freeze-today` | Bearer / cookie |
| 16 | GET | `/api/v1/stats/dashboard` | Bearer / cookie |
| 17 | GET | `/api/v1/stats/weekly-progress` | Bearer / cookie |
| 18 | GET | `/api/v1/stats/activity-heatmap` | Bearer / cookie |
| 19 | GET | `/api/v1/stats/habit-leaderboard` | Bearer / cookie |

---

## 2. Findings

Severity: **Critical** > **High** > **Medium** > **Low**.

### H-1 · Google sign-in does not bind the token to this application — *account takeover*
`auth.service.ts: googleLoginUser()`

The endpoint accepts a Google **access token** and asks Google's `userinfo`
endpoint who it belongs to. That proves the token is *a* valid Google token — it
does **not** prove it was issued to *this* app. `aud` / `azp` are never checked,
and the constructed `new OAuth2Client(env.GOOGLE_CLIENT_ID)` is never used
(dead code). Any valid Google access token minted for **any** OAuth client —
for example one obtained by an attacker's own app that the victim authorized, or
leaked from another integration — can be replayed here to obtain a StreakFlow
session for that Google account. `email_verified` is also not checked before
creating/linking an account.

**Fix:** verify a Google **ID token** with `OAuth2Client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`, and require `payload.email_verified === true` before find-or-create.

### H-2 · Refresh tokens are deterministic, never rotate, and have no replay detection
`auth.service.ts: issueTokenPair() / refreshSession()`, `utils/jwt.ts`

The refresh JWT payload is `{ sub, email }` with second-resolution `iat`, so the
token is a pure function of (user, secret, second). Two consequences:

- **Verified crash — 500 on rapid re-auth.** Two token issuances in the same
  clock second produce byte-identical JWTs → identical SHA-256 →
  `UniqueConstraintViolation` on `RefreshToken.tokenHash`. Live repro:
  `register` then `login`, or `login` twice, inside one second returns
  `500 Internal server error`.
- **No rotation.** `refreshSession` re-issues the *same* refresh token and never
  revokes the old one, so a stolen refresh token is replayable for its full
  30-day life. There is no `jti`, no device binding, and no reuse detection
  (the standard defence is to rotate on every refresh and revoke the whole
  token family when an already-rotated token is presented).

**Fix:** add a random `jti` to the refresh payload, rotate on every refresh,
revoke the presented token, and revoke the family on reuse.

### H-3 · CSRF: cookie-authenticated mutations with `SameSite=None`
`app.ts` (cors `credentials: true`), `middlewares/authenticate.ts`, `auth.controller.ts`

`authenticate` accepts the access token from the `accessToken` cookie, and in
production cookies are set `SameSite=None; Secure`. Browsers therefore attach
them to cross-site requests, and there is **no CSRF token and no Origin/Referer
check** on any state-changing endpoint (`POST/PATCH/DELETE /habits*`,
`PATCH /auth/me`, `POST /auth/refresh`). A hostile page can silently complete,
create, or archive habits and refresh the victim's session.
(The Google-login cookie is `SameSite=Strict` — inconsistent with the rest.)

**Fix:** keep access tokens out of cookies (Authorization header only), or
enforce `SameSite=Lax/Strict` plus a double-submit CSRF token, and validate
`Origin`.

### H-4 · No rate limiting anywhere
`app.ts`

There is no throttling on `/auth/login`, `/auth/register`, `/auth/refresh`,
`/auth/google`, or any data endpoint. Password guessing is unbounded (bcrypt
cost-12 only slows each attempt), registration can be scripted for spam, and
`/auth/google` amplifies because each call triggers an outbound Google fetch.
No lockout, no captcha, no per-IP budget.

**Fix:** `express-rate-limit` (or an edge/WAF rule) with a tight bucket on the
auth routes.

### H-5 · Long-lived refresh token returned in the response body
`auth.controller.ts`

`register` and `login` return the 30-day refresh token in the JSON payload while
also setting it as an httpOnly cookie. Returning it defeats the point of the
httpOnly cookie: any XSS, logging pipeline, or over-eager client storage can
exfiltrate a month-long credential. `refresh` also returns it.

**Fix:** return only the access token in the body; deliver the refresh token
exclusively as an httpOnly cookie.

### M-6 · `PATCH /auth/me` accepts an unvalidated `fullName`
`auth.controller.ts: updateMe()`, `auth.service.ts: updateUserProfile()`

Unlike register, this route runs **no Zod schema**. `fullName` is taken from the
multipart body and stored with only a `.trim()` — no length cap, no type check
(the 1 MB body limit is the only ceiling). Registration enforces 2–80 chars;
this path does not.

**Fix:** validate `fullName` with the same constraint used in `registerSchema`.

### M-7 · Multer errors surface as `500`, and `updateMe` has no validation wrapper
`middlewares/upload.ts`, `auth.controller.ts`

A non-image upload throws a plain `Error("Only images are allowed")`, which the
error handler maps to `500 Internal server error` rather than `400`. Combined
with M-6, client-input mistakes are indistinguishable from server failures.
`req.file.mimetype` is also client-supplied and only used to gate the upload.

**Fix:** throw `AppError(..., 400)` (or a `MulterError` branch in the error
handler) and validate the actual file signature/type server-side.

### M-8 · User enumeration on register
`auth.service.ts: registerUser()`

`409 "Email is already in use"` confirms whether an address has an account.
With no rate limiting (H-4) this supports email harvesting.

**Fix:** return a generic 200/202 "check your inbox" flow, or pair with
aggressive rate limiting.

### M-9 · `validateRequest` throws the parsed result away — Zod defaults are dead code
`middlewares/validate-request.ts`

```ts
schema.parse({ body, params, query, cookie });   // result discarded
next();
```

Consequences:

- **Verified:** `POST /api/v1/habits` with `{"name":"..."}` and **no `icon`**
  returns **`500`** instead of applying the documented `✅` default —
  `createHabit` calls `payload.icon.trim()` on `undefined` and throws a
  `TypeError`. The schema's `default("✅")` / `default(false)` never take effect.
- Schema `.trim()` transforms are not applied to the stored values either.

**Fix:** assign the parse result back (`req.body = parsed.body`, etc.), or read
validated data from a typed request property.

### M-10 · Access tokens survive logout
`auth.service.ts: logoutUser()` — **Verified**

Logout revokes only the refresh token. The access token is a stateless JWT with
no denylist, so `GET /api/v1/auth/me` still returned `200` *after* logout in the
live run. Window is `JWT_ACCESS_TTL` (15 min by default).

**Fix (documented trade-off):** keep a short TTL and accept it, or add a
`tokenVersion`/denylist check in `authenticate`.

### M-11 · Streak-freeze credit race (TOCTOU)
`habit.service.ts: completeHabitForToday() / freezeHabitForToday()`

The transaction reads `habit.user.streakFreezeCredits` (from the
`getOwnedHabitOrThrow` snapshot) and then decrements. Under the default
`READ COMMITTED` isolation, two concurrent requests — different habits, same
user — can both observe a balance of 1 and each spend a credit, driving the
counter negative (or granting a free freeze). The decrement uses
`{ decrement: 1 }` with no guard, and there is no unique constraint spanning
"one freeze per user per day".

**Fix:** `SELECT ... FOR UPDATE` on the user row (or a conditional
`updateMany({ where: { streakFreezeCredits: { gt: 0 } } })` and check the count),
and enforce the daily limit in the database.

### M-12 · CORS allows localhost origins even in production
`app.ts`

```ts
origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
credentials: true,
```

The localhost entries ship to production unconditionally. Any process on the
user's machine (or a malicious local app / DNS-rebinding scenario) can make
credentialed cross-origin calls. `FRONTEND_URL` is also the only allowlisted
origin otherwise — easy to misconfigure with a trailing slash.

**Fix:** build the allowlist per environment; allow localhost only when
`NODE_ENV !== "production"`.

### M-13 · Outbound Google fetch has no timeout
`auth.service.ts: googleLoginUser()`

`fetch("https://www.googleapis.com/oauth2/v3/userinfo")` sets no
`AbortSignal.timeout`. A hung upstream keeps the request open indefinitely,
which — with no rate limiting (H-4) — is a cheap denial-of-service amplifier.

**Fix:** `AbortSignal.timeout(5000)` and surface a `502/503` on failure.

### L-14 · JWT verification does not pin algorithm / issuer / audience
`utils/jwt.ts`

`jwt.verify(token, secret)` relies on library defaults. Explicit
`algorithms: ["HS256"]`, `issuer`, and `audience` (with the same set at signing
time) close algorithm-confusion and cross-service token-reuse gaps.

### L-15 · Deployment cookie correctness
`auth.controller.ts`

`secure: isProduction` is set, but `app.ts` never calls `app.set("trust proxy", …)`.
Behind a TLS-terminating proxy this can prevent secure cookies from being set or
misreport the protocol. Also `res.clearCookie(name, options)` passes `maxAge`,
which is ignored when clearing — pass only `path`/`domain`/`sameSite`/`secure`.

### L-16 · Inconsistent and undocumented session policy
`auth.controller.ts`

Register/login/refresh set a **7-day** cookie for a **30-day** refresh JWT;
Google login sets **30 days**; Google login is `SameSite=Strict` while the others
are `None` in production. The cookie maxAge also silently truncates the real
refresh lifetime, so sessions end earlier than the JWT allows.
`googleLogin` also omits the access-token cookie entirely.

### L-17 · No email veriﬁcation, weak password policy
`auth.schemas.ts`, `auth.service.ts`

`password` only needs 8 characters — no complexity or breached-password check —
and accounts are usable immediately with no email verification step.

### L-18 · Sensitive leftovers in the working tree
`env.ts.example` aside, the repo root contains `.env.production.bak` (gitignored,
so not committed — good — but a stray backup of production configuration on disk
invites accidental leakage) and the debug scripts `test-db.ts` /
`test-dashboard.ts`, which build Prisma clients and print user rows. Rotate the
backup's secrets and keep both out of production images/builds.

### L-19 · Refresh-token table grows without bound
`schema.prisma`

Expired and revoked `RefreshToken` rows are never deleted; there is no cleanup
job or TTL. Over time this bloats the `tokenHash`-unique table.

### L-20 · `AppError.details` is serialised to clients
`middlewares/error-handler.ts`

Currently unused, but any future `details` payload would be returned verbatim —
a footgun for accidentally leaking internals.

---

## 3. What is already done well

- `helmet()` on by default, `x-powered-by` disabled, JSON body capped at 1 MB.
- Environment is validated with Zod at boot and **fails fast**; JWT secrets must
  be ≥ 24 chars; bcrypt cost is configurable and bounded (8–15).
- Refresh tokens are stored **hashed** (SHA-256), never in plaintext, and are
  checked for revocation and expiry.
- Login returns an identical `Invalid credentials` for unknown email and wrong
  password — no enumeration on the login path.
- Every habit and stats query is scoped by the authenticated `userId`; no IDOR,
  BOLA, or mass-assignment path through `habitId` was found (bad ids are rejected
  as non-cuid, foreign ids as `404`).
- Streak mutations run in transactions and lean on a
  `@@unique([habitId, localDate])` constraint for idempotency.
- Timezone handling is centralised and streak dates are timezone-correct.
- `.env` and `.env.*` are gitignored; **no secrets are committed** to the
  repository (verified with `git ls-files`).

---

## 4. Suggested fix order

1. **H-1** Google audience/`email_verified` check (account takeover).
2. **H-2** Rotate refresh tokens, add `jti`, fix the same-second collision.
3. **H-3** CSRF — drop cookie auth for the access token, or add token + Origin checks.
4. **H-4** Rate limiting on all `/auth/*` routes.
5. **H-5** Stop returning refresh tokens in response bodies.
6. **M-9**, **M-6**, **M-7** — assign validated bodies back to `req`, validate
   `fullName`, map upload errors to `400`.
7. **M-11** Row-lock the freeze-credit decrement.
8. **M-12**, **M-13**, **M-10**, then the L-series hardening.
