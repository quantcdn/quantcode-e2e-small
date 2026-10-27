import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * Out-of-range pages yield an empty `data` array rather than throwing.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = Math.max(1, Math.floor(size))
  const currentPage = Math.max(1, Math.floor(page))
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
