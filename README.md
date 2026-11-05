# quantcode-e2e-small

**Tier 2 corpus** for the QuantCode autonomous agent e2e harness.

A small TypeScript HTTP API (Hono) with a shared utilities package. Contains intentional bugs and unimplemented stubs for the agent to find and fix.

## Structure

```
packages/
  api/      Hono HTTP server — routes, middleware, in-memory DB
  shared/   Shared types and utilities consumed by the API
```

## Running tests

```bash
bun test --recursive
```

## Previously known issues (now fixed)

1. `packages/api/src/middleware/auth.ts` — method check used `'post'` instead of `'POST'`
2. `packages/shared/src/types.ts` — `User.userName` renamed to `username` to match API usage
3. `packages/api/src/routes/users.ts` — `badRequest` import added
4. `packages/shared/src/utils/pagination.ts` — `paginate()` implemented
