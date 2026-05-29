import type { MiddlewareHandler } from "hono"

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  const expected = (globalThis as unknown as { Bun?: { env: Record<string, string | undefined> } }).Bun?.env.API_TOKEN ?? "test-token"
  if (!token || token !== expected) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
