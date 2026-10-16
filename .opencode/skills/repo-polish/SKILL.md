---
name: repo-polish
description: Polish a software repository so it is portfolio-ready and client-ready, covering README, setup, code quality, UI polish, security hygiene, deployment and demo readiness. Use this skill whenever the user asks to polish, clean up, improve, prepare, review, harden, or "make presentable" a repo, project, or app, or mentions portfolio, showcase, GitHub profile, freelancing clients, or making a project look professional, even if they do not say "polish". Works best for full-stack JavaScript/TypeScript (React, Next.js, Tailwind, Node) and Python (FastAPI) projects with Postgres or MongoDB.
---

# Repo Polish

Turn a working-but-rough project into something a client or hiring manager can open, understand, run, and be impressed by within five minutes.

## Core rules

1. **Polish, do not expand.** Do not add new features. Fix, clean, document, and harden what exists.
2. **Never break behavior.** Run the app and tests before and after every phase. If something worked before, it must work after.
3. **Small, reversible steps.** Work on a branch (`polish/<date>`). One commit per phase with a clear message.
4. **Never commit secrets.** Check files and git history for keys, tokens, passwords, and `.env` files. If found, stop and tell the user to rotate them.
5. **Ask before destructive actions** (deleting files, rewriting git history, changing DB schemas, upgrading major dependency versions).
6. **Be honest.** If something cannot be verified (no tests, cannot run the app), say so in the report. Do not claim it works.

## Workflow

### Phase 0: Recon (read-only)

- List the tree (ignore `node_modules`, `.next`, `venv`, `dist`).
- Read: `README`, `package.json` / `pyproject.toml` / `requirements.txt`, config files, `.env*`, `Dockerfile`, CI files.
- Identify: framework, DB and ORM (Prisma/Drizzle/Mongoose/SQLAlchemy), auth method, deploy target, how to run it.
- Try: install, build, lint, test. Record exactly what fails and why.
- Write a short **baseline note** (what works, what is broken, what is missing). Do not fix anything yet.

### Phase 1: Make it run from scratch

Goal: a stranger can clone and run it in under 5 minutes.

- Fix install and build errors, broken imports, missing dependencies, wrong scripts.
- Add `.env.example` listing every required variable with safe placeholder values and a one-line comment each.
- Add or fix `.gitignore` (env files, build output, caches, `node_modules`, `venv`, OS files).
- Add seed or demo data script if the app needs data to look alive (`npm run seed`, `python seed.py`).
- Pin runtime versions (`engines` in `package.json`, `.nvmrc`, or `python_requires`).
- Verify by following your own README steps in a clean clone if possible.

### Phase 2: README (highest-impact file)

Use this structure:

```
# Project Name
One-line pitch: what it does and who it is for.

[Live demo] · [Demo video] · [Screenshots]

## Features
3-6 bullets, user-facing outcomes (not tech trivia).

## Tech stack
Frontend / Backend / Database / ORM / Auth / Hosting.

## Screenshots or GIF
Main flow, at least 2 images (put in /docs or /public).

## Getting started
Prerequisites, clone, install, env setup, migrate/seed, run. Copy-pasteable commands.

## Demo account
email / password (only if demo mode is safe).

## Project structure
Short tree with one-line explanations.

## API overview (if backend)
Main endpoints in a table. Link to /docs (FastAPI) or OpenAPI.

## Decisions and trade-offs
2-4 lines: why this stack, what was hard, what you would do next.

## Roadmap
Honest list of known gaps.
```

Rules: no placeholder text, no "TODO", no broken links, no claims the code does not support.

### Phase 3: Code quality

- Set up or fix **ESLint + Prettier** (JS/TS) or **Ruff + Black** (Python). Run formatter once across the repo in its own commit.
- Remove dead code, unused imports and dependencies, leftover `console.log` / `print` debugging, commented-out blocks.
- Replace magic strings and numbers with constants. Keep functions small and names meaningful.
- TypeScript: remove `any` where practical, enable `strict` if feasible without a rewrite.
- Validate all external input (Zod / Pydantic). Centralize error handling and return consistent error shapes.
- Make sure DB access goes through the ORM layer, with migrations committed (`prisma/migrations`, Alembic).
- Add basic loading, empty, and error states everywhere data is fetched.

### Phase 4: UI polish (frontend)

- Consistent spacing, type scale, and color palette (define tokens in the Tailwind config, not scattered hex codes).
- **Responsive at 360px, 768px, 1280px.** Fix overflow, tiny tap targets, and broken layouts.
- Visible states: hover, focus, disabled, loading, empty, error, success (toasts).
- Accessibility basics: semantic HTML, alt text, labels on inputs, keyboard focus order, sufficient contrast.
- Proper page titles, meta description, favicon, and Open Graph image (Next.js `metadata`).
- Remove lorem ipsum, default framework logos, and placeholder images.
- Check Lighthouse (performance, accessibility, SEO). Fix the obvious wins: image sizing, unused JS, missing meta.

### Phase 5: Security and reliability hygiene

- No secrets in code or git history. Env vars read in one config module.
- Passwords hashed (bcrypt/argon2). Auth tokens stored and expired sensibly. Protect private routes on the server, not only the UI.
- Add rate limiting on auth routes, CORS restricted to known origins, security headers (Helmet / Next.js headers).
- Parameterized queries only (ORM does this; check any raw SQL). Sanitize anything rendered as HTML.
- `npm audit` / `pip-audit`: fix high-severity issues that do not require breaking upgrades.
- Add a health endpoint (`/health`) and graceful error pages (404, 500).

### Phase 6: Tests and CI (minimum viable)

- Add a small number of **meaningful** tests: core business logic, one API happy path, one auth check. Do not chase coverage numbers.
- Tools: Vitest/Jest + Testing Library, Playwright for one end-to-end flow, or pytest + httpx for FastAPI.
- Add a GitHub Actions workflow: install, lint, test, build on every push and PR. Add the status badge to the README.

### Phase 7: Deployment and demo readiness

- Deploy: frontend on Vercel, backend on Render/Railway/Fly, Postgres on Neon/Supabase, Mongo on Atlas. Document the env vars needed.
- Run migrations and seed demo data on the deployed instance.
- Make sure the live URL loads fast and the main flow works logged-out and with the demo account.
- Add a `Dockerfile` / `docker-compose.yml` if it simplifies setup (optional, only if it runs correctly).
- Add `LICENSE` (MIT unless the user says otherwise).
- Repo settings: description, topics/tags, website link, pinned on the GitHub profile.

### Phase 8: Git hygiene

- Meaningful commit messages going forward (`feat:`, `fix:`, `docs:`, `chore:`).
- Remove committed junk (build output, `.DS_Store`, large binaries). Do not rewrite history without asking.
- Add `CONTRIBUTING`/`SECURITY` only if relevant. Do not pad the repo with empty boilerplate.

## Stack-specific checks

**Next.js:** use Server Components where data is static, `next/image` and `next/font`, route-level `loading.tsx` and `error.tsx`, env vars split into `NEXT_PUBLIC_*` vs server-only.

**React (Vite/CRA):** code-split routes, avoid prop drilling for shared state, centralize API calls, error boundary at the root.

**Node/Express:** layered structure (routes, controllers, services), async error middleware, request validation, structured logging.

**FastAPI:** Pydantic models for requests and responses, dependency injection for DB sessions and auth, tags and descriptions so `/docs` reads well, Alembic migrations.

**Prisma/Drizzle/SQLAlchemy/Mongoose:** committed migrations or schema, indexes on queried fields, no N+1 queries on main pages, transactions for multi-step writes.

**Tailwind:** extract repeated class groups into components, define theme in config, avoid arbitrary values where a token exists.

## Final deliverable: POLISH_REPORT.md

Create `POLISH_REPORT.md` (or print it in chat) with:

1. **Before / after summary** (what was broken, what is now fixed).
2. **Checklist** with status per phase: done, partial, skipped (and why).
3. **Verified:** commands run and their results (install, build, lint, test).
4. **Not verified / risks:** anything that could not be checked.
5. **Next steps for the owner:** secrets to rotate, accounts to create, screenshots or demo video to record, and the top 3 improvements by client impact.

## Priority order when time is short

1. Runs from a clean clone, no secrets leaked
2. README with live link, screenshots, demo account
3. Deployed and working live demo
4. Responsive, clean UI with proper states
5. Lint/format, remove dead code
6. A few tests and CI
7. Everything else
