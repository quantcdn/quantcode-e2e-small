import type { PaginatedResponse } from "../types"

export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / size)
  const start = (page - 1) * size
  const data = items.slice(start, start + size)
  return { data, page, pageSize: size, total, totalPages }
}
