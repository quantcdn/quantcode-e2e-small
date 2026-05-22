import type { Context } from "hono"

export function notFound(c: Context, msg = "Not found") {
  return c.json({ error: msg, status: 404 }, 404)
}

export function badRequest(c: Context, msg = "Bad request") {
  return c.json({ error: msg, status: 400 }, 400)
}

export function unauthorized(c: Context, msg = "Unauthorized") {
  return c.json({ error: msg, status: 401 }, 401)
}
