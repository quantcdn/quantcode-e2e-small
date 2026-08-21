import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array rather than throwing.
 * An empty input yields `total: 0` and `totalPages: 0`.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Math.max(0, Math.trunc(size))
  const currentPage = Math.max(1, Math.trunc(page))
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (currentPage - 1) * pageSize
  const data = pageSize > 0 ? items.slice(start, start + pageSize) : []

  return {
    data,
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
