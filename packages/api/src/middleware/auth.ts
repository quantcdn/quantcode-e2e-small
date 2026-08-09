import type { MiddlewareHandler } from "hono"
import { timingSafeEqual } from "node:crypto"
import { unauthorized } from "../lib/errors"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * HTTP methods are case-sensitive and uppercase per RFC 7231, but the incoming
 * method is normalised before comparison so the allow-list cannot be bypassed
 * or wrongly missed by a differently-cased method token.
 *
 * NOTE (S-3, docs/plans/2026-08-09-auth-and-user-creation-security-assessment.md):
 * this allow-list is keyed on method only, with no path component, and is applied
 * globally via app.use("*"). Every GET/POST route therefore inherits public access
 * silently, including routes added in future. Replacing this with an explicit
 * route+method list is deferred — it needs sign-off because auth.test.ts pins the
 * current public-POST behaviour deliberately.
 */
const PUBLIC_METHODS: readonly string[] = ["GET", "POST"]

/** RFC 6750 §2.1 — the credential must be presented with the `Bearer` scheme. */
const BEARER = /^Bearer (.+)$/

/**
 * Resolve the expected token, failing closed when it is absent.
 *
 * Read lazily rather than at module scope: the test suite sets process.env.API_TOKEN
 * in beforeEach, which runs after import time, so a module-level throw would break
 * the suite. There is deliberately no fallback value — a hardcoded default would be
 * a credential in source control (CWE-798, ISM-1402), and a missing secret must deny
 * access rather than silently authenticate against a publicly known string.
 */
function expectedToken(): string | undefined {
  const token = process.env.API_TOKEN
  return token && token.length > 0 ? token : undefined
}

/** Constant-time comparison to avoid leaking the shared prefix length (CWE-208). */
function tokensMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) {
    return false
  }
  return timingSafeEqual(a, b)
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const method = c.req.method.toUpperCase()

  if (PUBLIC_METHODS.includes(method)) {
    return next()
  }

  const expected = expectedToken()
  if (!expected) {
    return unauthorized(c)
  }

  const match = BEARER.exec(c.req.header("Authorization") ?? "")
  if (!match) {
    return unauthorized(c)
  }

  if (!tokensMatch(match[1]!, expected)) {
    return unauthorized(c)
  }

  return next()
}
