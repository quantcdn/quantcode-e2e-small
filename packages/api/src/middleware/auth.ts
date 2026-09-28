import type { MiddlewareHandler } from "hono"
import { timingSafeEqual } from "node:crypto"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST          → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * SECURITY NOTE — do not copy this policy into a real system.
 * Making GET and POST public for *every* route is a deliberate test-fixture
 * choice for this e2e corpus, asserted by packages/api/test/auth.test.ts.
 * It means /users can be read and written unauthenticated, exposing email
 * addresses (personal information under the Privacy Act 1988). A production
 * service must default-deny and opt individual routes into public access
 * instead of allow-listing whole HTTP verbs [ISM-1546, APP-11].
 * See docs/plans/2026-09-28-auth-middleware-security-assessment.md (SEC-004).
 */
const PUBLIC_METHODS = ["GET", "POST"]

const BEARER_SCHEME = /^Bearer (.+)$/

function secretsMatch(presented: string, expected: string): boolean {
  const a = Buffer.from(presented, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.includes(c.req.method.toUpperCase())) {
    return next()
  }

  const expected = process.env.API_TOKEN
  if (!expected) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  const presented = BEARER_SCHEME.exec(c.req.header("Authorization") ?? "")?.[1]
  if (!presented || !secretsMatch(presented, expected)) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
