import type { MiddlewareHandler } from "hono"

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  const env = (globalThis as Record<string, unknown>)
  const envVars = (env["process"] as { env?: Record<string, string> } | undefined)?.env
    ?? (env["Bun"] as { env?: Record<string, string> } | undefined)?.env
    ?? {}
  const apiToken = envVars["API_TOKEN"] ?? "test-token"
  if (!token || token !== apiToken) {
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}
