import { Hono } from "hono"
import { db } from "../lib/db"
import { notFound, badRequest } from "../lib/errors"
import { auditLog } from "../lib/audit"
import { validateFields, EMAIL_PATTERN, USERNAME_PATTERN } from "../middleware/validate"

const router = new Hono()

const USER_RULES = {
  username: { maxLength: 64, pattern: USERNAME_PATTERN },
  email: { maxLength: 254, pattern: EMAIL_PATTERN },
}

router.get("/", (c) => {
  return c.json(db.users.findAll())
})

router.get("/:id", (c) => {
  const user = db.users.findById(c.req.param("id"))
  if (!user) return notFound(c)
  return c.json(user)
})

router.post("/", async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.username || !body.email) {
    return badRequest(c, "username and email are required")
  }
  const invalid = validateFields(body, USER_RULES)
  if (invalid) return badRequest(c, invalid)

  // Allow-list the persisted fields so caller-supplied `id`/`createdAt` cannot be injected;
  // db.users.create overrides them a second time as defence in depth.
  const user = db.users.create({ username: body.username, email: body.email })
  auditLog("user.created", c, { userId: user.id })
  return c.json(user, 201)
})

router.delete("/:id", (c) => {
  const id = c.req.param("id")
  const ok = db.users.delete(id)
  if (!ok) return notFound(c)
  auditLog("user.deleted", c, { userId: id })
  return c.json({ deleted: true })
})

export { router as usersRouter }
