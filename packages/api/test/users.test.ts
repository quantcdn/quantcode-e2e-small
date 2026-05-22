import { describe, test, expect, beforeEach } from "bun:test"
import app from "../src/index"
import { db } from "../src/lib/db"

const TOKEN = "test-token"
const auth = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }

beforeEach(() => {
  db.users.clear()
  process.env.API_TOKEN = TOKEN
})

describe("GET /users", () => {
  test("returns empty array initially", async () => {
    const res = await app.request("/users")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test("returns created users", async () => {
    db.users.create({ username: "alice", email: "alice@example.com" })
    const res = await app.request("/users")
    const body = (await res.json()) as { username: string }[]
    expect(body).toHaveLength(1)
    expect(body[0].username).toBe("alice")
  })
})

describe("GET /users/:id", () => {
  test("returns user by id", async () => {
    const user = db.users.create({ username: "alice", email: "alice@example.com" })
    const res = await app.request(`/users/${user.id}`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { id: string }
    expect(body.id).toBe(user.id)
  })

  test("returns 404 for unknown id", async () => {
    const res = await app.request("/users/999")
    expect(res.status).toBe(404)
  })
})

describe("POST /users", () => {
  test("creates a user", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ username: "alice", email: "alice@example.com" }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as { username: string; id: string }
    expect(body.username).toBe("alice")
    expect(body.id).toBeDefined()
  })

  test("returns 400 for missing fields", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ username: "alice" }),
    })
    expect(res.status).toBe(400)
  })
})

describe("DELETE /users/:id", () => {
  test("deletes a user", async () => {
    const user = db.users.create({ username: "alice", email: "alice@example.com" })
    const res = await app.request(`/users/${user.id}`, {
      method: "DELETE",
      headers: auth,
    })
    expect(res.status).toBe(200)
    expect(db.users.findById(user.id)).toBeUndefined()
  })

  test("returns 404 for unknown id", async () => {
    const res = await app.request("/users/999", {
      method: "DELETE",
      headers: auth,
    })
    expect(res.status).toBe(404)
  })
})
