import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * Pages are 1-indexed. Out-of-range requests — whether above the last page or
 * below page 1 — yield an empty `data` array rather than falling back to a
 * different page's contents. A non-positive `size` is likewise treated as
 * out-of-range instead of being passed through to `Array.prototype.slice`,
 * whose negative-index semantics would otherwise return items while
 * `totalPages` reported 0.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = size > 0 ? Math.ceil(total / size) : 0
  const inRange = page >= 1 && size >= 1
  const start = Math.max(0, (page - 1) * size)
  const data = inRange && start < total ? items.slice(start, start + size) : []

  return { data, page, pageSize: size, total, totalPages }
}
