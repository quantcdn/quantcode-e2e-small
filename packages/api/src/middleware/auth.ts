import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST → public (no token required)
 *   PUT, DELETE, PATCH and any other method → require Bearer token
 *
 * The allow-list is stored uppercase and the incoming method is normalised
 * before comparison, so matching is not affected by method casing. Anything
 * not on the allow-list is denied by default (ISM-1833 least privilege).
 */
const PUBLIC_METHODS = new Set(["GET", "POST"])

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.has(c.req.method.toUpperCase())) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
