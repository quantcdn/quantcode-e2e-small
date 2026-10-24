import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * HTTP method tokens are case-sensitive and uppercase per RFC 9110, so the
 * allow-list is uppercase and the incoming method is normalised before
 * comparison to ensure the check cannot be bypassed or mis-matched by casing.
 */
const PUBLIC_METHODS = ["GET", "POST"]

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.includes(c.req.method.toUpperCase())) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
