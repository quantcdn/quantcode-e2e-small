import { describe, test, expect, beforeEach } from "bun:test"
import app from "../src/index"
import { db } from "../src/lib/db"

const TOKEN = "test-token"
const auth = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }

beforeEach(() => {
  db.users.clear()
  db.posts.clear()
  process.env.API_TOKEN = TOKEN
})

describe("GET /posts", () => {
  test("returns all posts", async () => {
    db.posts.create({ authorId: "1", title: "Hello", body: "World" })
    const res = await app.request("/posts")
    expect(res.status).toBe(200)
    const body = (await res.json()) as unknown[]
    expect(body).toHaveLength(1)
  })

  test("filters by authorId", async () => {
    db.posts.create({ authorId: "1", title: "Post 1", body: "..." })
    db.posts.create({ authorId: "2", title: "Post 2", body: "..." })
    const res = await app.request("/posts?authorId=1")
    const body = (await res.json()) as { authorId: string }[]
    expect(body).toHaveLength(1)
    expect(body[0].authorId).toBe("1")
  })
})

describe("POST /posts", () => {
  test("creates a post", async () => {
    const res = await app.request("/posts", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ authorId: "1", title: "Hello", body: "World" }),
    })
    expect(res.status).toBe(201)
    const post = (await res.json()) as { title: string }
    expect(post.title).toBe("Hello")
  })

  test("returns 400 for missing fields", async () => {
    const res = await app.request("/posts", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ title: "No author" }),
    })
    expect(res.status).toBe(400)
  })
})
