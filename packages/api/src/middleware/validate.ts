import type { MiddlewareHandler } from "hono"

/**
 * Validate that the request body is valid JSON and contains the required fields.
 */
export function requireFields(fields: string[]): MiddlewareHandler {
  return async (c, next) => {
    let body: Record<string, unknown>
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: "Invalid JSON body", status: 400 }, 400)
    }
    const missing = fields.filter((f) => !(f in body) || body[f] === undefined || body[f] === "")
    if (missing.length > 0) {
      return c.json({ error: `Missing required fields: ${missing.join(", ")}`, status: 400 }, 400)
    }
    c.set("body", body)
    return next()
  }
}
