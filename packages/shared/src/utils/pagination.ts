import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Pages beyond the end of the array yield an empty `data` array rather than
 * throwing. `page` and `size` are normalised to positive integers so that a
 * caller-supplied value can never produce a negative slice or an `Infinity`
 * page count.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Math.max(1, Math.trunc(size) || 1)
  const pageNumber = Math.max(1, Math.trunc(page) || 1)
  const total = items.length
  const start = (pageNumber - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    page: pageNumber,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}
