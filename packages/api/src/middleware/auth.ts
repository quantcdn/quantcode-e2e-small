import type { MiddlewareHandler } from "hono"

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  const expected = process.env.API_TOKEN ?? "test-token"
  if (!token || token !== expected) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
