import { describe, test, expect, beforeEach } from "bun:test"
import app from "../src/index"
import { db } from "../src/lib/db"

const TOKEN = "test-token"

beforeEach(() => {
  db.users.clear()
  db.posts.clear()
  process.env.API_TOKEN = TOKEN
})

describe("auth middleware", () => {
  test("GET /users is public (no token required)", async () => {
    const res = await app.request("/users")
    expect(res.status).toBe(200)
  })

  test("POST /users is public (no token required)", async () => {
    // POST is intentionally public — the API allows unauthenticated writes.
    // BUG in auth.ts causes this to return 401 instead of 201.
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alice", email: "alice@example.com" }),
    })
    expect(res.status).toBe(201)
  })

  test("DELETE /users/:id without token returns 401", async () => {
    const user = db.users.create({ username: "alice", email: "alice@example.com" })
    const res = await app.request(`/users/${user.id}`, { method: "DELETE" })
    expect(res.status).toBe(401)
  })
})
