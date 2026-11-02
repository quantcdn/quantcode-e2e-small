import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET (all routes)                → public (no token required)
 *   POST /users (or /users/)        → public (no token required)
 *   POST (any other route)          → require Bearer token
 *   PUT, DELETE, PATCH              → require Bearer token
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const method = c.req.method
  const isPublicPost = method === "POST" && /^\/users\/?$/.test(c.req.path)

  if (method === "GET" || isPublicPost) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
