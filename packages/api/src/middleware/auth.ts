import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * HTTP method tokens are case-sensitive and uppercase per RFC 9110, but the
 * request method is normalised before the allow-list check so that a
 * differently-cased method can neither bypass nor be wrongly denied by the
 * public-method allow-list.
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
