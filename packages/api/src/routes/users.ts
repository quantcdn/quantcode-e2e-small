import { Hono } from "hono"
import { db } from "../lib/db"
import { notFound, badRequest } from "../lib/errors"

const router = new Hono()

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
  const user = db.users.create({ username: body.username, email: body.email })
  return c.json(user, 201)
})

router.delete("/:id", (c) => {
  const ok = db.users.delete(c.req.param("id"))
  if (!ok) return notFound(c)
  return c.json({ deleted: true })
})

export { router as usersRouter }
