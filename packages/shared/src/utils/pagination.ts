import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array while still reporting the
 * true `total` and `totalPages` for the underlying collection.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : 1
  const requestedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const totalPages = Math.ceil(total / pageSize)

  const start = (requestedPage - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return {
    data,
    page: requestedPage,
    pageSize,
    total,
    totalPages,
  }
}
