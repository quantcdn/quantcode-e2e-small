import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Method names are compared case-insensitively. RFC 9110 defines methods as
 * case-sensitive uppercase tokens, but normalising here keeps the allow-list
 * from silently failing open or closed if a caller supplies other casing.
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
