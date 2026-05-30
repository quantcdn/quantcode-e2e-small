import type { MiddlewareHandler } from "hono"

declare const Bun: { env: Record<string, string | undefined> } | undefined

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * BUG: The allow-list check uses `'post'` (lowercase) instead of `'POST'`.
 * HTTP methods are always uppercase per RFC 7231, so POST is never matched
 * as a public method — POST requests incorrectly require a token.
 *
 * Fix: change `'post'` to `'POST'` in the public methods array.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // BUG: 'post' should be 'POST' — POST is never treated as public
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  const apiToken = (typeof Bun !== "undefined" ? Bun?.env.API_TOKEN : undefined) ?? "test-token"
  if (!token || token !== apiToken) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
