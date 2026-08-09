import type { MiddlewareHandler } from "hono"
import { badRequest } from "../lib/errors"

/**
 * Rules applied to a single required string field.
 *
 * ISM-1240 requires input received over the internet to be validated, and failing
 * input to be rejected rather than coerced into shape — so every rule below results
 * in a 400, never a silent transformation of the value.
 */
export type FieldRule = {
  /** Maximum accepted length in characters. Bounds unbounded writes (CWE-770). */
  maxLength: number
  /** Optional format constraint, e.g. email shape. */
  pattern?: RegExp
}

/**
 * Env for routers using `requireFields`, exposing the validated body to handlers.
 *
 * Handlers read `c.get("validatedBody")` rather than re-reading `c.req.json()`, so
 * the values they use are the ones that passed validation — there is no path by
 * which an unvalidated field reaches the data layer.
 */
export type ValidatedEnv = {
  Variables: {
    validatedBody: Record<string, string>
  }
}

/** Control characters are rejected in all string input regardless of field. */
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

/**
 * Validate that the request body is valid JSON and that every required field is
 * present, is genuinely a string, and satisfies its length and format rules.
 *
 * The type check is the important part: `c.req.json()` yields `any`, so without a
 * runtime `typeof` guard the API will happily persist a number or a nested object
 * into a field the shared `User` type declares as `string`, breaking every
 * downstream consumer compiled against that type.
 */
export function requireFields(rules: Record<string, FieldRule>): MiddlewareHandler<ValidatedEnv> {
  const names = Object.keys(rules)

  return async (c, next) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return badRequest(c, "Invalid JSON body")
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return badRequest(c, "Body must be a JSON object")
    }

    const source = body as Record<string, unknown>
    const validated: Record<string, string> = {}

    const missing = names.filter((name) => {
      const value = source[name]
      return value === undefined || value === null || value === ""
    })
    if (missing.length > 0) {
      return badRequest(c, `Missing required fields: ${missing.join(", ")}`)
    }

    for (const name of names) {
      const rule = rules[name]
      const value = source[name]

      if (typeof value !== "string") {
        return badRequest(c, `Field "${name}" must be a string`)
      }
      if (CONTROL_CHARS.test(value)) {
        return badRequest(c, `Field "${name}" contains invalid characters`)
      }
      if (value.length > rule.maxLength) {
        return badRequest(c, `Field "${name}" must be at most ${rule.maxLength} characters`)
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return badRequest(c, `Field "${name}" is not a valid format`)
      }

      validated[name] = value
    }

    c.set("validatedBody", validated)
    return next()
  }
}
