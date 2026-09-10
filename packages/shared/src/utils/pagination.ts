import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Pages outside the available range return an empty `data` array rather than
 * throwing, so callers can safely pass through user-supplied query values.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) ? Math.max(0, Math.floor(size)) : 0
  const total = items.length
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0

  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 0
  const inRange = pageSize > 0 && requestedPage >= 1 && requestedPage <= totalPages

  const start = (requestedPage - 1) * pageSize
  const data = inRange ? items.slice(start, start + pageSize) : []

  return { data, page: requestedPage, pageSize, total, totalPages }
}
