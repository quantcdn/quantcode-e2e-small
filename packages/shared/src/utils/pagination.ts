import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages return an empty `data` array rather than throwing, so
 * callers can safely pass through untrusted query parameters.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Math.max(1, Math.floor(size) || 1)
  const currentPage = Math.max(1, Math.floor(page) || 1)
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (currentPage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
