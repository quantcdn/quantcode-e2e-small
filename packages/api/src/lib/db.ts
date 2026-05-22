/**
 * In-memory data store for the e2e API.
 */
import type { User, Post } from "@e2e/shared"

const users = new Map<string, User>()
const posts = new Map<string, Post>()
let uid = 1
let pid = 1

export const db = {
  users: {
    findAll: (): User[] => Array.from(users.values()),
    findById: (id: string): User | undefined => users.get(id),
    create: (data: Omit<User, "id" | "createdAt">): User => {
      const user: User = { ...data, id: String(uid++), createdAt: new Date().toISOString() }
      users.set(user.id, user)
      return user
    },
    delete: (id: string): boolean => users.delete(id),
    clear: () => {
      users.clear()
      uid = 1
    },
  },
  posts: {
    findAll: (): Post[] => Array.from(posts.values()),
    findById: (id: string): Post | undefined => posts.get(id),
    findByAuthor: (authorId: string): Post[] => Array.from(posts.values()).filter((p) => p.authorId === authorId),
    create: (data: Omit<Post, "id" | "createdAt">): Post => {
      const post: Post = { ...data, id: String(pid++), createdAt: new Date().toISOString() }
      posts.set(post.id, post)
      return post
    },
    delete: (id: string): boolean => posts.delete(id),
    clear: () => {
      posts.clear()
      pid = 1
    },
  },
}
