import type { MiddlewareHandler } from "hono"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Method tokens are case-sensitive and uppercase per RFC 7231 §4.1. The
 * allow-list is compared strictly so that any non-canonical method falls
 * through to the token check (fail closed) rather than matching a public
 * entry.
 */
const PUBLIC_METHODS: ReadonlySet<string> = new Set(["GET", "POST"])

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.has(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token || token !== (process.env.API_TOKEN ?? "test-token")) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
