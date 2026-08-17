import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page, returned as `pageSize`
 *
 * Pages beyond the end of the array yield an empty `data` array.
 * An empty input yields a `totalPages` of 0.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / size)
  const start = (page - 1) * size
  return {
    data: items.slice(start, start + size),
    page,
    pageSize: size,
    total,
    totalPages,
  }
}
