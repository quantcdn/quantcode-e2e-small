import { Hono } from "hono"
import { db } from "../lib/db"
import { notFound, badRequest } from "../lib/errors"
import { auditLog } from "../lib/audit"
import { validateFields } from "../middleware/validate"

const router = new Hono()

const POST_RULES = {
  authorId: { maxLength: 64 },
  title: { maxLength: 200 },
  body: { maxLength: 10_000 },
}

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
  const invalid = validateFields(body, POST_RULES)
  if (invalid) return badRequest(c, invalid)

  const post = db.posts.create({ authorId: body.authorId, title: body.title, body: body.body })
  auditLog("post.created", c, { postId: post.id })
  return c.json(post, 201)
})

router.delete("/:id", (c) => {
  const id = c.req.param("id")
  const ok = db.posts.delete(id)
  if (!ok) return notFound(c)
  auditLog("post.deleted", c, { postId: id })
  return c.json({ deleted: true })
})

export { router as postsRouter }
