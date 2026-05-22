import { Hono } from "hono"
import { authMiddleware } from "./middleware/auth"
import { usersRouter } from "./routes/users"
import { postsRouter } from "./routes/posts"

const app = new Hono()

app.use("*", authMiddleware)
app.route("/users", usersRouter)
app.route("/posts", postsRouter)

app.get("/health", (c) => c.json({ ok: true }))

export default app
