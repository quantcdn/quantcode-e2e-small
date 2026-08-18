import type { Context } from "hono"

/**
 * Structured audit logging for security-relevant events (ISM-0580, ISM-0585).
 *
 * Never pass credentials, tokens, or unnecessary personal information in `detail` —
 * records are retained and must not become a secondary disclosure path (APP 11).
 */
export type AuditEvent =
  | "auth.failure"
  | "auth.misconfigured"
  | "user.created"
  | "user.deleted"
  | "post.created"
  | "post.deleted"

export function auditLog(event: AuditEvent, c: Context, detail: Record<string, unknown> = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    sourceIp: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown",
    ...detail,
  }
  console.log(JSON.stringify(entry))
}
