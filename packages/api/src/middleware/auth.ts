import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Method comparison is case-insensitive: HTTP methods are uppercase per
 * RFC 7231, but normalising both sides avoids the allow-list silently
 * failing on casing differences.
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
