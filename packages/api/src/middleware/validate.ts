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

/**
 * Per-field constraints for validated string input (ISM-1238, CWE-20).
 */
export type FieldRule = {
  maxLength: number
  pattern?: RegExp
}

/**
 * Validate that each named field is a string within bounds and matching its format.
 *
 * Rejects non-string types (objects, arrays, numbers, booleans) which would otherwise be
 * persisted verbatim, and enforces an upper length bound so unbounded input cannot be used
 * to exhaust memory.
 *
 * Returns an error message, or `null` when the input is acceptable.
 */
export function validateFields(
  body: Record<string, unknown>,
  rules: Record<string, FieldRule>,
): string | null {
  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field]

    if (typeof value !== "string") {
      return `${field} must be a string`
    }
    if (value.length === 0) {
      return `${field} is required`
    }
    if (value.length > rule.maxLength) {
      return `${field} must be at most ${rule.maxLength} characters`
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${field} format is invalid`
    }
  }
  return null
}

/** Conservative single-line email shape check — deliberately not RFC 5322 exhaustive. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** Usernames are restricted to an unambiguous, non-injectable character set. */
export const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/
