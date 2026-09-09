import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * HTTP methods are always uppercase per RFC 7231, so the request method is
 * normalised before being matched against the allow-list to keep the check
 * insensitive to casing.
 */
const publicMethods = ["GET", "POST"]

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (publicMethods.includes(c.req.method.toUpperCase())) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
