import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 */
const PUBLIC_METHODS = ["GET", "POST"] as const

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // HTTP methods are case-sensitive and uppercase per RFC 7231; normalise
  // defensively so the allow-list cannot be bypassed or mis-matched by casing.
  const method = c.req.method.toUpperCase()

  if (PUBLIC_METHODS.includes(method as (typeof PUBLIC_METHODS)[number])) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
