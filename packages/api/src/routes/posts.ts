import { Hono } from "hono"
import { db } from "../lib/db"
import { notFound, badRequest } from "../lib/errors"

const router = new Hono()

router.get("/", (c) => {
  const authorId = c.req.query("authorId")
  const posts = authorId ? db.posts.findByAuthor(authorId) : db.posts.findAll()
  return c.json(posts)
})

router.get("/:id", (c) => {
  const post = db.posts.findById(c.req.param("id"))
  if (!post) return notFound(c)
  return c.json(post)
})

router.post("/", async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.authorId || !body.title || !body.body) {
    return badRequest(c, "authorId, title, and body are required")
  }
  const post = db.posts.create({ authorId: body.authorId, title: body.title, body: body.body })
  return c.json(post, 201)
})

router.delete("/:id", (c) => {
  const ok = db.posts.delete(c.req.param("id"))
  if (!ok) return notFound(c)
  return c.json({ deleted: true })
})

export { router as postsRouter }
