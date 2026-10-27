import type { PaginatedResponse } from "../types"

export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const start = (page - 1) * size
  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  }
}
