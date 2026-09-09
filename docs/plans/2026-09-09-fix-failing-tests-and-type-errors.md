# Fix Plan — failing tests + `tsc --noEmit` errors

**Date:** 2026-09-09
**Branch:** `quantcode/e2e-tier2-2186-1788936492`
**Scope:** 4 source/config edits. No dependency changes, no test-file changes.

## Baseline (verified)

```
bun test --recursive   → 13 pass, 9 fail  (22 tests, 4 files)
tsc --noEmit           → 14 errors
```

## Verification status

The complete fix set below was applied to a throwaway copy (`/tmp/verify`, since deleted)
and confirmed:

```
tsc --noEmit         → 0 errors
bun test --recursive → 22 pass, 0 fail
```

`git status --porcelain` on `/workspace/repo` is empty — the real tree was never modified.

---

## IMPORTANT — one correction to the task brief

The brief states the `username` fix belongs in `packages/api/src/routes/users.ts`
(`username` → `userName`). **That is backwards.** The in-repo `BUG:` comment in
`packages/shared/src/types.ts:11` is the authoritative one, and the tests confirm it.

Evidence that `username` (lowercase) is the single source of truth:

| Location | Field used |
|---|---|
| `packages/api/test/users.test.ts:21,23,25,31,49,52,53,61,69` | `username` |
| `packages/api/test/auth.test.ts:25,31` | `username` |
| `packages/api/src/routes/users.ts:22,24,26` | `username` |
| `packages/shared/src/types.ts:11` | `userName` ← **the outlier** |

`tsc` reports TS2561 `username does not exist in type Omit<User,...>` at **four** sites,
three of which are **test files we are forbidden to modify**
(`users.test.ts:21,31,69`, `auth.test.ts:31`). Renaming in `users.ts` would fix one site
and leave three unfixable test-file errors. Renaming the type is the only change that
clears all four. **Fix `types.ts`, not `users.ts`.**

---

## Area 1 — `paginate` implementation

**File:** `packages/shared/src/utils/pagination.ts`
**Replace the whole file body** (currently `throw new Error("not implemented")` at line 14).

```ts
import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const start = (page - 1) * size
  return { data: items.slice(start, start + size), page, pageSize: size, total, totalPages }
}
```

### Contract derived from `packages/shared/test/pagination.test.ts`

Fixture: `items = 25 objects, ids 1..25`.

| # | Line | Call | Expectation | Satisfied by |
|---|---|---|---|---|
| 1 | 8–11 | `(items,1,10)` | `data.length===10`, `data[0]={id:1}`, `data[9]={id:10}` | `slice(0,10)` — **page is 1-indexed** |
| 2 | 15–16 | `(items,2,10)` | `data[0]={id:11}` | `start=(2-1)*10=10` |
| 3 | 20–21 | `(items,3,10)` | `data.length===5` | `slice(20,30)` clamps to 5 — no manual clamp needed |
| 4 | 25–27 | `(items,1,10)` | `total===25`, `totalPages===3` | `total=items.length`; `Math.ceil(25/10)=3` |
| 5 | 31–33 | `(items,2,10)` | `page===2`, `pageSize===10` | echo inputs verbatim — **no clamping to `totalPages`** |
| 6 | 37–38 | `(items,99,10)` | `data.length===0` | `slice(980,990)` → `[]` |
| 7 | 42–45 | `([],1,10)` | `data.length===0`, `total===0`, `totalPages===0` | `Math.ceil(0/10)===0` |

Semantics notes that matter:
- **`page` is echoed, not clamped.** Test 6 passes `page=99` and only asserts `data` is
  empty — it does not assert `page` was corrected. Clamping to `totalPages` would still
  pass here, but test 5 asserts `page===2` exactly, so plain echo is the safe reading.
- **`totalPages` is `0` for an empty array, not `1`.** Test 7 (line 45) is explicit.
  Do not add a `Math.max(1, ...)` floor.
- **No clamping of `start`/`end` is required** — `Array.prototype.slice` already returns
  `[]` for out-of-range starts and truncates a short tail.
- Field order in the returned object is irrelevant; `PaginatedResponse<T>`
  (`types.ts:24-30`) requires exactly `data, page, pageSize, total, totalPages`.

---

## Area 2 — auth middleware case-sensitivity bug

**File:** `packages/api/src/middleware/auth.ts`
**Line 18** — one-token change:

```ts
// before
const publicMethods = ["GET", "post"]
// after
const publicMethods = ["GET", "POST"]
```

**What defines "public":** the local `publicMethods` string array at line 18. There is no
route-path allow-list — the policy is **method-based only**, applied globally because
`packages/api/src/index.ts:8` mounts the middleware as `app.use("*", authMiddleware)`
ahead of both routers.

**How the comparison is done:** `publicMethods.includes(c.req.method)` (line 20).
`Array.prototype.includes` is `===`-based and therefore **case-sensitive**. Hono's
`c.req.method` returns the method uppercased per RFC 7231, so `"POST" === "post"` is
`false`, `includes` returns `false`, and control falls through to the Bearer-token check
at lines 24–27 → `401`.

This is exactly why `auth.test.ts:19-28` ("POST /users is public") gets `401` instead of
the expected `201` — that test sends **no** `Authorization` header.

**Minimal fix is the string literal only.** Do not switch to
`c.req.method.toUpperCase()` or a case-insensitive compare: the input is already
guaranteed uppercase, so normalising the input would mask rather than fix the typo'd
literal. Leave lines 20 and 24–27 alone.

Note this change also un-blocks `users.test.ts:57-64` (400-for-missing-fields), which
currently fails at the auth layer with 401 before it ever reaches the route handler.

---

## Area 3 — `users.ts` missing import + the field-name source of truth

### 3a. `badRequest` import

**File:** `packages/api/src/routes/users.ts`
**Line 3:**

```ts
// before
import { notFound } from "../lib/errors"
// after
import { notFound, badRequest } from "../lib/errors"
```

**Where `badRequest` comes from:** `packages/api/src/lib/errors.ts:7` —
`export function badRequest(c: Context, msg = "Bad request")`, returning
`c.json({ error: msg, status: 400 }, 400)`. It is a named export from the same
`../lib/errors` module `notFound` already comes from, so this is purely adding it to the
existing import specifier — **no new import statement, no new dependency.**

Confirmation this is the intended idiom: the sibling router
`packages/api/src/routes/posts.ts:3` already does exactly
`import { notFound, badRequest } from "../lib/errors"`.

Optionally delete the now-stale `BUG:` comments at lines 4–6 and 23.

### 3b. Field name — fix the **type**, not the usage

**File:** `packages/shared/src/types.ts`
**Line 11:**

```ts
// before
  userName: string // BUG: should be `username` to match API usage
// after
  username: string
```

Optionally also drop the stale `BUG:` block at lines 1–7 of that file.

**Leave `packages/api/src/routes/users.ts` lines 22/24/26 exactly as they are** — they
already use `username`, which is correct. See the "one correction to the task brief"
section above for why.

`packages/api/src/lib/db.ts` needs **no** change: it is generic over the shared type
(`Omit<User, "id" | "createdAt">` at line 15, spread at line 16), so it picks the rename
up automatically.

---

## Area 4 — tsconfig fix for `bun:test` and `process`

**Controlling file:** `/workspace/repo/tsconfig.json` — the **single, root** tsconfig.
Verified there are no per-package tsconfigs (`find packages -name "tsconfig*.json"`
returns nothing), and `include` at line 12 already covers both
`packages/*/src/**/*` and `packages/*/test/**/*`. So this one file governs every tsc
error in every package and test file.

**Add one key** to `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun-types"],
    "paths": {
      "@e2e/shared": ["./packages/shared/src/index.ts"]
    }
  },
  "include": ["packages/*/src/**/*", "packages/*/test/**/*"]
}
```

### Why this single key fixes both error classes

`bun-types@1.4.2` is already installed and resolvable at
`node_modules/bun-types` → `.bun/bun-types@1.4.2/node_modules/bun-types`
(declared in root `package.json` devDependencies). It provides:

- **`bun:test`** — via `/// <reference path="./test.d.ts" />` in its `index.d.ts`,
  which declares the `bun:test` module. Clears the four TS2307s
  (`auth.test.ts:1`, `posts.test.ts:1`, `users.test.ts:1`, `pagination.test.ts:1`).
- **`process`** — via `/// <reference types="node" />` on line 5 of its `index.d.ts`.
  `@types/node@26.5.0` is present at
  `.bun/bun-types@1.4.2/node_modules/@types/node` (a transitive dep of `bun-types`,
  `"@types/node": "*"`), so the reference resolves. Clears the four TS2580s
  (`auth.ts:25`, `auth.test.ts:10`, `posts.test.ts:11`, `users.test.ts:10`).

Empirically confirmed: `tsc --noEmit --types bun-types` reduces the error count from 14
to 6, with **zero** remaining `process` or `bun:test` errors. The 6 residual errors are
exactly the Area 3 `badRequest`/`username` ones.

### Constraints honoured

- **No new dependencies.** `bun-types` and `@types/node` are already on disk; this is a
  pure `compilerOptions` change.
- **No `lib` change needed.** `target: ES2022` gives an adequate default lib; `process`
  and `bun:test` are ambient-declaration problems, not lib problems.
- **Do NOT use `typeRoots`.** Verified failure mode: `typeRoots: ["./node_modules/bun-types"]`
  makes tsc glob-include `bun-types/ts7.1/*.d.ts`, which uses newer syntax and emits a
  cascade of TS1005 parse errors from inside `node_modules`. `types` is the correct lever
  because it names the package and lets tsc follow the package's own
  `types`/`typesVersions` entry point.
- **No test files modified.**

---

## Change summary

| # | File | Change | Fixes |
|---|---|---|---|
| 1 | `packages/shared/src/utils/pagination.ts` | implement `paginate` (replace stub) | 7 failing `paginate` tests |
| 2 | `packages/api/src/middleware/auth.ts` L18 | `"post"` → `"POST"` | `auth > POST /users is public`; unblocks `POST /users > 400` |
| 3a | `packages/api/src/routes/users.ts` L3 | add `badRequest` to existing import | `POST /users > 400`; TS2552 |
| 3b | `packages/shared/src/types.ts` L11 | `userName` → `username` | 4× TS2561 (incl. 3 in unmodifiable test files) |
| 4 | `tsconfig.json` | add `"types": ["bun-types"]` | 4× TS2307, 4× TS2580 |

Files explicitly **not** to touch: any `packages/*/test/**`, `packages/api/src/lib/db.ts`,
`packages/api/src/routes/posts.ts`, `packages/api/src/lib/errors.ts`, `package.json`.

## Expected post-fix state

```
bun test --recursive → 22 pass, 0 fail
tsc --noEmit         → 0 errors
```

## Compliance note

Not security-relevant — no auth policy change (the middleware fix restores the
*documented* intent at `auth.ts:6-8`; it does not widen it), no data-flow, network
boundary, dependency, or infrastructure change. No personal data handling introduced.
No ISM/ES8 mapping required. Worth flagging for awareness only: this API treats
unauthenticated `POST` as public by design (`auth.ts:7`, `auth.test.ts:20`) — that is
pre-existing intended behaviour of the test corpus, not something this plan changes.
