import type { MiddlewareHandler } from "hono"
import { createHash, timingSafeEqual } from "node:crypto"
import { auditLog } from "../lib/audit"

/**
 * Simple token-based auth middleware.
 *
 * Policy:
 *   GET, POST  → public (no token required)
 *   PUT, DELETE, PATCH → require Bearer token
 *
 * The shared static token authenticates a secret, not an identity, so it provides no
 * per-actor attribution and no authorization model. See
 * docs/plans/2026-08-18-api-auth-security-assessment.md (W4) — this should be replaced
 * with per-identity credentials before any production use.
 */
const PUBLIC_METHODS = ["GET", "POST"]

const BEARER = /^Bearer (\S+)$/

/**
 * Compare two secrets in constant time (ISM-1546, CWE-208).
 *
 * Both sides are SHA-256 digested first so that `timingSafeEqual` always receives
 * equal-length buffers — it throws on a length mismatch, and comparing raw lengths
 * would itself leak the secret's length.
 */
function secretsMatch(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest()
  const hb = createHash("sha256").update(b, "utf8").digest()
  return timingSafeEqual(ha, hb)
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  if (PUBLIC_METHODS.includes(c.req.method.toUpperCase())) {
    return next()
  }

  // Read per-request rather than at module load: there is no fail-open default, so a
  // missing API_TOKEN must deny rather than fall back to a well-known value
  // (ISM-1546, ISM-0421, CWE-798).
  const expected = process.env.API_TOKEN
  if (!expected) {
    auditLog("auth.misconfigured", c, { reason: "API_TOKEN is not set" })
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  const token = BEARER.exec(c.req.header("Authorization") ?? "")?.[1]
  if (!token || !secretsMatch(token, expected)) {
    auditLog("auth.failure", c, { reason: token ? "invalid token" : "missing or malformed Authorization header" })
    return c.json({ error: "Unauthorized", status: 401 }, 401)
  }

  return next()
}