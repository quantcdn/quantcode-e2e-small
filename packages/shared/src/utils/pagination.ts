import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const start = (page - 1) * size
  const data = items.slice(start, start + size)
  const total = items.length

  return {
    data,
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  }
}
