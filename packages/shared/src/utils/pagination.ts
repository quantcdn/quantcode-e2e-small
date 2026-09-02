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
  const pageSize = size > 0 ? size : 0
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0

  const start = (page - 1) * pageSize
  const data = pageSize > 0 && start >= 0 && start < total ? items.slice(start, start + pageSize) : []

  return { data, page, pageSize, total, totalPages }
}
