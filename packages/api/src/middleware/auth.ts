import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * HTTP methods are case-sensitive and uppercase per RFC 7231 §4. The incoming
 * method is normalised before comparison so the allow-list cannot be bypassed
 * or mis-matched by non-canonical casing.
 */
const PUBLIC_METHODS = ["GET", "POST"] as const

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.includes(c.req.method.toUpperCase() as (typeof PUBLIC_METHODS)[number])) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
