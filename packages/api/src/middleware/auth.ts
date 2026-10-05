import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Method tokens are case-sensitive and conventionally uppercase per RFC 9110,
 * so the incoming method is normalised before being matched against the
 * allow-list to keep the comparison deterministic.
 */
const PUBLIC_METHODS = ["GET", "POST"] as const

export const authMiddleware: MiddlewareHandler = async (c, next) => {
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
