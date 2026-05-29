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
