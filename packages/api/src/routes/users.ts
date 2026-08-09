import { Hono } from "hono"
import { db } from "../lib/db"
import { notFound } from "../lib/errors"
import { requireFields, type ValidatedEnv } from "../middleware/validate"

const router = new Hono<ValidatedEnv>()

/** RFC 5321 §4.5.3.1.3 caps a forward-path at 256 octets; 254 is the practical maximum. */
const EMAIL_MAX_LENGTH = 254
const USERNAME_MAX_LENGTH = 64
const EMAIL_PATTERN = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/

/**
 * List users.
 *
 * Email is deliberately omitted from this projection. The route is public (see the
 * S-3 note in middleware/auth.ts), so returning the full record would allow
 * unauthenticated bulk enumeration of every user's email address — a disclosure
 * beyond the primary purpose of collection (APP 6) and a failure to take reasonable
 * steps to protect personal information (APP 11). Callers that need an email must
 * fetch a single user by id.
 */
router.get("/", (c) => {
  const users = db.users.findAll().map(({ id, username, createdAt }) => ({ id, username, createdAt }))
  return c.json(users)
})

router.get("/:id", (c) => {
  const user = db.users.findById(c.req.param("id"))
  if (!user) return notFound(c)
  return c.json(user)
})

router.post(
  "/",
  requireFields({
    username: { maxLength: USERNAME_MAX_LENGTH },
    email: { maxLength: EMAIL_MAX_LENGTH, pattern: EMAIL_PATTERN },
  }),
  (c) => {
    const { username, email } = c.get("validatedBody")
    const user = db.users.create({ username, email })
    return c.json(user, 201)
  },
)

router.delete("/:id", (c) => {
  const ok = db.users.delete(c.req.param("id"))
  if (!ok) return notFound(c)
  return c.json({ deleted: true })
})

export { router as usersRouter }
