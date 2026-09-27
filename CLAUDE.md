# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Express.js REST API for searching products (cars, mobiles) across a shared "scan" endpoint, migrated from a Spring Boot service. Runs as a normal Node server locally (`src/index.ts`) and as a Vercel serverless function in production (`api/index.ts` re-exports the same Express `app`). Database is SQLite via `@libsql/client`, either a local file/dev server or Turso Cloud in production.

## Commands

```bash
npm run dev          # tsx watch src/index.ts — local dev server on :3000, loads .env.local/.env
npm run build        # tsc -> dist/
npm start            # node dist/index.js (run build first)
npm test             # jest (ts-jest, ESM)
npm run test:watch   # jest --watch
npm run lint         # eslint src
npm run format       # prettier --write "src/**/*.ts"
```

Run a single test file or test name:

```bash
npx jest src/mappers/__tests__/columnMapper.test.ts
npx jest -t "should map make/brand shorthand keys"
```

After `npm test`, an HTML report is written to `test-reports/jest_html_reporters.html`.

A husky `pre-commit` hook runs `npx lint-staged` (eslint --fix + prettier on staged `*.ts`) then `npm test` — expect commits to run the full test suite.

## Environment

Copy `.env.example` to `.env.local` for local dev. Key vars:
- `FIREBASE_SERVICE_ACCOUNT` — single-line service account JSON, required for auth.
- `TURSO_CONNECTION_URL` / `TURSO_AUTH_TOKEN` — remote Turso DB. For local dev, set `SQLITE_DB_PATH=file:./sqlite/products-local.db` instead (or point at a `turso dev` local server URL); local URLs (`file:` or `http://127.0.0.1...`) skip the auth-token requirement — see `src/config/database.ts`.
- `CORS_ORIGINS` — comma-separated allowed origins (Angular frontend).

`src/index.ts` only loads dotenv when `process.env.VERCEL` is unset, since Vercel injects env vars directly.

## Architecture

**Request flow**: `api/index.ts` (Vercel entry) and `src/index.ts` (local dev server) both point at the same Express `app`. Routes are versioned under `/api/v1/*`; the unversioned `/api/*` alias currently also maps to v1 (see comment in `src/index.ts` — v2 exists as a structural placeholder, identical to v1, for future divergence). `/health` and `/` are unauthenticated liveness checks outside the versioned routers.

**Layers**, in call order for `POST /api/v1/products/scan`:
1. `middleware/auth.ts` — `authMiddleware` verifies the Firebase ID token from `Authorization: Bearer <token>` and attaches `req.user`; `optionalAuthMiddleware`/`requireAuth` exist for endpoints with looser auth needs.
2. `routes/v1/product.routes.ts` — thin handler, delegates to the service.
3. `services/productService.ts` — validates the `SearchRequest`, resolves a `ColumnMapper` for the product type, and dynamically builds parameterized SQL (`WHERE`/`ORDER BY`/`LIMIT`/`OFFSET`) executed via `config/database.ts`.
4. `mappers/columnMapper.ts` — `ColumnMapperFactory` returns a per-product-type `ColumnMapper` (`CarColumnMapper`, `MobileColumnMapper`) that translates terse API field keys (e.g. `j.a`, `k.n`) to actual DB column names, validates requested columns, and normalizes boolean-ish DB values (0/1, "true"/"false") to real booleans for columns in that mapper's `booleanColumns` list.
5. `utils/errorHandler.ts` — `APIError` is the only error type routes/services should throw deliberately; `handleError()` maps it (and generic `Error`/`SyntaxError`) to a consistent `{ error, code, details? }` JSON response and is used both in Express's error middleware and inside individual route handlers' catch blocks.

**API contract is intentionally terse** (mirrors the original Java model): request/response payloads use single-letter keys (`f`/`o`/`v` for filter conditions, `i`/`v` for result items, operation codes `E`/`EG`/`ES`/`S`/`G`/`IN`, sort order `A`/`D`). See `src/types/index.ts` for the enums/maps (`Operation`, `OperationMap`, `SortOrder`, `SortOrderMap`, `ProductType`, `ProductTypeTableMap`) and `README.md` for example request/response bodies. When adding a new product type, add it to `ProductType`/`ProductTypeTableMap` and register a new `ColumnMapper` in `ColumnMapperFactory`.

**Adding a new filterable/sortable/returnable column**: add the API-key → DB-column entry to the relevant mapper's constructor in `src/mappers/columnMapper.ts` (and to its `booleanColumns` array if it's boolean-like in the DB); no other files need changes since routes/services work generically off the mapper.

**Database access** is centralized in `src/config/database.ts` (`executeQuery`, `executeQueryOne`, `executeQueryCount`) — always go through these rather than creating a new client, since they hold the singleton `Client` and enforce parameterized queries (SQL injection prevention depends on every caller passing values as `params`, never interpolated into the query string — note `productService.ts` interpolates `tableName`/`dbColumn` names but never raw user values).

**Module resolution**: the project is ESM (`"type": "module"` in `package.json`); local imports must use explicit `.js` extensions (e.g. `import x from '../types/index.js'`) even though the source files are `.ts` — `moduleNameMapper` in `jest.config.js` strips the `.js` back off for ts-jest.

## Testing conventions

Tests live in `__tests__/` directories beside the code they cover (`src/**/__tests__/*.test.ts`). Jest runs under `ts-jest` with `useESM: true`; test files import from source without the `.js` extension (e.g. `from '../columnMapper'`), unlike application code.
