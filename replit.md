# Тунисский формат

Web service for conducting beach volleyball mini-tournaments in the Tunisian format (5 players, 15 rounds).

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Replit Migration

- Migration completed in this environment: dependencies installed, PostgreSQL schema applied, API and web workflows restarted and verified.
- Frontend API requests are routed through the artifact base path so preview-path routing remains compatible with Replit.

## Project: Тунисский формат

- **Purpose**: Beach volleyball tournament management app — Tunisian format (5 players × 15 rounds)
- **UI language**: Russian
- **Auth**: JWT (email/password), stored in localStorage as `auth_token`, passed via Bearer header
- **Superadmin seed**: `admin@local` / `admin` (role: `superadmin`), created on server start
- **Preview path**: `/` (root)

### Tournament Logic
- 15 rounds auto-generated on creation, each player rests exactly 3 times
- Greedy pair algorithm maximizes variety of partnerships
- Score validation: winner must reach exactly `targetScore` (11, 15, or 21)
- Stats (wins, losses, pointsDiff) recalculated on every round save
- Status: `in_progress` → `finished` when all 15 rounds complete

### Frontend Pages
- `/` — auth (login / register)
- `/dashboard` — tournament list
- `/tournaments/new` — create tournament (5 player names + target score)
- `/tournaments/:id` — tournament play (round selector, score entry, stats table)
- `/tournaments/:id/results` — final results (rankings, CSV export, copy to clipboard)
- `/admin` — admin panel (user list, their tournaments) — superadmin only
- `/about`, `/team` — info pages

### Classic 4-player format
- Dashboard includes `классический (4 чел)` above the Tunisian tournament button.
- Uses 4 players, 3 rounds, 1 game per round.
- Fixed mode keeps pairs 1–2 vs 3–4 for all 3 rounds.
- Rotating mode uses 1–2 vs 3–4, 1–3 vs 2–4, 1–4 vs 2–3 so each player partners with every other player once.
- Optional balanced mode stores formats with `-balanced`, disables score autofill, and validates classic 4-player scores only as whole numbers from 0 to 100.

### Key Files
- `artifacts/tunisian-format/src/App.tsx` — routes + auth guards
- `artifacts/api-server/src/routes/` — auth, tournaments, rounds, admin routes
- `artifacts/api-server/src/lib/tournament-generator.ts` — 15-round generation
- `artifacts/api-server/src/lib/activity-log.ts` — database logging for app access and completed tournament results
- `artifacts/api-server/src/lib/auth.ts` — JWT middleware
- `lib/db/src/schema/tournaments.ts` — DB schema (JSONB for players/rounds)
- `lib/db/src/schema/logs.ts` — DB schema for `app_access_logs` and `tournament_result_logs`
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + wouter

### Database Logging
- `app_access_logs` records registration, login, guest login, app-open checks, failed attempts, IP address, user agent, user/email, and event status.
- `tournament_result_logs` records a snapshot when a tournament transitions to finished, including format, target score, players, rounds, and calculated final results.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
