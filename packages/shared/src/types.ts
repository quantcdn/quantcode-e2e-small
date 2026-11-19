/**
 * Shared types used by both the API and any consumers.
 *
 * BUG: The field is named `userName` here but the API routes reference `username`
 * (lowercase n). This causes a type error in routes/users.ts and a runtime
 * mismatch when serialising responses.
 */

export type User = {
  id: string
  username: string
  email: string
  createdAt: string
}

export type Post = {
  id: string
  authorId: string
  title: string
  body: string
  createdAt: string
}

export type PaginatedResponse<T> = {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ApiError = {
  error: string
  status: number
}
