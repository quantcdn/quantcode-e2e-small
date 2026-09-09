# Fix plan — 9 failing tests, 14 type errors

**Date:** 2026-09-09
**Branch:** `quantcode/e2e-tier2-2171-1788940441`
**Scope:** 5 files. No new dependencies. No test-file changes.
**Validation status:** all changes below were applied to a throwaway copy at `/tmp/val` and verified:
`bun test` → **22 pass / 0 fail**, `bun x tsc --noEmit` → **exit 0**. The repo itself is unmodified.

---

## Baseline (reproduced)

```
bun test           → 13 pass, 9 fail  (22 tests, 4 files)
bun x tsc --noEmit → 14 errors
```

Root causes are four independent defects plus one tsconfig gap. All are documented as
intentional in `README.md` §"Known issues" (lines 23–26), which corroborates the diagnosis.
Note the README's own issue list omits the tsconfig `types` gap — item 5 below is additional.

| # | Defect | Fixes |
|---|--------|-------|
| 1 | `paginate()` is a stub that throws | 7 tests |
| 2 | `User.userName` vs `username` mismatch | 5 type errors |
| 3 | `auth.ts` public-method list has lowercase `"post"` | 1 test |
| 4 | `badRequest` used but not imported in `users.ts` | 1 test + 1 type error |
| 5 | Root tsconfig has no `types` array → no `process`, no `bun:test` | 8 type errors |

Test↔defect mapping: defect 3 fixes `auth middleware > POST /users is public`; defect 4 fixes
`POST /users > returns 400 for missing fields`; defect 1 fixes the 7 `paginate` tests.

### Severity

- **Critical (blocks green build):** all five items. Nothing here is optional.
- **Info (non-blocking, deliberate for this corpus):** the `POST` route is intentionally
  unauthenticated (`auth.test.ts:20` — *"POST is intentionally public — the API allows
  unauthenticated writes"*). Do **not** "harden" this; the test asserts `201` without a token.
  See §Security note.

---

## 1. `packages/shared/src/utils/pagination.ts` — implement the stub

### Contract derived from `packages/shared/test/pagination.test.ts`

Signature is already correct and must not change:
`paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T>`
— `page` is **1-indexed**, `size` is items per page. Return shape is `PaginatedResponse<T>`
from `packages/shared/src/types.ts:24-30`, which already has the right field names:
`data`, `page`, `pageSize`, `total`, `totalPages`. **Do not rename these.**

Note the parameter is `size` but the response field is `pageSize` — the mapping is
`pageSize: size`. This is the one asymmetry in the contract.

Fixture in every test: `items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }))`.

| Test (line) | Call | Assertion |
|---|---|---|
| returns correct page slice (7) | `paginate(items, 1, 10)` | `data.length === 10`; `data[0] === {id:1}`; `data[9] === {id:10}` |
| returns second page (14) | `paginate(items, 2, 10)` | `data[0] === {id:11}` |
| returns partial last page (19) | `paginate(items, 3, 10)` | `data.length === 5` |
| sets total and totalPages (24) | `paginate(items, 1, 10)` | `total === 25`; `totalPages === 3` |
| sets page and pageSize (30) | `paginate(items, 2, 10)` | `page === 2`; `pageSize === 10` |
| out-of-range page (36) | `paginate(items, 99, 10)` | `data.length === 0` |
| handles empty array (41) | `paginate([], 1, 10)` | `data.length === 0`; `total === 0`; `totalPages === 0` |

Derived rules:
- `total` = `items.length` (unpaginated count, **not** page length).
- `totalPages` = `Math.ceil(total / size)`; must be `0` — not `1` — when `total === 0`.
  `Math.ceil(0/10) === 0` satisfies this naturally, so no special-case branch is needed.
- `page` / `pageSize` echo the arguments verbatim; they are **not** clamped to the valid
  range. Out-of-range page `99` still reports `page: 99` (only `data` empties). Do not
  "helpfully" clamp `page` to `totalPages` — no test demands it and it would be surprising.
- Out-of-range page returns `[]`. `Array.prototype.slice` already yields `[]` when
  `start >= length`, so the explicit guard below is belt-and-braces for negative `start`.

### Exact implementation

Replace the whole file body (keep the `import type` line; drop the `TODO` from the docblock):

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
  const totalPages = size > 0 ? Math.ceil(total / size) : 0
  const start = (page - 1) * size
  const data = start >= 0 && start < total ? items.slice(start, start + size) : []

  return { data, page, pageSize: size, total, totalPages }
}
```

Untested edge cases this handles defensively (verified by probe, no test asserts them —
included only because they'd otherwise produce nonsense, not to satisfy the suite):

| Input | Result |
|---|---|
| `paginate(items, 0, 10)` | `data: []` (start `-10` → guard trips) |
| `paginate(items, -1, 10)` | `data: []` |
| `paginate(items, 1, 0)` | `data: []`, `totalPages: 0` (no divide-by-zero → `Infinity`) |

The `size > 0` guard is what prevents `totalPages: Infinity` when `size === 0`.

---

## 2. Canonical field name: **`username`** (lowercase `n`)

### Verdict

The test files are the contract and must not change. They use **`username`** exclusively —
11 references across two test files, zero uses of `userName`:

- `packages/api/test/users.test.ts` — lines 21, 23, 25, 31, 49, 52, 53, 61, 69
- `packages/api/test/auth.test.ts` — lines 25, 31

Critically, the tests exercise `username` on **both sides of the boundary**, so no
serialisation shim would satisfy them:
- **inbound to the DB layer** — `db.users.create({ username: "alice", ... })` (`users.test.ts:21,31,69`; `auth.test.ts:31`)
- **outbound over the wire** — `expect(body[0].username).toBe("alice")` (`users.test.ts:25`), `expect(body.username).toBe("alice")` (`users.test.ts:53`)
- **as an HTTP request body field** — `JSON.stringify({ username: "alice", ... })` (`users.test.ts:49,61`; `auth.test.ts:25`)

Therefore the shared `User` type must be renamed to `username`. `packages/api/src/routes/users.ts`
already uses `username` and is **correct as-is** on this point — the type is the outlier.
The README (line 24) independently confirms: *"`User.userName` should be `username` to match API usage."*

### Files referencing the wrong name (`userName`) — exhaustive

| File | Line | Action |
|---|---|---|
| `packages/shared/src/types.ts` | 11 | **Rename** `userName: string` → `username: string`; drop the trailing `// BUG:` comment |
| `packages/shared/src/types.ts` | 4–6 | **Delete** the stale `BUG:` docblock paragraph describing the mismatch |
| `README.md` | 24 | Optional housekeeping — known-issues entry is now resolved. This corpus deliberately documents its bugs, so **leave it** unless the user wants the list pruned. |

No other production file references `userName`. `packages/api/src/lib/db.ts` is generic over
`Omit<User, "id" | "createdAt">` and needs **no change** — it inherits the rename automatically.

### Exact edit to `packages/shared/src/types.ts`

Before (lines 1–14):
```ts
/**
 * Shared types used by both the API and any consumers.
 *
 * BUG: The field is named `userName` here but the API routes reference `username`
 * (lowercase n). This causes a type error in routes/users.ts and a runtime
 * mismatch when serialising responses.
 */

export type User = {
  id: string
  userName: string // BUG: should be `username` to match API usage
  email: string
  createdAt: string
}
```

After:
```ts
/**
 * Shared types used by both the API and any consumers.
 */

export type User = {
  id: string
  username: string
  email: string
  createdAt: string
}
```

Leave `Post`, `PaginatedResponse`, and `ApiError` untouched.

---

## 3. `packages/api/src/middleware/auth.ts` — method case-sensitivity

### The bug

Line 18: `const publicMethods = ["GET", "post"]`

`c.req.method` returns the HTTP method **uppercase** per RFC 9110 §9 (RFC 7231 §4 in the
older numbering) — methods are case-sensitive and by convention uppercase. `Array.includes`
does an exact `===` comparison, so `["GET", "post"].includes("POST")` is `false`. Every POST
therefore falls through to the token check on line 25 and returns 401 unless a valid Bearer
token is present.

This is why `auth middleware > POST /users is public (no token required)` fails: the test
sends no `Authorization` header and expects `201`, but gets `401`.

Note this bug also **masked defect 4**: because POST was rejected at the middleware before
reaching the handler, the missing-`badRequest` `ReferenceError` never fired for the
no-token case. Fixing 3 without 4 would surface a 500 instead of a 400.

### The fix

One-character-class change on line 18:

```ts
const publicMethods = ["GET", "POST"]
```

Also delete the now-stale comment on line 17
(`// BUG: 'post' should be 'POST' — POST is never treated as public`).

The docblock at lines 10–14 describes the bug and its fix; once fixed, delete lines 10–14
(the `BUG:`/`Fix:` paragraphs) and keep the `Policy:` block at lines 6–8, which remains
an accurate description of intended behaviour.

**Optional robustness (not required by any test — flag to user, don't apply unilaterally):**
normalising with `c.req.method.toUpperCase()` would make the check case-insensitive. It is
strictly unnecessary — Hono normalises the method — and arguably wrong, since a lowercase
`post` on the wire is a malformed request that *should* not be silently accepted. Recommend
**not** doing this; the literal fix is correct and minimal.

---

## 4. `packages/api/src/routes/users.ts` — missing `badRequest` import

### Where it's exported from

`packages/api/src/lib/errors.ts:7`:

```ts
export function badRequest(c: Context, msg = "Bad request") {
  return c.json({ error: msg, status: 400 }, 400)
}
```

Same module that already supplies `notFound` (line 3) — so this is purely a matter of adding
the named import to the existing statement. `packages/api/src/routes/posts.ts:3` shows the
correct, already-working pattern: `import { notFound, badRequest } from "../lib/errors"`.

### The fix

Line 3, change:
```ts
import { notFound } from "../lib/errors"
```
to:
```ts
import { notFound, badRequest } from "../lib/errors"
```

Delete the stale comment block at lines 4–6 and the inline `// BUG:` comment at line 23.

This resolves both `TS2552: Cannot find name 'badRequest'` at (24,12) and the runtime
`ReferenceError` that made `POST /users > returns 400 for missing fields` fail — currently
the handler throws on line 24 instead of returning 400.

`errors.ts` needs **no change**; `unauthorized` there is currently unused but harmless —
leave it (removing it is out of scope and would be a needless API reduction).

---

## 5. tsconfig — `process` and `bun:test` type errors

### Dependency audit: nothing needs installing

Both type packages are **already present** in the Bun store:

```
node_modules/.bun/bun-types@1.4.2/       → symlinked to node_modules/bun-types  ✓
node_modules/.bun/@types+node@26.5.0/    → NOT symlinked into node_modules/@types  ✗
node_modules/.bun/undici-types@8.9.0/    (transitive dep of @types/node)
```

`node_modules/bun-types/index.d.ts:5` opens with `/// <reference types="node" />`, and
`bun-types` declares `@types/node: "*"` as a real dependency — so `@types/node@26.5.0` is
reachable *through* `bun-types` via its own nested symlink:

```
node_modules/.bun/bun-types@1.4.2/node_modules/@types/node → ../../../@types+node@26.5.0/node_modules/@types/node
```

`bun:test` is declared at `node_modules/bun-types/test.d.ts:16` (`declare module "bun:test" { ... }`).

So both globals are available; TypeScript just isn't loading them.

### Why the errors occur

The root `tsconfig.json` has **no `types` array**. Default behaviour is to auto-include every
package under `node_modules/@types` — but the root `node_modules/@types` directory **does not
exist** in this Bun-isolated layout (only `bun-types` and `typescript` are symlinked at root).
So zero type packages get loaded, and `bun-types` is never pulled in because nothing imports
it directly. Result: no `process` global (TS2580 × 4) and no `bun:test` module (TS2307 × 4).

### The fix — one line in the root `tsconfig.json`

Add `"types": ["bun-types"]` to `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["bun-types"],
    "skipLibCheck": true,
    "paths": {
      "@e2e/shared": ["./packages/shared/src/index.ts"]
    }
  },
  "include": ["packages/*/src/**/*", "packages/*/test/**/*"]
}
```

Naming `bun-types` explicitly makes TS resolve it from root `node_modules/bun-types`, which
transitively pulls in `@types/node` through its `/// <reference types="node" />` — giving
both `process` and `bun:test` in one entry. Measured effect in isolation: **14 errors → 6**
(the remaining 6 being defects 2 and 4).

`lib` needs no change: `target: ES2022` implies `lib: ES2022`, and DOM-ish globals
(`Request`, `Response`, `fetch`) used by Hono come from `bun-types`, not `lib.dom`.

### ⚠️ Two traps for the implementer

1. **Do NOT write `"types": ["bun-types", "node"]`.** This *fails*:
   ```
   error TS2688: Cannot find type definition file for 'node'.
   ```
   A bare `"node"` entry is resolved against `node_modules/@types/node` from the project
   root, which doesn't exist here. `@types/node` must come in transitively via `bun-types`.
   Verified both ways.
2. **No per-package tsconfig is needed.** Neither `packages/api` nor `packages/shared` has a
   `tsconfig.json`, and none should be added — the root config's
   `include: ["packages/*/src/**/*", "packages/*/test/**/*"]` already covers src *and* test
   files in both packages, and `bun x tsc --noEmit` from the root is the checked command.
   A separate test-only tsconfig would not be picked up by that command.

### Do not touch `package.json`

`bun-types` is already in root `devDependencies` (`"bun-types": "latest"`). No dependency
additions, no version pins, no lockfile changes. There is no lockfile committed
(`bun.lock`/`bun.lockb` absent), so nothing to regenerate.

---

## File-by-file change list

| # | File | Change | Resolves |
|---|---|---|---|
| 1 | `packages/shared/src/utils/pagination.ts` | Replace stub body with implementation in §1; remove `TODO` from docblock | 7 tests |
| 2 | `packages/shared/src/types.ts` | L11 `userName` → `username`, drop inline `// BUG:`; delete `BUG:` paragraph L4–6 | 5 type errors |
| 3 | `packages/api/src/middleware/auth.ts` | L18 `"post"` → `"POST"`; delete `// BUG:` L17 and `BUG:`/`Fix:` docblock L10–14 | 1 test |
| 4 | `packages/api/src/routes/users.ts` | L3 add `badRequest` to existing import; delete stale comments L4–6 and L23 | 1 test + 1 type error |
| 5 | `tsconfig.json` | Add `"types": ["bun-types"]` to `compilerOptions` | 8 type errors |

**Explicitly out of scope / must not change:**
- Any file under `packages/*/test/` — the four test files are the contract.
- `package.json` (root or package-level) — no dependency changes.
- `packages/api/src/lib/db.ts` — generic over `User`, inherits the rename.
- `packages/api/src/lib/errors.ts` — `badRequest` already exported correctly.
- `packages/api/src/routes/posts.ts`, `src/index.ts`, `middleware/validate.ts`, `utils/slugify.ts` — all correct.
- `README.md` — optional only; the known-issues list is deliberate corpus documentation.

Suggested commit split (or a single commit — the changes are small and interlocking):
one commit for the tsconfig/type-resolution fix, one for the three code defects, one for
the pagination implementation. Note defects 3 and 4 should land **together** (see §3).

---

## Verification

```bash
bun test && bun x tsc --noEmit
```

Expected after all five changes (confirmed in the `/tmp/val` scratch copy):

```
bun test v1.4.2
 22 pass
 0 fail
 37 expect() calls
Ran 22 tests across 4 files.

tsc --noEmit → exit 0
```

Note `bun test` from the root already recurses (root script is `bun test --recursive`),
picking up all 4 test files across both packages.

---

## Security note (ISM / non-blocking)

Flagged for awareness only — **do not "fix" as part of this work**, it would break
`auth.test.ts:19-28`.

This is an e2e **test corpus**, not a deployed service, so the following are acceptable here
but would be findings in a real system:

- **Unauthenticated writes.** `POST` is on the public allow-list by design, so `POST /users`
  and `POST /posts` create records with no authentication. In a production service this
  conflicts with ISM-1546 (authenticate users to systems) and the least-privilege intent
  behind ISM-1175.
- **Static shared bearer token with a hardcoded fallback.** `auth.ts:25` —
  `process.env.API_TOKEN ?? "test-token"` — means a missing env var silently yields a known
  credential. Real systems: fail closed instead, and use per-user credentials (ISM-1546) with
  MFA for privileged access (Essential Eight — MFA, ML2+).
- **Non-constant-time token comparison.** `token !== (...)` short-circuits, so it is
  theoretically timing-observable. Use a constant-time compare for real secrets.
- **No audit logging** of authentication decisions (ISM-2094 / ISM-0585 — log security-relevant
  events). Nothing here records auth failures.

None of these are in scope for making the build green, and no data-sovereignty concerns arise:
the app is in-memory only (`lib/db.ts` uses `Map`), with no outbound network calls, no
persistence, and therefore no data leaving the AU boundary.
