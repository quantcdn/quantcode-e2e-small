import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Method names are compared against `c.req.method`, which is always uppercase
 * per RFC 7231, so the allow-list entries must be uppercase too.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
