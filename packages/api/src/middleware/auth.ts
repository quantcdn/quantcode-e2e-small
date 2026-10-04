import { createHash, timingSafeEqual } from "node:crypto"
import type { MiddlewareHandler } from "hono"
import { unauthorized } from "../lib/errors"

const BEARER_PREFIX = "Bearer "

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest()
}

function tokensMatch(presented: string, expected: string): boolean {
  return timingSafeEqual(sha256(presented), sha256(expected))
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header || !header.startsWith(BEARER_PREFIX)) return null
  const token = header.slice(BEARER_PREFIX.length)
  return token.length > 0 ? token : null
}

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const publicMethods = ["GET", "POST"]

  if (publicMethods.includes(c.req.method)) {
    return next()
  }

  const expected = process.env.API_TOKEN
  if (!expected) {
    return c.json({ error: "Server misconfigured", status: 500 }, 500)
  }

  const token = extractBearerToken(c.req.header("Authorization"))
  if (!token || !tokensMatch(token, expected)) {
    return unauthorized(c)
  }

  return next()
}