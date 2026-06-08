import type { PaginatedResponse } from "../types"

export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = size > 0 ? Math.ceil(total / size) : 0
  const start = (page - 1) * size
  const data = items.slice(start, start + size)
  return { data, total, totalPages, page, pageSize: size }
}
