import type { PaginatedResponse } from "../types"

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, page, pageSize, total, totalPages }
}


