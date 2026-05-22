import type { MiddlewareHandler } from "hono"

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
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  const env = (globalThis as unknown as { process?: { env: Record<string, string> }; Bun?: { env: Record<string, string> } })
  const envToken = env.Bun?.env.API_TOKEN ?? env.process?.env.API_TOKEN ?? "test-token"
  if (!token || token !== envToken) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
