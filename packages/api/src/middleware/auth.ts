import type { MiddlewareHandler } from "hono"
import { serverError, unauthorized } from "../lib/errors"

const BEARER_PREFIX = "Bearer "

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * Fails closed: if API_TOKEN is not configured, privileged methods are refused
 * rather than falling back to a default token (ISM-1685).
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method.toUpperCase())) {
    return next()
  }

  const expected = process.env.API_TOKEN
  if (!expected) {
    return serverError(c, "Server misconfigured")
  }

  const header = c.req.header("Authorization") ?? ""
  const token = header.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : null
  if (!token || token !== expected) {
    return unauthorized(c)
  }

  return next()
}
