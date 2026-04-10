# Тунисский формат

Web service for conducting beach volleyball mini-tournaments in the Tunisian format (5 players, 15 rounds).

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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

### Key Files
- `artifacts/tunisian-format/src/App.tsx` — routes + auth guards
- `artifacts/api-server/src/routes/` — auth, tournaments, rounds, admin routes
- `artifacts/api-server/src/lib/tournament-generator.ts` — 15-round generation
- `artifacts/api-server/src/lib/auth.ts` — JWT middleware
- `lib/db/src/schema/tournaments.ts` — DB schema (JSONB for players/rounds)
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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
