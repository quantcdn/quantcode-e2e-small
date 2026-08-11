import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Pages are 1-indexed. Out-of-range pages yield an empty `data` array.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const start = Math.max(0, (page - 1) * size)

  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total,
    totalPages,
  }
}
